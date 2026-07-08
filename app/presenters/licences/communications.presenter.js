/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module CommunicationsPresenter
 */

import NotificationsTablePresenter from '../notifications/notifications-table.presenter.js'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 *
 * @param {module:NotificationModel[]} notifications - All notifications linked to the licence
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
export default function go(notifications, licence) {
  const { id: licenceId, licenceRef } = licence

  const notificationsTableData = NotificationsTablePresenter(notifications, licenceId)

  return {
    backLink: {
      text: 'Go back to search',
      href: '/'
    },
    notifications: notificationsTableData,
    pageTitle: 'Communications',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}
