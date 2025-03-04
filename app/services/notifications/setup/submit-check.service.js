'use strict'

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 * @module SubmitCheckService
 */

const SessionModel = require('../../../models/session.model.js')
const RecipientsService = require('./fetch-recipients.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')
const ReturnsNotificationPresenter = require('../../../presenters/notifications/setup/returns-notification.presenter.js')

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 *
 * This service will transform the recipients into notifications and start processing notifications.
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 */
async function go(sessionId) {
  try {
    const startTime = currentTimeInNanoseconds()

    const session = await SessionModel.query().findById(sessionId)

    const recipientsData = await RecipientsService.go(session)

    const recipients = DetermineRecipientsService.go(recipientsData)

    ReturnsNotificationPresenter.go(recipients, session.determinedReturnsPeriod, session.referenceCode, session.journey)

    calculateAndLogTimeTaken(startTime, 'Send notifications complete', {})
  } catch (error) {
    global.GlobalNotifier.omfg('Send notifications failed', { sessionId }, error)
  }
}

module.exports = {
  go
}
