'use strict'

/**
 * Formats data for the '/return-logs/{id}/communications' page
 * @module CommunicationsPresenter
 */

const NotificationsTablePresenter = require('../notifications/notifications-table.presenter.js')

/**
 * Formats data for the '/return-logs/{id}/communications' page
 *
 * @param {module:ReturnLogModel} returnLog - The return log and associated licence
 * @param {module:NotificationModel[]} notifications - All notifications linked to the return log
 *
 * @returns {object} The data formatted for the view template
 */
function go(returnLog, notifications) {
  const { id, licence } = returnLog

  return {
    backLink: {
      href: `/system/licences/${licence.id}/returns`,
      text: 'Go back to summary'
    },
    notifications: NotificationsTablePresenter.go(notifications, null, id, null),
    pageTitle: 'Communications',
    pageTitleCaption: `Licence ${licence.licenceRef}`
  }
}

module.exports = {
  go
}
