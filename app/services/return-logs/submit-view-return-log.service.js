'use strict'

/**
 * Handles updating a return log record when the mark/resolve query button is clicked
 * @module SubmitViewReturnLogService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Handles updating a return log record when the mark/resolve query button is clicked
 *
 * The mark/resolve query button in the view return log screen toggles whether or not a licence is 'under query'.
 *
 * If the return log is marked as under query then we update the `ReturnLogModel` record. This will cause a notification
 * banner to display when viewing the return log. so the user knows it is 'under query'.
 *
 * If the return log was already marked as under query, when the request comes to this page it will update the the
 * return log to unmark it. When the user is redirected back to the view return log page the notification will be gone.
 *
 * @param {object} payload - The submitted form data
 * @param {string} returnId - The id of the return log to update
 */
async function go(payload, returnId) {
  const underQuery = payload['mark-query'] === 'mark'

  await ReturnLogModel.query().patch({ underQuery, updatedAt: timestampForPostgres() }).where('returnId', returnId)
}

module.exports = {
  go
}
