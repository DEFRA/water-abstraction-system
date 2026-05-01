'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view notification page
 * @module ViewNotificationService
 */

const FetchNotificationService = require('./fetch-notification.service.js')
const FetchUserService = require('./fetch-user.service.js')
const NotificationPresenter = require('../../presenters/users/notification.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view notification page
 *
 * @param {string} notificationId - The UUID of the notifications to view
 * @param {string} userId - The UUID of the user related to the notification
 * @param {string} type - Whether the user is internal or external
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view notification template.
 */
async function go(notificationId, userId, type, auth) {
  const notification = await FetchNotificationService.go(notificationId)
  const user = await FetchUserService.go(userId)
  const superUser = _superUser(auth)

  const pageData = NotificationPresenter.go(notification, user, type, superUser)

  return {
    activeNavBar: 'users',
    ...pageData
  }
}

function _superUser(auth) {
  return auth.credentials.groups.find((group) => {
    return group.group === 'super'
  })
}

module.exports = {
  go
}
