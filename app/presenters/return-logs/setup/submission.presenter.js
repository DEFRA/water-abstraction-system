import { checkUrl } from '../../../lib/check-page.lib.js'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmissionPresenter
 */

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/submission` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/submission` page
 */
export default function submissionPresenter(session) {
  const { beenReceived, journey, returnReference } = session

  return {
    backLink: _backLink(session),
    beenReceived,
    journey: journey ?? null,
    pageTitle: 'What do you want to do with this return?',
    pageTitleCaption: `Return reference ${returnReference}`
  }
}

function _backLink(session) {
  return {
    href: checkUrl(session, `/system/return-logs/setup/${session.id}/received`),
    text: 'Back'
  }
}
