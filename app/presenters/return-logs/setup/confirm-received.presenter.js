'use strict'

/**
 * Formats return log data for the `/return-log/setup/confirm-received` page
 * @module ConfirmReceivedPresenter
 */

/**
 * Formats return log data for the `/return-log/setup/confirm-received` page
 *
 * @param {module:ReturnLogModel} returnLog - The return log instance
 *
 * @returns {object} page data needed by the view template
 */
function go(returnLog) {
  const { licenceId, licenceRef, purposes, returnReference, siteDescription } = returnLog

  return {
    licenceId,
    licenceRef,
    pageTitle: `Return ${returnReference} received`,
    purposeDetails: purposeDetails(purposes),
    siteDescription
  }
}

function purposeDetails(purposes) {
  const formattedPurposes = purposes.map((purpose) => {
    return purpose.tertiary.description
  })

  if (formattedPurposes.length === 1) {
    return {
      label: 'Purpose',
      value: formattedPurposes[0]
    }
  }

  return {
    label: 'Purposes',
    value: formattedPurposes.join(', ')
  }
}

module.exports = {
  go
}
