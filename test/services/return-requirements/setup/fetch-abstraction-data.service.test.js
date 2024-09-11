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
  let seedIds

  beforeEach(async () => {
    seedIds = await LicenceAbstractionDataSeeder.seed()
  })

  describe('when called', () => {
    it('returns the abstraction data for the licence', async () => {
      const result = await FetchAbstractionDataService.go(seedIds.licenceId)

      expect(result).to.equal({
        id: seedIds.licenceId,
        waterUndertaker: false,
        twoPartTariffAgreement: false,
        licenceVersions: [
          {
            id: seedIds.licenceVersions.currentId,
            startDate: new Date('2022-05-01'),
            status: 'current',
            licenceVersionPurposes: [
              {
                id: seedIds.licenceVersionPurposes.electricity.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 455,
                externalId: seedIds.licenceVersionPurposes.electricity.externalId,
                primaryPurpose: { id: seedIds.allPurposes.primaryPurposes.primaryElectricityId, legacyId: 'P' },
                purpose: { description: 'Heat Pump', id: seedIds.allPurposes.purposes.heatPumpId, legacyId: '200', twoPartTariff: false },
                secondaryPurpose: { id: seedIds.allPurposes.secondaryPurposes.secondaryElectricityId, legacyId: 'ELC' },
                licenceVersionPurposePoints: [
                  {
                    description: 'INTAKE POINT',
                    id: seedIds.licenceVersionPurposePoints.electricity1.id,
                    naldPointId: seedIds.licenceVersionPurposePoints.electricity1.naldPointId
                  },
                  {
                    description: 'OUT TAKE POINT',
                    id: seedIds.licenceVersionPurposePoints.electricity2.id,
                    naldPointId: seedIds.licenceVersionPurposePoints.electricity2.naldPointId
                  }
                ]
              },
              {
                id: seedIds.licenceVersionPurposes.standard.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 2675,
                externalId: seedIds.licenceVersionPurposes.standard.externalId,
                primaryPurpose: { id: seedIds.allPurposes.primaryPurposes.primaryAgricultureId, legacyId: 'A' },
                purpose: { description: 'Vegetable Washing', id: seedIds.allPurposes.purposes.vegetableWashingId, legacyId: '460', twoPartTariff: false },
                secondaryPurpose: { id: seedIds.allPurposes.secondaryPurposes.secondaryAgricultureId, legacyId: 'AGR' },
                licenceVersionPurposePoints: [
                  {
                    description: 'SOUTH BOREHOLE',
                    id: seedIds.licenceVersionPurposePoints.standard.id,
                    naldPointId: seedIds.licenceVersionPurposePoints.standard.naldPointId
                  }
                ]
              },
              {
                id: seedIds.licenceVersionPurposes.twoPartTariff.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 300,
                externalId: seedIds.licenceVersionPurposes.twoPartTariff.externalId,
                primaryPurpose: { id: seedIds.allPurposes.primaryPurposes.primaryAgricultureId, legacyId: 'A' },
                purpose: { description: 'Spray Irrigation - Direct', id: seedIds.allPurposes.purposes.sprayIrrigationDirectId, legacyId: '400', twoPartTariff: true },
                secondaryPurpose: { id: seedIds.allPurposes.secondaryPurposes.secondaryAgricultureId, legacyId: 'AGR' },
                licenceVersionPurposePoints: [
                  {
                    description: 'MAIN INTAKE',
                    id: seedIds.licenceVersionPurposePoints.twoPartTariff.id,
                    naldPointId: seedIds.licenceVersionPurposePoints.twoPartTariff.naldPointId
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
          .findById(seedIds.licenceFinancialAgreements.endedTwoPartId)
      })

      it('returns "twoPartTariffAgreement" as true', async () => {
        const result = await FetchAbstractionDataService.go(seedIds.licenceId)

        expect(result.twoPartTariffAgreement).to.be.true()
      })
    })
  })
})
