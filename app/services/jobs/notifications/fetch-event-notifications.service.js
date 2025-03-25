const EventModel = require('../../../models/event.model.js')

/**
 * Fetches the scheduled notifications
 * @module FetchService
 */

/**
 *
 */
async function go() {
  return (
    EventModel.query()
      .whereExists(EventModel.relatedQuery('scheduledNotifications').whereIn('status', ['sending']))
      .select('referenceCode')
      // .whereIn('subtype', ['returnInvitation', 'returnReminder', 'adHocReminder'])
      .andWhere('status', 'completed')
      .andWhere('type', 'notification')
      .withGraphFetched('scheduledNotifications')
      .modifyGraph('scheduledNotifications', (builder) => {
        builder.select(['id', 'notifyId', 'status', 'notifyStatus', 'log']).whereIn('status', ['sending'])
      })
  )
}

module.exports = {
  go
}
