'use strict'

/**
 * Handles updating a return log record when the query button is clicked
 * @module SubmitViewReturnLogService
 */

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 *
 * @param returnLogId
 * @param yar
 * @param payload
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
