import { getInstallationOctokit } from '@/server/github/client'
import { withGitHubRetry, toAppError } from '@/server/github/errors'

/** Default GitHub list page size used by all sync entity syncers. */
export const SYNC_PAGE_SIZE = 50

export type ListPageOptions = {
  page: number
  perPage?: number
  /** ISO-filter: only return resources updated at or after this timestamp. */
  since?: Date | null
  state?: 'all' | 'open' | 'closed'
}

export type GitHubUserDTO = {
  githubId: number
  login: string
  avatarUrl: string | null
  isBot: boolean
}

export type GitHubIssueDTO = {
  githubId: number
  nodeId: string | null
  number: number
  title: string
  body: string | null
  htmlUrl: string
  state: 'open' | 'closed'
  locked: boolean
  commentsCount: number
  author: GitHubUserDTO | null
  assignees: GitHubUserDTO[]
  labels: Array<{ githubId: number | null; name: string; color: string; description: string | null }>
  milestoneNumber: number | null
  closedAt: Date | null
  githubCreatedAt: Date | null
  githubUpdatedAt: Date | null
}

export type GitHubPullDTO = {
  githubId: number
  nodeId: string | null
  number: number
  title: string
  body: string | null
  htmlUrl: string
  state: 'open' | 'closed'
  draft: boolean
  merged: boolean
  mergeCommitSha: string | null
  baseRef: string | null
  headRef: string | null
  author: GitHubUserDTO | null
  reviewRequests: number
  mergedAt: Date | null
  closedAt: Date | null
  githubCreatedAt: Date | null
  githubUpdatedAt: Date | null
}

export type GitHubLabelDTO = {
  githubId: number | null
  name: string
  color: string
  description: string | null
}

export type GitHubMilestoneDTO = {
  githubId: number
  number: number
  title: string
  description: string | null
  state: string
  dueOn: Date | null
  closedAt: Date | null
  htmlUrl: string | null
  openIssues: number
  closedIssues: number
  githubCreatedAt: Date | null
  githubUpdatedAt: Date | null
}

export type GitHubReleaseDTO = {
  githubId: number
  tagName: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  htmlUrl: string | null
  publishedAt: Date | null
  githubCreatedAt: Date | null
}

export type GitHubBranchDTO = {
  name: string
  sha: string | null
  protected: boolean
}

export type GitHubContributorDTO = {
  githubId: number
  login: string
  avatarUrl: string | null
  isBot: boolean
  contributions: number
}

export type PagedResult<T> = {
  items: T[]
  hasNextPage: boolean
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}

function mapUser(
  user:
    | { id: number; login: string; avatar_url?: string; type?: string }
    | null
    | undefined,
): GitHubUserDTO | null {
  if (!user) return null
  return {
    githubId: user.id,
    login: user.login,
    avatarUrl: user.avatar_url ?? null,
    isBot: user.type === 'Bot' || user.login.endsWith('[bot]'),
  }
}

async function octokitFor(installationId: number | bigint) {
  return getInstallationOctokit(installationId)
}

/**
 * Issues list endpoint also returns pull requests — callers must filter
 * entries containing a `pull_request` key when syncing issues only.
 */
export async function listRepoIssues(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: ListPageOptions,
): Promise<PagedResult<GitHubIssueDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/issues', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
          state: options.state ?? 'all',
          since: options.since ? options.since.toISOString() : undefined,
          sort: 'updated',
          direction: 'asc',
        }),
      { label: 'list-issues' },
    )

    const items = response.data
      .filter((issue) => !('pull_request' in issue && issue.pull_request))
      .map((issue): GitHubIssueDTO => ({
        githubId: issue.id,
        nodeId: issue.node_id ?? null,
        number: issue.number,
        title: issue.title,
        body: issue.body ?? null,
        htmlUrl: issue.html_url,
        state: issue.state === 'closed' ? 'closed' : 'open',
        locked: Boolean(issue.locked),
        commentsCount: issue.comments ?? 0,
        author: mapUser(issue.user),
        assignees: (issue.assignees ?? []).map((a) => mapUser(a)).filter((a): a is GitHubUserDTO => a !== null),
        labels: (issue.labels ?? []).map((label) =>
          typeof label === 'string'
            ? { githubId: null, name: label, color: 'ededed', description: null }
            : {
                githubId: label.id ?? null,
                name: label.name ?? '',
                color: label.color ?? 'ededed',
                description: label.description ?? null,
              },
        ),
        milestoneNumber: issue.milestone?.number ?? null,
        closedAt: toDate(issue.closed_at),
        githubCreatedAt: toDate(issue.created_at),
        githubUpdatedAt: toDate(issue.updated_at),
      }))

    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function fetchIssue(
  owner: string,
  name: string,
  installationId: number | bigint,
  issueNumber: number,
): Promise<GitHubIssueDTO> {
  try {
    const octokit = await octokitFor(installationId)
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
          owner,
          repo: name,
          issue_number: issueNumber,
        }),
      { label: 'get-issue' },
    )
    const issue = response.data
    return {
      githubId: issue.id,
      nodeId: issue.node_id ?? null,
      number: issue.number,
      title: issue.title,
      body: issue.body ?? null,
      htmlUrl: issue.html_url,
      state: issue.state === 'closed' ? 'closed' : 'open',
      locked: Boolean(issue.locked),
      commentsCount: issue.comments ?? 0,
      author: mapUser(issue.user),
      assignees: (issue.assignees ?? []).map((a) => mapUser(a)).filter((a): a is GitHubUserDTO => a !== null),
      labels: (issue.labels ?? []).map((label) =>
        typeof label === 'string'
          ? { githubId: null, name: label, color: 'ededed', description: null }
          : {
              githubId: label.id ?? null,
              name: label.name ?? '',
              color: label.color ?? 'ededed',
              description: label.description ?? null,
            },
      ),
      milestoneNumber: issue.milestone?.number ?? null,
      closedAt: toDate(issue.closed_at),
      githubCreatedAt: toDate(issue.created_at),
      githubUpdatedAt: toDate(issue.updated_at),
    }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listRepoPulls(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: ListPageOptions,
): Promise<PagedResult<GitHubPullDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/pulls', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
          state: options.state ?? 'all',
          sort: 'updated',
          direction: options.since ? 'desc' : 'asc',
        }),
      { label: 'list-pulls' },
    )

    const items = response.data.map(
      (pr): GitHubPullDTO => ({
        githubId: pr.id,
        nodeId: pr.node_id ?? null,
        number: pr.number,
        title: pr.title,
        body: pr.body ?? null,
        htmlUrl: pr.html_url,
        state: pr.state === 'closed' ? 'closed' : 'open',
        draft: Boolean(pr.draft),
        merged: Boolean(pr.merged_at),
        mergeCommitSha: pr.merge_commit_sha ?? null,
        baseRef: pr.base?.ref ?? null,
        headRef: pr.head?.ref ?? null,
        author: mapUser(pr.user),
        reviewRequests: pr.requested_reviewers?.length ?? 0,
        mergedAt: toDate(pr.merged_at),
        closedAt: toDate(pr.closed_at),
        githubCreatedAt: toDate(pr.created_at),
        githubUpdatedAt: toDate(pr.updated_at),
      }),
    )

    // pulls list endpoint has no `since` filter — emulate with desc sort + boundary stop.
    if (options.since) {
      const since = options.since
      const filtered = items.filter((pr) => pr.githubUpdatedAt && pr.githubUpdatedAt >= since)
      const hitOldBoundary = items.some((pr) => pr.githubUpdatedAt && pr.githubUpdatedAt < since)
      return {
        items: filtered,
        hasNextPage: response.data.length === perPage && !hitOldBoundary,
      }
    }

    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function fetchPull(
  owner: string,
  name: string,
  installationId: number | bigint,
  pullNumber: number,
): Promise<GitHubPullDTO> {
  try {
    const octokit = await octokitFor(installationId)
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
          owner,
          repo: name,
          pull_number: pullNumber,
        }),
      { label: 'get-pull' },
    )
    const pr = response.data
    return {
      githubId: pr.id,
      nodeId: pr.node_id ?? null,
      number: pr.number,
      title: pr.title,
      body: pr.body ?? null,
      htmlUrl: pr.html_url,
      state: pr.state === 'closed' ? 'closed' : 'open',
      draft: Boolean(pr.draft),
      merged: Boolean(pr.merged_at) || Boolean(pr.merged),
      mergeCommitSha: pr.merge_commit_sha ?? null,
      baseRef: pr.base?.ref ?? null,
      headRef: pr.head?.ref ?? null,
      author: mapUser(pr.user),
      reviewRequests: pr.requested_reviewers?.length ?? 0,
      mergedAt: toDate(pr.merged_at),
      closedAt: toDate(pr.closed_at),
      githubCreatedAt: toDate(pr.created_at),
      githubUpdatedAt: toDate(pr.updated_at),
    }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listRepoLabels(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: { page: number; perPage?: number },
): Promise<PagedResult<GitHubLabelDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/labels', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
        }),
      { label: 'list-labels' },
    )
    const items = response.data.map(
      (label): GitHubLabelDTO => ({
        githubId: label.id ?? null,
        name: label.name,
        color: label.color,
        description: label.description ?? null,
      }),
    )
    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listRepoMilestones(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: { page: number; perPage?: number; state?: 'all' | 'open' | 'closed' },
): Promise<PagedResult<GitHubMilestoneDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/milestones', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
          state: options.state ?? 'all',
        }),
      { label: 'list-milestones' },
    )
    const items = response.data.map(
      (m): GitHubMilestoneDTO => ({
        githubId: m.id,
        number: m.number,
        title: m.title,
        description: m.description ?? null,
        state: m.state,
        dueOn: toDate(m.due_on),
        closedAt: toDate(m.closed_at),
        htmlUrl: m.html_url ?? null,
        openIssues: m.open_issues ?? 0,
        closedIssues: m.closed_issues ?? 0,
        githubCreatedAt: toDate(m.created_at),
        githubUpdatedAt: toDate(m.updated_at),
      }),
    )
    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listRepoReleases(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: { page: number; perPage?: number },
): Promise<PagedResult<GitHubReleaseDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/releases', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
        }),
      { label: 'list-releases' },
    )
    const items = response.data.map(
      (r): GitHubReleaseDTO => ({
        githubId: r.id,
        tagName: r.tag_name,
        name: r.name ?? null,
        body: r.body ?? null,
        draft: Boolean(r.draft),
        prerelease: Boolean(r.prerelease),
        htmlUrl: r.html_url ?? null,
        publishedAt: toDate(r.published_at),
        githubCreatedAt: toDate(r.created_at),
      }),
    )
    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listRepoBranches(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: { page: number; perPage?: number },
): Promise<PagedResult<GitHubBranchDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/branches', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
        }),
      { label: 'list-branches' },
    )
    const items = response.data.map(
      (b): GitHubBranchDTO => ({
        name: b.name,
        sha: b.commit?.sha ?? null,
        protected: Boolean(b.protected),
      }),
    )
    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}

export async function listRepoContributors(
  owner: string,
  name: string,
  installationId: number | bigint,
  options: { page: number; perPage?: number },
): Promise<PagedResult<GitHubContributorDTO>> {
  try {
    const octokit = await octokitFor(installationId)
    const perPage = options.perPage ?? SYNC_PAGE_SIZE
    const response = await withGitHubRetry(
      () =>
        octokit.request('GET /repos/{owner}/{repo}/contributors', {
          owner,
          repo: name,
          per_page: perPage,
          page: options.page,
          anon: 'false',
        }),
      { label: 'list-contributors' },
    )
    const items = response.data
      .filter((c): c is typeof c & { id: number; login: string } => Boolean(c.id && c.login))
      .map(
        (c): GitHubContributorDTO => ({
          githubId: c.id,
          login: c.login,
          avatarUrl: c.avatar_url ?? null,
          isBot: c.type === 'Bot' || c.login.endsWith('[bot]'),
          contributions: c.contributions ?? 0,
        }),
      )
    return { items, hasNextPage: response.data.length === perPage }
  } catch (error) {
    throw toAppError(error)
  }
}
