'use strict'

/**
 * Fetches the notices for the 'notices/{id}/view' page
 * @module FetchNoticesService
 */

const ScheduledNotification = require('../../models/scheduled-notification.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the notice for the 'notices/{id}/view' page
 *
 * @param {string} id - the id of the scheduled notification to look up
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object[]>} an array of matching notices
 */
async function go(id, page) {
  return ScheduledNotification.query()
    .findById(id)
    .select(['messageType', 'messageRef', 'personalisation', 'status', 'licences'])
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select(['referenceCode'])
    })
    .orderBy('id', 'desc')
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
