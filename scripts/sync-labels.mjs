#!/usr/bin/env node
/**
 * Sync labels from .github/labels.yml to the GitHub repository.
 * Requires: GitHub CLI (`gh`) authenticated with repo scope.
 *
 * Usage: node scripts/sync-labels.mjs
 */

import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const REPO = process.env.GITHUB_REPOSITORY || 'imuniqueshiv/MaintainerAI'
const file = '.github/labels.yml'
const text = readFileSync(file, 'utf8')
const blocks = text.split(/\n- name:\s*/).slice(1)

function gh(args) {
  const result = spawnSync('gh', args, { encoding: 'utf8', shell: true })
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `gh ${args.join(' ')} failed`)
  }
  return result.stdout
}

const existing = new Set(
  JSON.parse(gh(['label', 'list', '--repo', REPO, '--limit', '200', '--json', 'name'])).map(
    (l) => l.name,
  ),
)

for (const block of blocks) {
  const lines = block.trim().split('\n')
  const name = lines[0].trim().replace(/^"|"$/g, '')
  let color = ''
  let description = ''
  for (const line of lines.slice(1)) {
    const trimmed = line.trim()
    if (trimmed.startsWith('color:')) color = trimmed.slice(6).trim().replace(/^"|"$/g, '')
    if (trimmed.startsWith('description:')) {
      description = trimmed.slice(12).trim().replace(/^"|"$/g, '')
    }
  }

  if (existing.has(name)) {
    gh([
      'label',
      'edit',
      name,
      '--repo',
      REPO,
      '--color',
      color,
      '--description',
      description,
    ])
    console.log(`updated: ${name}`)
  } else {
    gh([
      'label',
      'create',
      name,
      '--repo',
      REPO,
      '--color',
      color,
      '--description',
      description,
    ])
    console.log(`created: ${name}`)
  }
}

console.log('Label sync complete.')
