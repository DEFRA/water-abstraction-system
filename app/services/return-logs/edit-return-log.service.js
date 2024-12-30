'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the how to edit an abstraction return page
 * @module EditReturnLogService
 */

const FetchEditReturnLogService = require('./fetch-edit-return-log.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the how to edit an abstraction return page
 *
 * @param {string} returnLogId - The ID of the return log to edit
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(returnLogId) {
  const editReturnLog = await FetchEditReturnLogService.go(returnLogId)
  console.log('🚀 ~ go ~ editReturnLog:', editReturnLog)

  return {
    returnLogId,
    pageTitle: 'Abstraction return',
    licenceRef: '12/345',
    returnReference: '123456789',
    siteDescription: 'River Swale - Helperby SP1,2,3,4,5 (GW)',
    purposes: 'Potable Water Supply Direct',
    returnsPeriod: 'From 1 July 2024 to 30 September 2024',
    abstractionPeriod: 'From 1 April to 31 March',
    tariffType: 'Standard tariff',
    queryText: 'Record under query',
    licenceId: 'd4ba7029-8716-4538-8092-0f39a196f132'
  }
}

module.exports = {
  go
}
