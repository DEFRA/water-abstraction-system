'use strict'

/**
 * Fetches all of the purpose ids
 * @module FetchPurposesService
 */

const PurposeModel = require('../../models/purpose.model.js')

/**
 * Fetches all of the purpose ids
 *
 * @returns {Promise<Object>} The list of all purpose ids
 */
async function go () {
  const purposes = await _fetch()
  const data = _data(purposes)

  return data
}

function _data (purposes) {
  const ids = []
  purposes.forEach((purpose) => {
    ids.push(purpose.id)
  })

  return ids
}

async function _fetch () {
  return PurposeModel.query()
    .select([
      'id'
    ])
}

module.exports = {
  go
}
