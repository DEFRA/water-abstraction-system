/**
 * Formats data for external users on the `/users/external/setup/{id}/cancel` page
 * @module CancelPresenter
 */

import { formatLicencesToUnlink } from '../../base-users.presenter.js'

/**
 * Formats data for external users on the `/users/external/setup/{id}/cancel` page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function cancel(session) {
  const licences = formatLicencesToUnlink(session)

  return {
    activeNavBar: session.activeNavBar,
    backLink: {
      href: `/system/users/external/setup/${session.id}/check`,
      text: 'Back'
    },
    licences,
    pageTitle: 'You are about to cancel unregistering these licences',
    pageTitleCaption: session.user.username
  }
}
