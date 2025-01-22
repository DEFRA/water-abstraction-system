'use strict'

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
function go(session) {
  const { id: sessionId, beenReceived, journey, returnReference } = session

  return {
    backLink: `/system/return-logs/setup/${sessionId}/received`,
    beenReceived,
    journey: journey ?? null,
    pageTitle: 'What do you want to do with this return?',
    returnReference
  }
}

module.exports = {
  go
}
