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
  const { licenceId, licenceRef, purposes, returnId, returnReference, siteDescription, status, submissionCount } =
    returnLog

  return {
    licenceId,
    licenceRef,
    pageTitle: _pageTitle(returnReference, status, submissionCount),
    purposeDetails: _purposeDetails(purposes),
    returnId,
    siteDescription,
    status
  }
}

function _pageTitle(returnReference, status, submissionCount) {
  if (status === 'received') {
    return `Return ${returnReference} received`
  }

  // If there is more than one return submission for this return log, it means the user has modified an already
  // submitted return. This indicates they went through the return log edit journey, so the title should use "edited"
  // instead of "submitted".
  if (submissionCount > 1) {
    return `Return ${returnReference} edited`
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
