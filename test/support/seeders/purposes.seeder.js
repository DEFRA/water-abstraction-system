'use strict'

/**
 * @module PurposesSeeder
 */

const data = require('./data/purposes.data.js')
const { buildSeedValueString } = require('./seed-builder.js')
const { db } = require('../../../db/db.js')

const keys = ['id', 'legacyId', 'description', 'lossFactor', 'twoPartTariff', 'createdAt', 'updatedAt']

/**
 * Add all the purposes to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO  public.purposes (id, legacy_id, description, loss_factor, two_part_tariff, created_at, updated_at)
      VALUES ${buildSeedValueString(keys, data)}
          ON CONFLICT (legacy_id)
    DO UPDATE SET
    description = excluded.description,
    loss_factor = excluded.loss_factor,
    two_part_tariff = excluded.two_part_tariff,
    updated_at = now()
  `
  )
}

module.exports = {
  seed,
  data
}
