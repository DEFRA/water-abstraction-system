'use strict'

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 * @module SubmitCheckService
 */

const BatchNotificationsService = require('./batch-notifications.service.js')
const CreateEventPresenter = require('../../../presenters/notifications/setup/create-event.presenter.js')
const CreateEventService = require('./create-event.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const RecipientsService = require('./fetch-recipients.service.js')
const SessionModel = require('../../../models/session.model.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Orchestrates handling the data for `/notifications/setup/{sessionId}/check` page
 *
 * This service will transform the recipients into notifications and start processing notifications.
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 */
async function go(sessionId, auth) {
  try {
    const startTime = currentTimeInNanoseconds()

    const session = await SessionModel.query().findById(sessionId)

    const recipients = await _recipients(session)

    const { id: eventId } = await _event(session, recipients, auth)

    await _notifications(session, recipients, eventId)

    calculateAndLogTimeTaken(startTime, 'Send notifications complete', {})
  } catch (error) {
    global.GlobalNotifier.omfg('Send notifications failed', { sessionId }, error)
  }
}

async function _event(session, recipients, auth) {
  const event = CreateEventPresenter.go(session, recipients, auth)

  return CreateEventService.go(event)
}

async function _notifications(session, recipients, eventId) {
  return BatchNotificationsService.go(
    recipients,
    session.determinedReturnsPeriod,
    session.referenceCode,
    session.journey,
    eventId
  )
}

async function _recipients(session) {
  const recipientsData = await RecipientsService.go(session)

  return DetermineRecipientsService.go(recipientsData)
}

module.exports = {
  go
}
