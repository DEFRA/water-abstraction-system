'use strict'

/**
 * Handles updating a return log record when the query button is clicked
 * @module SubmitViewReturnLogService
 */

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Handles updating a return log record when the mark query button is clicked
 *
 * The mark query button in the view return log screen toggles whether or not a licence is 'under query'.
 *
 * If the return log is marked as under query then we update the `ReturnLogModel` record and set a `flash()` message in
 * the session so that when the request is redirected to the `GET` it knows to display a notification banner to confirm.
 *
 * If the return log is marked as not under query (ie. the query is resolved) then we update the `ReturnLogModel` record
 * but don't set a `flash()` message in the session as this is not part of the design.
 *
 * @param {string} returnLogId - The id of the return log to update
 * @param {object} yar - The Hapi Yar session manager
 * @param {object} payload - The submitted form data
 */
async function go(returnLogId, yar, payload) {
  const parsedPayload = _parsePayload(payload)

  // NOTE: The YarPlugin decorates the Hapi request object with a yar property. Yar is a session manager
  _bannerMessage(yar, parsedPayload)

  await _update(returnLogId, parsedPayload)
}

function _bannerMessage(yar, parsedPayload) {
  const { underQuery } = parsedPayload

  if (underQuery) {
    yar.flash('banner', 'This return has been marked under query.')
  }
}

function _parsePayload(payload) {
  const markQuery = payload['mark-query'] ?? null

  return {
    underQuery: markQuery === 'mark'
  }
}

async function _update(returnLogId, parsedPayload) {
  const { underQuery } = parsedPayload

  await ReturnLogModel.query().findById(returnLogId).patch({ underQuery })
}

module.exports = {
  go
}
