'use strict'

/**
 * Fetches the selected return log and related data for the abstraction return page
 * @module FetchEditReturnLogService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Fetches the selected return log and related data for the abstraction return page
 *
 * @param {string} returnLogId - the UUID of the selected return log
 *
 * @returns {module:ReturnLogModel} the matching `ReturnLogModel` instance and related data needed for the
 * abstraction return page
 */
async function go(returnLogId) {
  return _fetch(returnLogId)
}

async function _fetch(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'returnLogs.startDate',
      'returnLogs.endDate',
      'returnLogs.status',
      'returnLogs.underQuery',
      ref('returnLogs.metadata:nald.periodStartDay').castInt().as('periodStartDay'),
      ref('returnLogs.metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
      ref('returnLogs.metadata:nald.periodEndDay').castInt().as('periodEndDay'),
      ref('returnLogs.metadata:nald.periodEndMonth').castInt().as('periodEndMonth'),
      ref('returnLogs.metadata:description').as('siteDescription'),
      ref('returnLogs.metadata:purposes').as('purposes'),
      ref('returnLogs.metadata:isTwoPartTariff').as('twoPartTariff'),
      'licence.id as licenceId',
      'licence.licenceRef'
    )
    .innerJoinRelated('licence')
    .where('returnLogs.id', returnLogId)
}

module.exports = {
  go
}
