'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Auto-merge Approved Release PRs
// Called from .github/workflows/approve-release-pull-requets.yml via github-script
//
// Scans repos for open PRs with source branch matching release/CP-{Month},
// filters by approval status and age, then auto-merges matching PRs.
// ─────────────────────────────────────────────────────────────────────────────

const { loadConfig, PR_BRANCH_PREFIX } = require('./config');
const { validateMonth } = require('./validators');
const { resolveRepoList } = require('./github-api');
const { scanRepo } = require('./process-pr');
const { buildSummaryReport } = require('./report');

module.exports = async ({ github, core }) => {
  const allResults = { merged: [], pending: [], skipped: [], errors: [] };
  const config = loadConfig();

  if (!validateMonth(config.month, core)) return;

  const releaseBranch = `${PR_BRANCH_PREFIX}${config.month}`;

  let repos;
  try {
    repos = await resolveRepoList(github, core, config.org, config.teamSlug, config.repoAllowlist);
  } catch (e) {
    core.setFailed(e.message);
    return;
  }

  for (const { name: repo } of repos) {
    const result = await scanRepo(github, core, config, repo, releaseBranch);
    allResults.merged.push(...result.merged);
    allResults.pending.push(...result.pending);
    allResults.skipped.push(...result.skipped);
    allResults.errors.push(...result.errors);
  }

  const summary = buildSummaryReport(core, config, releaseBranch, repos, allResults);
  await summary.write();

  if (config.dryRun) {
    core.setOutput('pending_count', allResults.pending.length);
    core.info(
      `[Dry Run] Scan complete — ${allResults.pending.length} would be merged, ` +
      `${allResults.skipped.length} skipped, ${allResults.errors.length} errors`
    );
  } else {
    core.info(
      `Release Pull requests operations are done — ${allResults.merged.length} merged, ` +
      `${allResults.skipped.length} skipped, ${allResults.errors.length} errors`
    );
  }
};
