'use strict';

const { PAGINATE_LIMIT } = require('./config');

async function fetchPRsForRepo(github, core, org, repo) {
  try {
    return await github.paginate(github.rest.pulls.list, {
      owner: org,
      repo,
      state: 'open',
      per_page: PAGINATE_LIMIT
    });
  } catch (e) {
    core.warning(`Failed to list PRs in ${repo}: ${e.message}`);
    throw e;
  }
}

async function fetchReviews(github, org, repo, pullNumber) {
  return await github.paginate(github.rest.pulls.listReviews, {
    owner: org,
    repo,
    pull_number: pullNumber,
    per_page: PAGINATE_LIMIT
  });
}

async function mergePR(github, org, repo, pullNumber, mergeMethod) {
  return await github.rest.pulls.merge({
    owner: org,
    repo,
    pull_number: pullNumber,
    merge_method: mergeMethod
  });
}

async function createComment(github, org, repo, pullNumber, body) {
  return await github.rest.issues.createComment({
    owner: org,
    repo,
    issue_number: pullNumber,
    body
  });
}

async function deleteBranch(github, org, repo, branchName) {
  return await github.rest.git.deleteRef({
    owner: org,
    repo,
    ref: `heads/${branchName}`
  });
}

async function fetchTeamRepos(github, core, org, teamSlug) {
  core.info(`Fetching repos for team ${org}/${teamSlug}...`);

  let repos;
  try {
    repos = await github.paginate(github.rest.teams.listReposInOrg, {
      org,
      team_slug: teamSlug,
      per_page: PAGINATE_LIMIT
    });
  } catch (e) {
    throw new Error(`Failed to list repos for team ${org}/${teamSlug}: ${e.message}`);
  }

  repos.sort((a, b) => a.name.localeCompare(b.name));
  core.info(`Found ${repos.length} repos`);
  return repos;
}

async function resolveRepoList(github, core, org, teamSlug, repoAllowlist) {
  if (repoAllowlist.length > 0) {
    core.info(`Using REPO_ALLOWLIST: ${repoAllowlist.length} repo(s)`);
    return repoAllowlist
      .map(name => ({ name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return fetchTeamRepos(github, core, org, teamSlug);
}

module.exports = { fetchPRsForRepo, fetchReviews, mergePR, createComment, deleteBranch, fetchTeamRepos, resolveRepoList };
