'use strict';

function formatInTimeZone(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
}

function buildSummaryReport(core, config, releaseBranch, repos, allResults) {
  const totalScanned = repos.length;
  const totalPending = allResults.pending.length;
  const totalMerged = allResults.merged.length;
  const totalSkipped = allResults.skipped.length;
  const totalErrors = allResults.errors.length;

  const s = core.summary
    .addHeading('🚀 Auto-merge Release PRs Report')
    .addRaw(
      `\n> **Org / Team:** \`${config.org}/${config.teamSlug}\`` +
      ` &nbsp;|&nbsp; **Release Branch:** \`${releaseBranch}\`` +
      ` &nbsp;|&nbsp; **Merge into:** \`${config.baseBranch}\`` +
      ` &nbsp;|&nbsp; **Max age:** ${config.maxAgeDays} days` +
      ` &nbsp;|&nbsp; **Generated:** ${config.timestamp.toUTCString()}` +
      ` (${formatInTimeZone(config.timestamp, 'Asia/Manila')} PHT` +
      `, ${formatInTimeZone(config.timestamp, 'Asia/Kolkata')} IST)\n\n`
    );

  if (config.dryRun) {
    s.addRaw('\n> ⚠️ **Dry Run — no PRs were merged.** Review the list below and approve the merge job to proceed.\n\n');
  }

  if (config.dryRun) {
    s.addHeading('📊 Summary', 3).addTable([
      [
        { data: 'Repos Scanned', header: true },
        { data: '🔍 Would Merge', header: true },
        { data: '⏭️ Skipped', header: true },
        { data: '❌ Errors', header: true }
      ],
      [String(totalScanned), String(totalPending), String(totalSkipped), String(totalErrors)]
    ]);
  } else {
    s.addHeading('📊 Summary', 3).addTable([
      [
        { data: 'Repos Scanned', header: true },
        { data: '✅ Merged', header: true },
        { data: '⏭️ Skipped', header: true },
        { data: '❌ Errors', header: true }
      ],
      [String(totalScanned), String(totalMerged), String(totalSkipped), String(totalErrors)]
    ]);
  }

  if (totalPending > 0) {
    s.addHeading('🔍 PRs that will be merged', 3).addTable([
      [
        { data: 'Repository', header: true },
        { data: 'PR', header: true },
        { data: 'Title', header: true },
        { data: 'Source Branch', header: true }
      ],
      ...allResults.pending.map(r => [
        `<a href="https://github.com/${config.org}/${r.repo}">${r.repo}</a>`,
        `<a href="https://github.com/${config.org}/${r.repo}/pull/${r.number}">#${r.number}</a>`,
        r.title,
        `<code>${r.branch}</code>`
      ])
    ]);
  }

  if (totalMerged > 0) {
    s.addHeading('✅ Merged PRs', 3).addTable([
      [
        { data: 'Repository', header: true },
        { data: 'PR', header: true },
        { data: 'Source Branch', header: true },
        { data: 'Commit', header: true }
      ],
      ...allResults.merged.map(r => [
        `<a href="https://github.com/${config.org}/${r.repo}">${r.repo}</a>`,
        `<a href="https://github.com/${config.org}/${r.repo}/pull/${r.number}">#${r.number}</a>`,
        `<code>${r.branch}</code>`,
        `<code>${r.sha}</code>`
      ])
    ]);
  } else if (!config.dryRun && totalSkipped === 0 && totalErrors === 0) {
    s.addRaw(
      `\n> **No open PRs found with source branch \`${releaseBranch}\`** in any of the ${totalScanned} repos scanned.\n`
    );
  } else if (!config.dryRun) {
    s.addRaw('\n> **No PRs merged** — see Skipped/Errors below for reasons.\n');
  }

  if (totalSkipped > 0) {
    s.addHeading('⏭️ Skipped PRs', 3).addTable([
      [
        { data: 'Repository', header: true },
        { data: 'PR', header: true },
        { data: 'Reason', header: true }
      ],
      ...allResults.skipped.map(r => [
        `<a href="https://github.com/${config.org}/${r.repo}">${r.repo}</a>`,
        `#${r.number}`,
        r.reason
      ])
    ]);
  }

  if (totalErrors > 0) {
    s.addHeading('❌ Errors', 3).addTable([
      [
        { data: 'Repository', header: true },
        { data: 'Error', header: true }
      ],
      ...allResults.errors.map(e => [
        `<a href="https://github.com/${config.org}/${e.repo}">${e.repo}</a>`,
        e.error
      ])
    ]);
  }

  return s;
}

module.exports = { buildSummaryReport };
