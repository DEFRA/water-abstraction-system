'use strict'

/**
 * Formats data for the '/users/external/{id}/communications' page
 * @module CommunicationsPresenter
 */

const NotificationsTablePresenter = require('../notifications-table.presenter.js')
const { sourceNavigation } = require('../base-users.presenter.js')

/**
 * Formats data for the '/users/external/{id}/communications' page
 *
 * @param {module:UserModel} user - The user and associated details
 * @param {module:NotificationModel[]} notifications - All notifications linked to the user
 * @param {string[]} viewingUserScope - The 'scope' taken off the `request.auth` object passed to the
 * `ViewVerificationsService`
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, notifications, viewingUserScope, back) {
  const { id, username } = user

  const canManageAccounts = viewingUserScope.includes('manage_accounts')
  const sourceNavigationDetails = sourceNavigation(back, canManageAccounts)

  return {
    activeNavBar: sourceNavigationDetails.activeNavBar,
    backLink: sourceNavigationDetails.backLink,
    backQueryString: sourceNavigationDetails.backQueryString,
    notifications: NotificationsTablePresenter.go(notifications, id, 'external'),
    pageTitle: 'Communications',
    pageTitleCaption: username
  }
}

module.exports = {
  go
}
