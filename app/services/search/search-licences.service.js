'use strict'

/**
 * Searches for licences to be displayed on the /search page, used by QuerySearchService
 * @module SearchLicenceService
 */

const { ref } = require('objection')

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceDocumentHeaderModel = require('../../models/licence-document-header.model.js')

/**
 * Searches for licences to be displayed on the /search page, used by QuerySearchService
 *
 * @param {string} query - The search query
 * @param {number} page - The page number to display for pagination
 * @returns {Promise<object>} The licences that match the search criteria
 */
async function go(query, page = 1) {
  const licences = await LicenceDocumentHeaderModel.query()
      .where('licenceRef', 'ilike', `%${query}%`)
      .orWhere('licenceName', 'ilike', `%${query}%`)
      .orWhere(ref('userData:contactDetails.address'), 'ilike', `%${query}%`)
      .select(['id', 'licenceRef', 'metadata', 'licenceName'])
      .orderBy([{ column: 'licenceRef', order: 'asc' }])
      .page(page - 1, DatabaseConfig.defaultPageSize)

  const pageData = {
    activeNavBar: 'search',
    ...formattedData
  }

  if (!query || query.trim() === '') {
    pageData.error = {
      errorList: [
        {
          href: '#$query',
          text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
        }
      ],
      query: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
    }

    return pageData
  }

  return pageData
}

module.exports = {
  go
}
