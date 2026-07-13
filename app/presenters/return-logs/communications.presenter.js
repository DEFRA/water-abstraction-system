/**
 * Formats data for the '/return-logs/{id}/communications' page
 * @module CommunicationsPresenter
 */

import NotificationsTablePresenter from '../notifications/notifications-table.presenter.js'

/**
 * Formats data for the '/return-logs/{id}/communications' page
 *
 * @param {module:ReturnLogModel} returnLog - The return log and associated licence
 * @param {module:NotificationModel[]} notifications - All notifications linked to the return log
 *
 * @returns {object} The data formatted for the view template
 */
export default function communicationsPresenter(returnLog, notifications) {
  const { id, licence } = returnLog

  return {
    backLink: {
      href: `/system/licences/${licence.id}/returns`,
      text: 'Go back to returns'
    },
    notifications: NotificationsTablePresenter(notifications, null, id, null),
    pageTitle: 'Communications',
    pageTitleCaption: `Licence ${licence.licenceRef}`
  }
}
