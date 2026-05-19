const activityRepo = require('../repositories/activity.repository');
const logger = require('../utils/logger');

/**
 * Fire-and-forget activity logger.
 * Never throws — a logging failure must never break the main operation.
 *
 * @param {number|null} userId
 * @param {string}      action   e.g. 'login', 'login_failed', 'signup'
 * @param {object}      metadata arbitrary extra context
 * @param {object}      meta     { ip, userAgent } from the HTTP request
 */
const log = async (userId, action, metadata = {}, meta = {}) => {
  try {
    await activityRepo.log(userId, action, metadata, meta.ip, meta.userAgent);
  } catch (err) {
    logger.error(`Activity log failed [${action}]: ${err.message}`);
  }
};

module.exports = { log };
