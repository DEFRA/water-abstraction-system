'use strict'

/**
 * Formats return log data for the `/return-log/setup/confirmed` page
 * @module ConfirmedPresenter
 */

/**
 * Formats return log data for the `/return-log/setup/confirmed` page
 *
 * @param {module:ReturnLogModel} returnLog - The return log instance
 *
 * @returns {object} page data needed by the view template
 */
function go(returnLog) {
  const { licenceId, licenceRef, purposes, returnLogId, returnReference, siteDescription, status } = returnLog

  return {
    returnLogId,
    licenceId,
    licenceRef,
    pageTitle: _pageTitle(returnReference, status),
    purposeDetails: _purposeDetails(purposes),
    siteDescription,
    status
  }
}

function _pageTitle(returnReference, status) {
  if (status === 'received') {
    return `Return ${returnReference} received`
  }

  return `Return ${returnReference} submitted`
}

function _purposeDetails(purposes) {
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
