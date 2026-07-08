import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/reason` page
 * @module ReasonPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/reason` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, licence, reason } = session

  return {
    backLink: _backLink(session),
    licenceRef: licence.licenceRef,
    pageTitle: 'Select the reason for the requirements for returns',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    reason: reason ?? null,
    sessionId
  }
}

function _backLink(session) {
  return {
    href: checkUrl(session, `/system/return-versions/setup/${session.id}/start-date`),
    text: 'Back'
  }
}

export { go }
export default {
  go
}
