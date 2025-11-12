'use strict'

/**
 * Config values used for GOV.UK Notify
 * @module NotifyConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  apiKey: process.env.GOV_UK_NOTIFY_API_KEY,
  // The Notify service imposes a rate limit of 3,000 requests per minute and restricts the number of statuses returned
  // per API call to a maximum of 250. Given these constraints, our batch processing mechanism should handle the lowest
  // of the two limitations, which in this case is the 250-message status retrieval limit from Notify.
  // https://docs.notifications.service.gov.uk/node.html#get-the-status-of-multiple-messages
  // However we want to check for status updates after we have sent to the initial request to Notify, currently we only
  // do this for emails, so the total batch count needs to be halved to 125. This is to accommodate the possibility of
  // sending 125 emails and then checking the status for all 125 emails in one go.
  batchSize: parseInt(process.env.NOTIFICATIONS_BATCH_SIZE) || 125,
  callbackToken: process.env.GOV_UK_NOTIFY_AUTH_TOKEN,
  // At the time of adding this the service has a retention of 90 days where as Notify's default is 7
  daysOfRetention: parseInt(process.env.GOV_UK_NOTIFY_DAYS_OF_RETENTION) || 7,
  // Notify limits you to sending 3,000 messages per minute. This limit is calculated on a rolling basis, per API key
  // type. A delay of 20 milliseconds after each request would result in just under 3,000 requests a minute. We go with
  // a default of 30ms which results in approx. 2,000 requests per minute, assuming we can send them that fast!
  delay: parseInt(process.env.GOV_UK_NOTIFY_DELAY) || 30,
  rateLimitPause: parseInt(process.env.GOV_UK_NOTIFY_RATE_LIMIT_PAUSE) || 90000,
  timeout: parseInt(process.env.GOV_UK_NOTIFY_TIMEOUT) || 10000,
  url: process.env.GOV_UK_NOTIFY_URL,
  waitForStatus: parseInt(process.env.GOV_UK_NOTIFY_WAIT_FOR_STATUS) || 5000
}

module.exports = config
