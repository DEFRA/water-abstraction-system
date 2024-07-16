'use strict'

const LicenceVersionPurposeConditionTypeSeeder = require('../../test/support/seeders/licence-version-purpose-condition-types.seeder.js')
const RegionsSeeder = require('../../test/support/seeders/regions.seeder.js')

async function seed () {
  await LicenceVersionPurposeConditionTypeSeeder.seed()
  await RegionsSeeder.seed()
}

module.exports = {
  seed
}
