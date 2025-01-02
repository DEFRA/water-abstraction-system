'use strict'

/**
 * Formats return log data ready for presenting in the confirmation page
 * @module ConfirmationPresenter
 */

/**
 * Formats return log data ready for presenting in the view confirmation page
 *
 * @param {ReturnLogModel} returnLog - The return log and associated, licence
 *
 * @returns {object} page data needed by the view template
 */
function go(returnLog) {
  const { id, licenceRef, licence, underQuery, purposes, description } = returnLog

  return {
    returnLog: {
      id,
      purpose: purposes[0].tertiary.description,
      siteDescription: description,
      licenceReference: licenceRef
    },
    licenceId: licence.id,
    pageTitle: underQuery ? 'Query recorded' : 'Query resolved'
  }
}

module.exports = {
  go
}
