'use strict'

/**
 * Fetches any companies that meet the search criteria from the database
 * @module FetchExistingCompaniesService
 */

const CompanyModel = require('../../../models/company.model.js')
const { db } = require('../../../../db/db.js')

/**
 * Fetches any companies that meet the search criteria from the database
 *
 * @param {string} searchInput - The string to search for
 *
 * @returns {Promise<object[]>} an object containing the matching companies needed to populate the view
 */
async function go(searchInput) {
  const sanatisedSearchInput = searchInput
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)

  return CompanyModel.query()
    .select('id', 'name', db.raw(`"name" ILIKE '${sanatisedSearchInput}' AS exact`))
    .whereILike('name', `%${sanatisedSearchInput}%`)
    .orderBy([
      { column: 'exact', order: 'desc' },
      { column: 'name', order: 'asc' }
    ])
    .limit(15)
}

module.exports = {
  go
}
