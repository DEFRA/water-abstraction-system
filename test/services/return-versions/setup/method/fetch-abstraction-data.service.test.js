// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as LicenceAbstractionDataSeeder from '../../../../support/seeders/licence-abstraction-data.seeder.js'

// Thing under test
import FetchAbstractionDataService from '../../../../../src/services/return-versions/setup/method/fetch-abstraction-data.service.js'

describe('Return Versions - Setup - Fetch Abstraction Data service', () => {
  let seedData

  beforeAll(async () => {
    seedData = await LicenceAbstractionDataSeeder.seed()
  })

  describe('when called', () => {
    it('returns the abstraction data for the licence and licence version', async () => {
      const result = await FetchAbstractionDataService(seedData.licenceId, seedData.licenceVersions.currentId)

      expect(result).toEqual({
        id: seedData.licenceId,
        licenceRef: seedData.licenceRef,
        licenceVersions: [
          {
            endDate: null,
            id: seedData.licenceVersions.currentId,
            licenceVersionPurposes: [
              {
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 455,
                externalId: seedData.licenceVersionPurposes.electricity.externalId,
                id: seedData.licenceVersionPurposes.electricity.id,
                points: [
                  {
                    description: 'INTAKE POINT',
                    id: seedData.points.electricity1.id
                  },
                  {
                    description: 'OUT TAKE POINT',
                    id: seedData.points.electricity2.id
                  }
                ],
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
                }
              },
              {
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 2675,
                externalId: seedData.licenceVersionPurposes.standard.externalId,
                id: seedData.licenceVersionPurposes.standard.id,
                points: [
                  {
                    description: 'SOUTH BOREHOLE',
                    id: seedData.points.standard.id
                  }
                ],
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
                }
              },
              {
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                dailyQuantity: 300,
                externalId: seedData.licenceVersionPurposes.twoPartTariff.externalId,
                id: seedData.licenceVersionPurposes.twoPartTariff.id,
                points: [
                  {
                    description: 'MAIN INTAKE',
                    id: seedData.points.twoPartTariff.id
                  }
                ],
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
                }
              }
            ],
            startDate: new Date('2022-05-01')
          }
        ],
        waterUndertaker: false
      })
    })
  })
})
