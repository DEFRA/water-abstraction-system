/**
 * Formats data for the '/users/internal/setup/{sessionId}/cancel' page
 * @module CancelPresenter
 */

import { userPermissions } from '../../../../lib/static-lookups.lib.js'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/cancel' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { email, id: sessionId, permission } = session

  return {
    activeNavBar: 'users',
    backLink: {
      href: `/system/users/internal/setup/${sessionId}/check`,
      text: 'Back'
    },
    email,
    pageTitle: 'You are about to cancel this user',
    pageTitleCaption: 'Internal',
    permission: userPermissions[permission].label
  }
}

export { go }
export default {
  go
}
