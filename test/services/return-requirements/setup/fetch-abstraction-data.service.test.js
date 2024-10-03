'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceAbstractionDataSeeder = require('../../../support/seeders/licence-abstraction-data.seeder.js')
const LicenceAgreementModel = require('../../../../app/models/licence-agreement.model.js')

// Thing under test
const FetchAbstractionDataService = require('../../../../app/services/return-requirements/setup/fetch-abstraction-data.service.js')

describe('Return Requirements - Fetch Abstraction Data service', () => {
  let seedData

  beforeEach(async () => {
    seedData = await LicenceAbstractionDataSeeder.seed()
  })

  describe('when called', () => {
    it('returns the abstraction data for the licence', async () => {
      const result = await FetchAbstractionDataService.go(seedData.licenceId)

      expect(result).to.equal({
        id: seedData.licenceId,
        waterUndertaker: false,
        twoPartTariffAgreement: false,
        licenceVersions: [
          {
            id: seedData.licenceVersions.currentId,
            startDate: new Date('2022-05-01'),
            status: 'current',
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
                purpose: { description: 'Heat Pump', id: seedData.allPurposes.purposes.heatPumpId, legacyId: '200', twoPartTariff: false },
                secondaryPurpose: { id: seedData.allPurposes.secondaryPurposes.secondaryElectricityId, legacyId: 'ELC' },
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
                purpose: { description: 'Vegetable Washing', id: seedData.allPurposes.purposes.vegetableWashingId, legacyId: '460', twoPartTariff: false },
                secondaryPurpose: { id: seedData.allPurposes.secondaryPurposes.secondaryAgricultureId, legacyId: 'AGR' },
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
                purpose: { description: 'Spray Irrigation - Direct', id: seedData.allPurposes.purposes.sprayIrrigationDirectId, legacyId: '400', twoPartTariff: true },
                secondaryPurpose: { id: seedData.allPurposes.secondaryPurposes.secondaryAgricultureId, legacyId: 'AGR' },
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

    describe('and the licence has a two-part tariff agreement', () => {
      beforeEach(async () => {
        // NOTE: The licence we seed is connected to a two-part tariff financial agreement but it has an end date in
        // the past. This is why FetchAbstractionDataService returns `twoPartTariffAgreement: false`. We remove the end
        // date here before calling the service to demonstrate that it will return true if a relevant licence agreement
        // record is found
        await LicenceAgreementModel.query()
          .patch({ endDate: null })
          .findById(seedData.licenceFinancialAgreements.endedTwoPartId)
      })

      it('returns "twoPartTariffAgreement" as true', async () => {
        const result = await FetchAbstractionDataService.go(seedData.licenceId)

        expect(result.twoPartTariffAgreement).to.be.true()
      })
    })
  })
})
