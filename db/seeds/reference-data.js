'use strict'

const LicenceVersionPurposeConditionTypeSeeder = require('../../test/support/seeders/licence-version-purpose-condition-types.seeder.js')

async function seed () {
  await LicenceVersionPurposeConditionTypeSeeder.seed()
}

module.exports = {
  seed
}
