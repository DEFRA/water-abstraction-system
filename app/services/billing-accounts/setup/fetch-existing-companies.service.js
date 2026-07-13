/**
 * Fetches any companies that meet the search criteria from the database
 * @module FetchExistingCompaniesService
 */

import CompanyModel from '../../../models/company.model.js'
import { db } from '../../../../db/db.js'
const NUMBER_OF_RESULTS = 15

/**
 * Fetches any companies that meet the search criteria from the database
 *
 * @param {string} searchInput - The string to search for
 *
 * @returns {Promise<object[]>} an object containing the matching companies needed to populate the view
 */
export default async function (searchInput) {
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
    .limit(NUMBER_OF_RESULTS)
}
