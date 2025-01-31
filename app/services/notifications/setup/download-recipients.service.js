'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 * @module DownloadRecipientsService
 */

const DownloadRecipientsPresenter = require('../../../presenters/notifications/setup/download-recipients.presenter.js')
const FetchDownloadRecipientsService = require('./fetch-download-recipients.service.js')
const SessionModel = require('../../../models/session.model.js')
const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 *
 * The service will fetch recipients and then create a csv with the recipients' data.
 * The service will return the name of the file and file type.
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {object} The data for the download link
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { returnsPeriod } = session
  const selectedReturnsPeriod = _extractReturnPeriod(returnsPeriod)
  const summer = _summer(returnsPeriod)

  const data = await FetchDownloadRecipientsService.go(selectedReturnsPeriod.dueDate, summer)

  const formattedData = DownloadRecipientsPresenter.go(data)

  return {
    data: formattedData,
    type: 'text/csv',
    filename: 'recipients.csv'
  }
}

function _extractReturnPeriod(returnsPeriod) {
  const periods = determineUpcomingReturnPeriods()

  return periods.find((period) => {
    return period.name === returnsPeriod
  })
}

function _summer(returnsPeriod) {
  return returnsPeriod === 'summer' ? 'true' : 'false'
}

module.exports = {
  go
}
