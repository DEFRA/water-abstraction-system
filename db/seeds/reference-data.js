'use strict'

const LicenceVersionPurposeConditionTypeSeeder = require('../../test/support/seeders/licence-version-purpose-condition-types.seeder.js')
const RegionsSeeder = require('../../test/support/seeders/regions.seeder.js')
const PurposesSeeder = require('../../test/support/seeders/purposes.seeder.js')

async function seed () {
  await LicenceVersionPurposeConditionTypeSeeder.seed()
  await RegionsSeeder.seed()
  await PurposesSeeder.seed()
}

module.exports = {
  seed
}
