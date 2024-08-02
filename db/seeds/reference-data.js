'use strict'

const LicenceVersionPurposeConditionTypeSeeder = require('../../test/support/seeders/licence-version-purpose-condition-types.seeder.js')
const RegionsSeeder = require('../../test/support/seeders/regions.seeder.js')
const PurposesSeeder = require('../../test/support/seeders/purposes.seeder.js')
const PrimaryPurposesSeeder = require('../../test/support/seeders/primary-purpose.seeder.js')
const SecondaryPurposesSeeder = require('../../test/support/seeders/secondary-purpose.seeder.js')

async function seed () {
  await LicenceVersionPurposeConditionTypeSeeder.seed()
  await RegionsSeeder.seed()
  await PurposesSeeder.seed()
  await PrimaryPurposesSeeder.seed()
  await SecondaryPurposesSeeder.seed()
}

module.exports = {
  seed
}
