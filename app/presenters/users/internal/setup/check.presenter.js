/**
 * Formats data for the '/users/internal/setup/{sessionId}/check' page
 * @module CheckPresenter
 */

import { sentenceCase } from '../../../base.presenter.js'
import { userPermissions } from '../../../../lib/static-lookups.lib.js'

/**
 * Formats data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
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

export {
  go
}
export default {
  go
}
