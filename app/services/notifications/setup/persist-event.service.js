'use strict'

/**
 * Persists a 'returnInvitation' or 'returnReminder' notification event
 * @module PersistEventService
 */

const EventModel = require('../../../../app/models/event.model.js')

/**
 * Persists a 'returnInvitation' or 'returnReminder' notification event
 *
 * An event for a 'returnInvitation' or 'returnReminder' should look like this:
 *
 * ```javascript
 * const event = {
 *  licences: JSON.stringify(['123', '456']),
 *  metadata: {
 *    name: 'Returns: invitation', // Used in the legacy when rendering the '/notifications/report' page
 *    sent: 2783,
 *    error: 18,
 *    options: { excludeLicences: [] },
 *    recipients: 2801,
 *    returnCycle: { dueDate: '2024-11-28', endDate: '2024-10-31', isSummer: true, startDate: '2023-11-01' }
 *   },
 *   referenceCode: 'ABC-123',
 *   status: 'started',
 *   subtype: 'returnInvitation'
 *  }
 * ```
 *
 * These events are structured in way that legacy UI can render any notification straight into the view.
 *
 * @param {object} event
 *
 * @returns {object} - the event including the id
 */
async function go(event) {
  return _persistEvent(event)
}

async function _persistEvent(event) {
  return EventModel.query().insert({
    type: 'notification', // Required
    ...event
  })
}

module.exports = {
  go
}
