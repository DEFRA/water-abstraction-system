'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 * @module DownloadRecipientsService
 */

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 *
 * The service will fetch recipients and then create a csv with the recipients' data.
 *
 * It does not seem necessary to use a data stream to create the csv as the data is relatively small.
 *
 * @returns {Promise<object>} The data for the download link (csv string, filename and type)
 */
async function go() {
  const csv = 'Licences\n12234\n'

  return {
    data: csv,
    type: 'text/csv',
    filename: 'recipients.csv'
  }
}

module.exports = {
  go
}
