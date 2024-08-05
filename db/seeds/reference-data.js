'use strict'

const LicenceVersionPurposeConditionTypeSeeder = require('../../test/support/seeders/licence-version-purpose-condition-types.seeder.js')
const PurposesSeeder = require('./03-purposes.js')
const PrimaryPurposesSeeder = require('./04-primary-purposes.js')
const RegionsSeeder = require('./02-regions.js')
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
