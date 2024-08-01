'use strict'

/**
 * @module LicenceVersionPurposeConditionTypeSeeder
 */

const data = require('./data/licence-versions-purposes-condition-types.js')
const { buildSeedValueString } = require('./seed-builder.js')
const { db } = require('../../../db/db.js')

const keys = ['id', 'code', 'subcode', 'description', 'subcodeDescription', 'displayTitle', 'createdAt', 'updatedAt']

/**
 * Add all of the licence version purpose conditions to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO  public.licence_version_purpose_condition_types (id, code, subcode, description, subcode_description, display_title, created_at, updated_at)
      VALUES ${buildSeedValueString(keys, data)};
  `
  )
}

module.exports = {
  data,
  seed
}
