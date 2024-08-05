'use strict'

const LicenceVersionPurposeConditionTypeSeeder = require('./06-licence-version-purpose-condition-types.js')
const PurposesSeeder = require('./03-purposes.js')
const PrimaryPurposesSeeder = require('./04-primary-purposes.js')
const RegionsSeeder = require('./02-regions.js')
const SecondaryPurposesSeeder = require('./05-secondary-purposes.js')

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
