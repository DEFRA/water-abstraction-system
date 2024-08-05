'use strict'

/**
 * @module PrimaryPurposesSeeder
 */

const data = require('./data/primary-purposes.data.js')
const { buildSeedValueString } = require('./seed-builder.js')
const { db } = require('../../../db/db.js')

const keys = ['id', 'legacyId', 'description', 'createdAt', 'updatedAt']

/**
 * Add all the purposes to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO  public.primary_purposes (id, legacy_id, description, created_at, updated_at)
      VALUES ${buildSeedValueString(keys, data)}
    ON CONFLICT (legacy_id)
    DO UPDATE SET
    description = excluded.description,
    updated_at = now()
  `
  )
}

module.exports = {
  seed,
  data
}
