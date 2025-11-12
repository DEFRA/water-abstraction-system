'use strict'

/**
 * Create a notice from the notice setup data
 * @module CreateNoticeService
 */

const CreateNoticePresenter = require('../../../presenters/notices/setup/create-notice.presenter.js')
const EventModel = require('../../../../app/models/event.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Create a notice from the notice setup data
 *
 * > Notices are event records with a type as `notification`. In the future we intend to move them to their own
 * > `water.notices` table. But for now this explains why the `EventModel` suddenly makes an appearance!
 *
 * @param {SessionModel} session - The session instance
 * @param {object[]} recipients - List of recipients, each containing details like email or address of the recipient
 * @param {string} issuer - The username of the person issuing the notice
 *
 * @returns {Promise<module:EventModel>} the new `EventModel` (Notice) instance
 */
async function go(session, recipients, issuer) {
  const notice = CreateNoticePresenter.go(session, recipients, issuer)
  const timestamp = timestampForPostgres()

  return EventModel.query().insert({ ...notice, createdAt: timestamp, updatedAt: timestamp })
}

module.exports = {
  go
}
