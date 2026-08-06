/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 * @module FetchNotificationsDal
 */

import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'
import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 *
 * @param {string} licenceRef - The licence ref for the licence
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's communications tab
 */
export default async function fetchNotificationsDal(licenceRef, page = '1') {
  const { results: notifications, total: totalNumber } = await _fetch(licenceRef, page)

  return { notifications, totalNumber }
}

async function _fetch(licenceRef, page) {
  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'status'])
    .where('licences', '?', licenceRef)
    .orderBy([
      { column: 'createdAt', order: 'desc' },
      { column: 'messageType', order: 'asc' },
      { column: 'status', order: 'asc' },
      { column: 'id', order: 'asc' }
    ])
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select([
        'id',
        'issuer',
        'subtype',
        Objection.ref('metadata:options.sendingAlertType').castText().as('sendingAlertType')
      ])
    })
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}
