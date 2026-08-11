'use strict';

const { MONTH_PATTERN } = require('./config');

function validateMonth(month, core) {
  if (!MONTH_PATTERN.test(month)) {
    core.setFailed(
      `Invalid month format: "${month}". Expected MMM-YYYY (e.g., Aug-2026)`
    );
    return false;
  }
  return true;
}

module.exports = { validateMonth };
