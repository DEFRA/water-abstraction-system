/**
 * Formats data for external users on the `/users/external/setup/{id}/check` page
 * @module CheckPresenter
 */

import { formatLicencesToUnlink } from '../../base-users.presenter.js'

/**
 * Formats data for external users on the `/users/external/setup/{id}/check` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const licences = formatLicencesToUnlink(session)

  return {
    activeNavBar: session.activeNavBar,
    licences,
    links: {
      cancel: `/system/users/external/setup/${session.id}/cancel`,
      licences: `/system/users/external/setup/${session.id}/licences`
    },
    pageTitle: 'Check licences to unregister',
    pageTitleCaption: session.user.username,
    warning: _warning(licences)
  }
}

function _warning(licences) {
  const warning = {
    iconFallbackText: 'Warning',
    text: 'This licence will no longer be accessible to existing users.'
  }

  if (licences[0] === 'All licences') {
    warning.text = 'All these licences will no longer be accessible to existing users.'
  }

  if (licences.length > 1) {
    warning.text = 'These licences will no longer be accessible to existing users.'
  }

  return warning
}

export {
  go
}
export default {
  go
}
