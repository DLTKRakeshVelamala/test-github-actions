'use strict';

const MONTH_PATTERN = /^[A-Za-z]{3}-\d{4}$/;
const PR_BRANCH_PREFIX = 'release/CP-';
const PAGINATE_LIMIT = 100;

function currentMonth() {
  const d = new Date();
  const mon = d.toLocaleString('en-US', { month: 'short' });
  return `${mon}-${d.getFullYear()}`;
}

function loadConfig() {
  return {
    org: process.env.ORG,
    teamSlug: process.env.TEAM_SLUG,
    repoAllowlist: (process.env.REPO_ALLOWLIST || '')
      .split(/[\n,]+/).map(r => r.trim()).filter(Boolean),
    baseBranch: process.env.BASE_BRANCH || 'master',
    month: currentMonth(),
    maxAgeDays: parseInt(process.env.MAX_AGE_DAYS || '30', 10),
    mergeMethod: process.env.MERGE_METHOD || 'merge',
    dryRun: process.env.DRY_RUN === 'true',
    timestamp: new Date()
  };
}

module.exports = { loadConfig, MONTH_PATTERN, PR_BRANCH_PREFIX, PAGINATE_LIMIT };
