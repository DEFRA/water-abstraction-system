'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notices setup download link
 * @module DownloadRecipientsService
 */

const AbstractionAlertDownloadRecipientsPresenter = require('../../../presenters/notices/setup/abstraction-alerts-download-recipients.presenter.js')
const DownloadRecipientsPresenter = require('../../../presenters/notices/setup/download-recipients.presenter.js')
const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchDownloadRecipientsService = require('./fetch-download-recipients.service.js')
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

  let formattedData

  if (session.journey === 'alerts') {
    const recipients = await FetchAbstractionAlertRecipientsService.go(session)

    formattedData = AbstractionAlertDownloadRecipientsPresenter.go(recipients, session)
  } else {
    const recipients = await FetchDownloadRecipientsService.go(session)

    formattedData = DownloadRecipientsPresenter.go(recipients, session.notificationType)
  }

  return {
    data: formattedData,
    type: 'text/csv',
    filename: `${notificationType} - ${referenceCode}.csv`
  }
}

module.exports = {
  go
}
