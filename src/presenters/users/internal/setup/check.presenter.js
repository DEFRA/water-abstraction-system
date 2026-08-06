/**
 * Formats data for the '/users/internal/setup/{sessionId}/check' page
 * @module CheckPresenter
 */

import { sentenceCase } from 'water-abstraction-engine/presenters/base.presenter.js'
import { userPermissions } from 'water-abstraction-engine/lib/static-lookups.lib.js'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function checkPresenter(session) {
  const { access, email, id: sessionId, permission, user } = session

  return {
    access: access ? sentenceCase(access) : null,
    activeNavBar: 'users',
    email,
    links: {
      access: `/system/users/internal/setup/${sessionId}/access`,
      cancel: `/system/users/internal/setup/${sessionId}/cancel`,
      email: `/system/users/internal/setup/${sessionId}/email`,
      permissions: `/system/users/internal/setup/${sessionId}/permissions`
    },
    pageTitle: 'Check user',
    pageTitleCaption: 'Internal',
    permission: userPermissions[permission].label,
    // Only allow changing the email address if this is a new user or the user has not yet verified their email address
    showEmailChangeLink: !user || user.currentStatus === 'awaiting'
  }
}
