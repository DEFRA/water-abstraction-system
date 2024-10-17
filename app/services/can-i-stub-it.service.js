'use strict'

/**
 * Fetches stuff
 * @module CanIStubItService
 */

const RegionModel = require('../models/region.model.js')

/**
 * Fetches stuff
 *
 * @returns {Promise<object>} Contains an array of stuff
 */
async function go () {
  const allTheStuff = await RegionModel.query()
    .select('*')
    .where('naldRegionId', 2)
    .where('name', 'Midlands')
    .where('displayName', 'Midlands')

  return allTheStuff
}

module.exports = {
  go
}
