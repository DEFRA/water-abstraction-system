/**
 * Formats data for the '/users/internal/setup/{sessionId}/permissions' page
 * @module PermissionsPresenter
 */

import { checkUrl } from '../../../../lib/check-page.lib.js'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function permissions(session) {
  const { id: sessionId, permission } = session

  return {
    activeNavBar: 'users',
    backLink: {
      href: checkUrl(session, `/system/users/internal/setup/${sessionId}/email`),
      text: 'Back'
    },
    pageTitle: 'Select permissions for the user',
    pageTitleCaption: 'Internal',
    permission
  }
}
