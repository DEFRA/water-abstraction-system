/**
 * Formats data for the '/users/internal/setup/{sessionId}/email' page
 * @module EmailPresenter
 */

import { formatEmail } from '../../../base.presenter.js'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/email' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function go(session) {
  const { checkPageVisited, email, id: sessionId } = session

  return {
    activeNavBar: 'users',
    backLink: {
      href: _href(checkPageVisited, sessionId),
      text: 'Back'
    },
    email: formatEmail(email),
    pageTitle: 'Enter an email address for the user',
    pageTitleCaption: 'Internal'
  }
}

function _href(checkPageVisited, sessionId) {
  if (checkPageVisited) {
    return `/system/users/internal/setup/${sessionId}/check`
  }

  return '/system/users'
}
