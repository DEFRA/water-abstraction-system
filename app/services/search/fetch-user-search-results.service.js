'use strict'

/**
 * Handles fetching search results for users on the /search page
 * @module FetchUserSearchResultsService
 */

const UserModel = require('../../models/user.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Handles fetching search results for users on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 * @param {boolean} matchFullUsername - Whether to perform a full match or just a partial match (the default)
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page, matchFullUsername = false) {
  const fullUsername = _fullUsername(query)
  const partialUsername = `%${fullUsername}%`

  const select = UserModel.query()
    .select(['application', 'id', 'lastLogin', 'username'])
    .orderBy([{ column: 'username', order: 'asc' }])

  if (matchFullUsername) {
    return select.where('username', 'ilike', fullUsername).page(page - 1, 1000)
  }

  return select
    .whereNot('username', 'ilike', fullUsername)
    .where('username', 'ilike', partialUsername)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

function _fullUsername(query) {
  return query
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

module.exports = {
  go
}
