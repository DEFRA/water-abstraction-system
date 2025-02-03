'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 * @module DownloadRecipientsService
 */

const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')
const DownloadRecipientsPresenter = require('../../../presenters/notifications/setup/download-recipients.presenter.js')
const FetchDownloadRecipientsService = require('./fetch-download-recipients.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 *
 * The service will fetch recipients and then create a csv with the recipients' data.
 * The service will return the name of the file and file type.
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {Promise<object>} The data for the download link
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  const recipients = await FetchDownloadRecipientsService.go(returnsPeriod.dueDate, summer)

  const formattedData = DownloadRecipientsPresenter.go(recipients)

  return {
    data: formattedData,
    type: 'text/csv',
    filename: 'recipients.csv'
  }
}

module.exports = {
  go
}
