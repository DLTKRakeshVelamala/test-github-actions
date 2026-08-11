'use strict';

const daysSince = date => Math.floor((new Date() - new Date(date)) / 86400000);
const hasApproval = reviews => reviews.some(r => r.state === 'APPROVED');
const hasChangesRequested = reviews => reviews.some(r => r.state === 'CHANGES_REQUESTED');

function checkPRAge(pr, maxAgeDays) {
  return daysSince(pr.created_at) <= maxAgeDays;
}

module.exports = {
  daysSince,
  hasApproval,
  hasChangesRequested,
  checkPRAge
};
