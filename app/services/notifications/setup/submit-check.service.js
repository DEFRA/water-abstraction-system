'use strict'

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 * @module SubmitCheckService
 */

const CreateEventPresenter = require('../../../presenters/notifications/setup/create-event.presenter.js')
const CreateEventService = require('./create-event.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const RecipientsService = require('./fetch-recipients.service.js')
const ReturnsNotificationPresenter = require('../../../presenters/notifications/setup/scheduled-notifications.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

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

    const recipients = await _recipients(session)

    await _event(session, recipients)

    _notifications(session, recipients)

    calculateAndLogTimeTaken(startTime, 'Send notifications complete', {})
  } catch (error) {
    global.GlobalNotifier.omfg('Send notifications failed', { sessionId }, error)
  }
}

async function _event(session, recipients) {
  const event = CreateEventPresenter.go(session, recipients)

  return CreateEventService.go(event)
}

function _notifications(session, recipients) {
  return ReturnsNotificationPresenter.go(
    recipients,
    session.determinedReturnsPeriod,
    session.referenceCode,
    session.journey
  )
}

async function _recipients(session) {
  const recipientsData = await RecipientsService.go(session)

  return DetermineRecipientsService.go(recipientsData)
}

module.exports = {
  go
}
