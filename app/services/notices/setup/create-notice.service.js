'use strict'

/**
 * Create a 'returnInvitation' or 'returnReminder' notice
 * @module CreateNoticeService
 */

const EventModel = require('../../../../app/models/event.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Create a 'returnInvitation' or 'returnReminder' notice
 *
 * > Notices are event records with a type as `notification`. In the future we intend to move them to their own
 * > `water.notices` table. But for now this explains why the `EventModel` suddenly makes an appearance!
 *
 * A notice for a 'returnInvitation' or 'returnReminder' should look like this:
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
 * These notices are structured in way that legacy UI can render any notice straight into the view.
 *
 * @param {object} noticeData - An object representing the notice to be created
 *
 * @returns {object} the created notice
 */
async function go(noticeData) {
  return EventModel.query().insert({
    type: 'notification',
    createdAt: timestampForPostgres(),
    updatedAt: timestampForPostgres(),
    ...noticeData
  })
}

module.exports = {
  go
}
