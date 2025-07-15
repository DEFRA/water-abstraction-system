'use strict'

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/check` page
 * @module SubmitCheckService
 */

const BatchNotificationsService = require('./batch-notifications.service.js')
const CreateNoticePresenter = require('../../../presenters/notices/setup/create-notice.presenter.js')
const CreateNoticeService = require('./create-notice.service.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const SessionModel = require('../../../models/session.model.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/check` page
 *
 * This service will transform the recipients into notifications and start processing notifications.
 *
 * @param {string} sessionId - The UUID for the notice setup session record
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<string>} - the created notice Id
 */
async function go(sessionId, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const recipients = await _recipients(session)

  const notice = await _notice(session, recipients, auth)

  const sessionCopy = session

  await session.$query().delete()

  _processNotifications(sessionCopy, recipients, notice)

  return notice.id
}

async function _notice(session, recipients, auth) {
  const event = CreateNoticePresenter.go(session, recipients, auth)

  return CreateNoticeService.go(event)
}

async function _processNotifications(session, recipients, notice) {
  try {
    const startTime = currentTimeInNanoseconds()

    await BatchNotificationsService.go(recipients, session, notice.id)

    calculateAndLogTimeTaken(startTime, 'Send notifications complete', {})
  } catch (error) {
    global.GlobalNotifier.omfg('Send notifications failed', { notice }, error)
  }
}

async function _recipients(session) {
  let recipientsData

  if (session.journey === 'alerts') {
    recipientsData = await FetchAbstractionAlertRecipientsService.go(session)
  } else {
    recipientsData = await FetchRecipientsService.go(session)
  }

  return DetermineRecipientsService.go(recipientsData)
}

module.exports = {
  go
}
