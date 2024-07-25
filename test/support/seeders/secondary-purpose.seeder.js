'use strict'

/**
 * @module SecondaryPurposesSeeder
 */

const data = require('./data/secondary-purposes.js')
const { buildSeedValueString } = require('./seed-builder.js')
const { db } = require('../../../db/db.js')

const keys = ['id', 'legacyId', 'description', 'createdAt', 'updatedAt']

/**
 * Add all the purposes to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO  public.secondary_purposes (id, legacy_id, description, created_at, updated_at)
      VALUES ${buildSeedValueString(keys, data)};
  `
  )
}

module.exports = {
  seed,
  data
}
