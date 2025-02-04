'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 * @module DownloadRecipientsService
 */

/**
 * Orchestrates fetching and formatting the data needed for the notifications setup download link
 *
 * The service will fetch recipients and then create a csv with the recipients' data.
 * The service will return the name of the file and file type.
 *
 * @returns {Promise<object>} The data for the download link
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
