'use strict'

/**
 * @module RegionsSeeder
 */

const data = require('./data/region.data.js')
const { buildSeedValueString } = require('./seed-builder.js')
const { db } = require('../../../db/db.js')

const keys = ['id', 'chargeRegionId', 'naldRegionId', 'name', 'displayName', 'createdAt', 'updatedAt']

/**
 * Add all the regions to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO  public.regions (id, charge_region_id, nald_region_id, name, display_name, created_at, updated_at)
      VALUES ${buildSeedValueString(keys, data)};
  `
  )
}

module.exports = {
  seed,
  data
}
