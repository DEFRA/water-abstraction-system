'use strict'

const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const RegionsSeeder = require('../../../support/seeders/regions.seeder.js')

const region = RegionsSeeder.data.find((region) => {
  return region.displayName === 'Test Region'
})

function importLicence () {
  return {
    expiredDate: '2015-03-31',
    lapsedDate: null,
    licenceRef: generateLicenceRef(),
    naldRegionId: region.naldRegionId,
    regions: {
      historicalAreaCode: 'RIDIN',
      regionalChargeArea: 'Yorkshire',
      standardUnitChargeCode: 'YORKI',
      localEnvironmentAgencyPlanCode: 'AIREL'
    },
    revokedDate: null,
    startDate: '2005-06-03',
    waterUndertaker: false
  }
}

function create (data) {
  return {
    ...importLicence()
  }
}

module.exports = {
  create
}
