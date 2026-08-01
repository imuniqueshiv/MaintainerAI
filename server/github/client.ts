import { App } from '@octokit/app'
import { Octokit } from '@octokit/rest'
import { assertGitHubAppConfigured } from '@/server/github/config'
import { getInstallationToken, invalidateInstallationToken } from '@/server/github/tokens'
import { withGitHubRetry, toAppError } from '@/server/github/errors'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'github.client' })

let appSingleton: App | null = null

export function getGitHubApp(): App {
  const creds = assertGitHubAppConfigured()
  if (appSingleton) return appSingleton

  appSingleton = new App({
    appId: creds.appId,
    privateKey: creds.privateKey,
    oauth: creds.clientId
      ? {
          clientId: creds.clientId,
          clientSecret: creds.clientSecret ?? '',
        }
      : undefined,
    Octokit,
  })

  return appSingleton
}

/** Reset Octokit App singleton (tests). */
export function resetGitHubAppForTests(): void {
  appSingleton = null
}

/**
 * Octokit authenticated as a GitHub App installation.
 */
export async function getInstallationOctokit(githubInstallationId: number | bigint): Promise<Octokit> {
  const { token } = await getInstallationToken(githubInstallationId)
  return new Octokit({
    auth: token,
    request: {
      timeout: 15_000,
    },
  })
}

export type GitHubRepoMetadata = {
  githubId: bigint
  nodeId: string | null
  name: string
  owner: string
  fullName: string
  description: string | null
  url: string
  language: string | null
  defaultBranch: string | null
  isPrivate: boolean
  archived: boolean
  disabled: boolean
  stars: number
  forks: number
  openIssues: number
  topics: string[]
  permissions: Record<string, boolean> | null
  lastUpdatedGitHub: Date | null
}

function mapRepo(repo: {
  id: number
  node_id?: string
  name: string
  owner: { login: string }
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  default_branch?: string
  private: boolean
  archived?: boolean
  disabled?: boolean
  stargazers_count?: number
  forks_count?: number
  open_issues_count?: number
  topics?: string[]
  permissions?: Record<string, boolean>
  updated_at?: string | null
}): GitHubRepoMetadata {
  return {
    githubId: BigInt(repo.id),
    nodeId: repo.node_id ?? null,
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    defaultBranch: repo.default_branch ?? null,
    isPrivate: repo.private,
    archived: Boolean(repo.archived),
    disabled: Boolean(repo.disabled),
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    topics: repo.topics ?? [],
    permissions: repo.permissions ?? null,
    lastUpdatedGitHub: repo.updated_at ? new Date(repo.updated_at) : null,
  }
}

export async function fetchInstallation(githubInstallationId: number | bigint) {
  try {
    const app = getGitHubApp()
    return await withGitHubRetry(
      () =>
        app.octokit.request('GET /app/installations/{installation_id}', {
          installation_id: Number(githubInstallationId),
        }),
      { label: 'get-installation' },
    )
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listInstallationRepositories(
  githubInstallationId: number | bigint,
  options?: { retried?: boolean },
) {
  try {
    const octokit = await getInstallationOctokit(githubInstallationId)
    const repos: GitHubRepoMetadata[] = []
    let page = 1

    for (;;) {
      const response = await withGitHubRetry(
        () =>
          octokit.request('GET /installation/repositories', {
            per_page: 100,
            page,
          }),
        { label: 'list-install-repos' },
      )

      for (const repo of response.data.repositories) {
        repos.push(mapRepo(repo))
      }

      if (repos.length >= response.data.total_count || response.data.repositories.length === 0) {
        break
      }
      page += 1
      if (page > 50) break
    }

    return repos
  } catch (error) {
    const status = (error as { status?: number }).status
    if (status === 401 && !options?.retried) {
      await invalidateInstallationToken(githubInstallationId)
      log.info(
        { githubInstallationId: String(githubInstallationId) },
        'Retried after token invalidate',
      )
      return listInstallationRepositories(githubInstallationId, { retried: true })
    }
    throw toAppError(error)
  }
}

export async function fetchRepository(
  githubInstallationId: number | bigint,
  owner: string,
  name: string,
): Promise<GitHubRepoMetadata> {
  try {
    const octokit = await getInstallationOctokit(githubInstallationId)
    const response = await withGitHubRetry(
      () => octokit.request('GET /repos/{owner}/{repo}', { owner, repo: name }),
      { label: 'get-repo' },
    )
    return mapRepo(response.data)
  } catch (error) {
    throw toAppError(error)
  }
}

export async function fetchAppRateLimit(githubInstallationId: number | bigint) {
  try {
    const octokit = await getInstallationOctokit(githubInstallationId)
    const response = await withGitHubRetry(() => octokit.request('GET /rate_limit'), {
      label: 'rate-limit',
    })
    return response.data
  } catch (error) {
    throw toAppError(error)
  }
}

/**
 * Verify the signed-in user's GitHub OAuth token can see this App installation.
 * Prevents authenticated users from binding arbitrary installation IDs.
 */
export async function userCanAccessInstallation(
  userAccessToken: string,
  githubInstallationId: number | bigint,
): Promise<boolean> {
  try {
    const octokit = new Octokit({
      auth: userAccessToken,
      request: { timeout: 15_000 },
    })
    const installationId = Number(githubInstallationId)
    let page = 1
    for (;;) {
      const response = await withGitHubRetry(
        () =>
          octokit.request('GET /user/installations', {
            per_page: 100,
            page,
          }),
        { label: 'user-installations' },
      )
      if (response.data.installations.some((i) => i.id === installationId)) {
        return true
      }
      if (
        response.data.installations.length === 0 ||
        page * 100 >= response.data.total_count ||
        page > 20
      ) {
        break
      }
      page += 1
    }
    return false
  } catch (error) {
    log.warn({ err: error }, 'Failed to verify user installation access')
    return false
  }
}

export function buildInstallUrl(options?: { state?: string }): string {
  const creds = assertGitHubAppConfigured()
  const url = new URL(`https://github.com/apps/${creds.slug}/installations/new`)
  if (options?.state) {
    url.searchParams.set('state', options.state)
  }
  return url.toString()
}
