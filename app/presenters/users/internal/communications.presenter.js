/**
 * Formats data for the '/users/internal/{id}/communications' page
 * @module CommunicationsPresenter
 */

import NotificationsTablePresenter from '../notifications-table.presenter.js'

/**
 * Formats data for the '/users/internal/{id}/communications' page
 *
 * @param {module:UserModel} user - The user and associated details
 * @param {module:NotificationModel[]} notifications - All notifications linked to the user
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, notifications) {
  const { id, username } = user

  return {
    backLink: {
      href: '/system/users',
      text: 'Go back to users'
    },
    notifications: NotificationsTablePresenter.go(notifications, id, 'internal'),
    pageTitle: 'Communications',
    pageTitleCaption: username
  }
}

export default {
  go
}
