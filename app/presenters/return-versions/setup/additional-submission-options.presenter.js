/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
 */

import { isQuarterlyReturnSubmissions } from '../../../lib/dates.lib.js'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const {
    id: sessionId,
    licence: { id: licenceId, licenceRef },
    multipleUpload,
    noAdditionalOptions,
    returnVersionStartDate,
    quarterlyReturns
  } = session

  return {
    backLink: {
      href: `/system/return-versions/setup/${sessionId}/check`,
      text: 'Back'
    },
    licenceId,
    licenceRef,
    multipleUpload,
    noAdditionalOptions,
    quarterlyReturnSubmissions: isQuarterlyReturnSubmissions(returnVersionStartDate),
    quarterlyReturns,
    pageTitle: 'Select any additional submission options for the return requirements',
    pageTitleCaption: `Licence ${licenceRef}`,
    sessionId
  }
}

export {
  go
}
export default {
  go
}
