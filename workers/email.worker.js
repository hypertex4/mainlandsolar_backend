const transporter = require('../config/mailer');
const emailQueueRepo = require('../repositories/email-queue.repository');
const logger = require('../utils/logger');

const POLL_INTERVAL_MS = 5000; // check queue every 5 seconds
const BATCH_SIZE       = 5;    // process up to 5 emails per tick

let timer       = null;
let isRunning   = false; // prevents overlapping ticks

// ─── Core processor ──────────────────────────────────────────────────────────
const processQueue = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const jobs = await emailQueueRepo.claimBatch(BATCH_SIZE);
    if (jobs.length === 0) return;

    logger.info(`[EmailWorker] Processing ${jobs.length} job(s)`);

    await Promise.allSettled(
      jobs.map(async (job) => {
        const start = Date.now();
        try {
          await transporter.sendMail({
            from:    job.from_address,
            to:      job.to_email,
            subject: job.subject,
            html:    job.html,
          });

          await emailQueueRepo.markSent(job.id);

          logger.info(
            `[EmailWorker] SENT   id=${job.id} to=${job.to_email} ` +
            `subject="${job.subject}" duration=${Date.now() - start}ms`
          );
        } catch (err) {
          const permanent = job.attempts >= job.max_attempts;

          await emailQueueRepo.markFailed(
            job.id,
            job.attempts,
            job.max_attempts,
            err.message
          );

          logger[permanent ? 'error' : 'warn'](
            `[EmailWorker] ${permanent ? 'FAILED' : 'RETRY'} ` +
            `id=${job.id} to=${job.to_email} attempt=${job.attempts}/${job.max_attempts} ` +
            `error="${err.message}"`
          );
        }
      })
    );
  } catch (err) {
    logger.error(`[EmailWorker] Queue processing error: ${err.message}`);
  } finally {
    isRunning = false;
  }
};

// ─── Lifecycle ───────────────────────────────────────────────────────────────
const start = async () => {
  // Reset any jobs left stuck in 'processing' from a previous crash
  const stale = await emailQueueRepo.resetStaleLocks(10);
  if (stale > 0) {
    logger.warn(`[EmailWorker] Reset ${stale} stale job(s) back to pending`);
  }

  timer = setInterval(processQueue, POLL_INTERVAL_MS);

  // Run immediately on start so queued emails don't wait a full interval
  processQueue();

  logger.info(`[EmailWorker] Started — polling every ${POLL_INTERVAL_MS / 1000}s`);
};

const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info('[EmailWorker] Stopped');
  }
};

module.exports = { start, stop };
