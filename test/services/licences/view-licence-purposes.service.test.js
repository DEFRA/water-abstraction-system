'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Things we need to stub
const FetchLicencePurposesService = require('../../../app/services/licences/fetch-licence-purposes.service.js')

// Thing under test
const ViewLicencePurposesService = require('../../../app/services/licences/view-licence-purposes.service.js')

describe('Licences - View Licence Purposes service', () => {
  beforeEach(() => {
    Sinon.stub(FetchLicencePurposesService, 'go').returns(_testFetchLicencePurposes())
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewLicencePurposesService.go('761bc44f-80d5-49ae-ab46-0a90495417b5')

      expect(result).to.equal({
        activeNavBar: 'search',
        id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
        licencePurposes: [
          {
            abstractionAmounts: [
              '180,000.00 cubic metres per year',
              '720.00 cubic metres per day',
              '144.00 cubic metres per hour',
              '40.00 litres per second'
            ],
            abstractionAmountsTitle: 'Abstraction amounts',
            abstractionMethods: 'Unspecified Pump',
            abstractionMethodsTitle: 'Method of abstraction',
            abstractionPeriod: '1 April to 31 October',
            abstractionPoints: ['At National Grid Reference TL 23198 88603'],
            abstractionPointsTitle: 'Abstraction point',
            purposeDescription: 'Spray Irrigation - Storage'
          }
        ],
        licenceRef: '01/123',
        pageTitle: 'Licence purpose details'
      })
    })
  })
})

function _testFetchLicencePurposes() {
  return LicenceModel.fromJson({
    id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
    licenceRef: '01/123',
    licenceVersions: [
      {
        createdAt: new Date('2022-06-05'),
        id: '4c42fd78-6e68-4eaa-9c88-781c323a5a38',
        reason: 'new-licence',
        status: 'current',
        startDate: new Date('2022-04-01'),
        licenceVersionPurposes: [
          {
            id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            annualQuantity: 180000,
            dailyQuantity: 720,
            hourlyQuantity: 144,
            instantQuantity: 40,
            licenceVersionPurposePoints: [
              {
                abstractionMethod: 'Unspecified Pump'
              }
            ],
            purpose: {
              id: '0316229a-e76d-4785-bc2c-65075a1a8f50',
              description: 'Spray Irrigation - Storage'
            },
            points: [
              {
                id: 'ab80acd6-7c2a-4f51-87f5-2c397829a0bb',
                description: null,
                ngr1: 'TL 23198 88603',
                ngr2: null,
                ngr3: null,
                ngr4: null,
                source: {
                  id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db',
                  description: 'SURFACE WATER SOURCE OF SUPPLY'
                }
              }
            ]
          }
        ]
      }
    ]
  })
}
