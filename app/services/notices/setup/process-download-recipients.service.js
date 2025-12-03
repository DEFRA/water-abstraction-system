'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notices setup download link
 * @module ProcessDownloadRecipientsService
 */

const DownloadAbstractionAlertPresenter = require('../../../presenters/notices/setup/download-abstraction-alert.presenter.js')
const DownloadReturnsNoticePresenter = require('../../../presenters/notices/setup/download-returns-notice.presenter.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const { NoticeJourney } = require('../../../lib/static-lookups.lib.js')

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

  const recipients = await FetchRecipientsService.go(session, true)

  const formattedData = await _formattedData(recipients, session)

  return {
    data: formattedData,
    type: 'text/csv',
    filename: `${notificationType} - ${referenceCode}.csv`
  }
}

async function _formattedData(recipients, session) {
  if (session.journey === NoticeJourney.ALERTS) {
    return DownloadAbstractionAlertPresenter.go(recipients, session)
  }

  return DownloadReturnsNoticePresenter.go(recipients, session)
}

module.exports = {
  go
}
