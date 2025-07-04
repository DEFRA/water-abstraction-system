'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceAbstractionDataSeeder = require('../../../../support/seeders/licence-abstraction-data.seeder.js')

// Thing under test
const FetchAbstractionDataService = require('../../../../../app/services/return-versions/setup/method/fetch-abstraction-data.service.js')

describe('Return Versions - Setup - Fetch Abstraction Data service', () => {
  let seedData

  before(async () => {
    seedData = await LicenceAbstractionDataSeeder.seed()
  })

  describe('when called', () => {
    it('returns the abstraction data for the licence and licence version', async () => {
      const result = await FetchAbstractionDataService.go(seedData.licenceId, seedData.licenceVersions.currentId)

      expect(result).to.equal({
        id: seedData.licenceId,
        licenceRef: seedData.licenceRef,
        waterUndertaker: false,
        licenceVersions: [
          {
            id: seedData.licenceVersions.currentId,
            endDate: null,
            startDate: new Date('2022-05-01'),
            licenceVersionPurposes: [
              {
                id: seedData.licenceVersionPurposes.electricity.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 455,
                externalId: seedData.licenceVersionPurposes.electricity.externalId,
                primaryPurpose: { id: seedData.allPurposes.primaryPurposes.primaryElectricityId, legacyId: 'P' },
                purpose: {
                  description: 'Heat Pump',
                  id: seedData.allPurposes.purposes.heatPumpId,
                  legacyId: '200',
                  twoPartTariff: false
                },
                secondaryPurpose: {
                  id: seedData.allPurposes.secondaryPurposes.secondaryElectricityId,
                  legacyId: 'ELC'
                },
                points: [
                  {
                    description: 'INTAKE POINT',
                    id: seedData.points.electricity1.id
                  },
                  {
                    description: 'OUT TAKE POINT',
                    id: seedData.points.electricity2.id
                  }
                ]
              },
              {
                id: seedData.licenceVersionPurposes.standard.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 2675,
                externalId: seedData.licenceVersionPurposes.standard.externalId,
                primaryPurpose: { id: seedData.allPurposes.primaryPurposes.primaryAgricultureId, legacyId: 'A' },
                purpose: {
                  description: 'Vegetable Washing',
                  id: seedData.allPurposes.purposes.vegetableWashingId,
                  legacyId: '460',
                  twoPartTariff: false
                },
                secondaryPurpose: {
                  id: seedData.allPurposes.secondaryPurposes.secondaryAgricultureId,
                  legacyId: 'AGR'
                },
                points: [
                  {
                    description: 'SOUTH BOREHOLE',
                    id: seedData.points.standard.id
                  }
                ]
              },
              {
                id: seedData.licenceVersionPurposes.twoPartTariff.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 300,
                externalId: seedData.licenceVersionPurposes.twoPartTariff.externalId,
                primaryPurpose: { id: seedData.allPurposes.primaryPurposes.primaryAgricultureId, legacyId: 'A' },
                purpose: {
                  description: 'Spray Irrigation - Direct',
                  id: seedData.allPurposes.purposes.sprayIrrigationDirectId,
                  legacyId: '400',
                  twoPartTariff: true
                },
                secondaryPurpose: {
                  id: seedData.allPurposes.secondaryPurposes.secondaryAgricultureId,
                  legacyId: 'AGR'
                },
                points: [
                  {
                    description: 'MAIN INTAKE',
                    id: seedData.points.twoPartTariff.id
                  }
                ]
              }
            ]
          }
        ]
      })
    })
  })
})
