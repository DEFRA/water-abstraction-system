import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/no-returns-required` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
export default function noReturnsRequiredPresenter(session) {
  const { id: sessionId, licence, reason } = session

  return {
    backLink: _backLink(session),
    licenceRef: licence.licenceRef,
    reason: reason || null,
    pageTitle: 'Why are no returns required?',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

function _backLink(session) {
  return {
    href: checkUrl(session, `/system/return-versions/setup/${session.id}/start-date`),
    text: 'Back'
  }
}
