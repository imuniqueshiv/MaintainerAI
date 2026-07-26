/**
 * Prisma seed entrypoint.
 * Phase 1: intentionally empty — no fake/business seed data.
 * Future milestones may seed first-party plugins / templates.
 */
async function main() {
  console.info('MaintainerAI seed: no-op (Phase 1 infrastructure only)')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
