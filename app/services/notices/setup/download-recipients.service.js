'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notices setup download link
 * @module DownloadRecipientsService
 */

const AbstractionAlertDownloadRecipientsPresenter = require('../../../presenters/notices/setup/abstraction-alert-download-recipients.presenter.js')
const DownloadAdHocRecipientsPresenter = require('../../../presenters/notices/setup/download-adhoc-recipients.presenter.js')
const DownloadLetterRecipientsPresenter = require('../../../presenters/notices/setup/download-letter-recipients.presenter.js')
const DownloadRecipientsPresenter = require('../../../presenters/notices/setup/download-recipients.presenter.js')
const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchDownloadRecipientsService = require('./fetch-download-recipients.service.js')
const FetchLetterRecipientsService = require('./fetch-letter-recipients.service.js')
const RecipientsService = require('./recipients.service.js')

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and formatting the data needed for the notices setup download link
 *
 * This service creates a csv file of recipient for the user to download. It does not seem necessary to use a `Stream`
 * to create the csv as the data is relatively small.
 *
 * @param {string} sessionId - The UUID for setup returns notice session record
 *
 * @returns {Promise<object>} The data for the download link (csv string, filename and type)
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { notificationType, referenceCode } = session

  const formattedData = await _formattedData(session)

  return {
    data: formattedData,
    type: 'text/csv',
    filename: `${notificationType} - ${referenceCode}.csv`
  }
}

async function _alerts(session) {
  const abstractionAlertRecipients = await FetchAbstractionAlertRecipientsService.go(session)

  return AbstractionAlertDownloadRecipientsPresenter.go(abstractionAlertRecipients, session)
}

async function _adhoc(session) {
  if (session.noticeType === 'returnForms') {
    const letterRecipients = await FetchLetterRecipientsService.go(session)

    const recipients = RecipientsService.go(session, letterRecipients)

    return DownloadLetterRecipientsPresenter.go(recipients, session)
  }

  const recipients = await _recipients(session)

  return DownloadAdHocRecipientsPresenter.go(recipients, session)
}

async function _formattedData(session) {
  if (session.journey === 'alerts') {
    return _alerts(session)
  }

  if (session.journey === 'adhoc') {
    return _adhoc(session)
  }

  const recipients = await _recipients(session)

  return DownloadRecipientsPresenter.go(recipients, session)
}

async function _recipients(session) {
  const downloadRecipients = await FetchDownloadRecipientsService.go(session)

  return RecipientsService.go(session, downloadRecipients)
}

module.exports = {
  go
}
