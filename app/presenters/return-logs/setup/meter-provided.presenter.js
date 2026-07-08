import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Format data for the `/return-log/setup/{sessionId}/meter-provided` page
 * @module MeterProvidedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/meter-provided` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, returnReference, meterProvided } = session

  return {
    backLink: _backLink(session),
    meterProvided: meterProvided ?? null,
    pageTitle: 'Have meter details been provided?',
    pageTitleCaption: `Return reference ${returnReference}`,
    sessionId
  }
}

function _backLink(session) {
  return {
    href: checkUrl(session, `/system/return-logs/setup/${session.id}/units`),
    text: 'Back'
  }
}

export { go }
export default {
  go
}
