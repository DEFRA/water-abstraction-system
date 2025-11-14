'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLicencePurposesService = require('../../../app/services/licences/fetch-licence-purposes.service.js')

// Thing under test
const ViewPurposesService = require('../../../app/services/licences/view-purposes.service.js')

describe('Licences - View Purposes service', () => {
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    Sinon.stub(FetchLicencePurposesService, 'go').returns(_testFetchLicencePurposes(licenceId, licenceRef))
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPurposesService.go(licenceId)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/licences/${licenceId}/summary`,
          text: 'Go back to summary'
        },
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
        pageTitle: 'Licence purpose details',
        pageTitleCaption: `Licence ${licenceRef}`,
        showingPurposes: 'Showing 1 purposes'
      })
    })
  })
})

function _testFetchLicencePurposes(licenceId, licenceRef) {
  return LicenceModel.fromJson({
    id: licenceId,
    licenceRef,
    licenceVersions: [
      {
        createdAt: new Date('2022-06-05'),
        id: generateUUID(),
        reason: 'new-licence',
        status: 'current',
        startDate: new Date('2022-04-01'),
        licenceVersionPurposes: [
          {
            id: generateUUID(),
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
              id: generateUUID(),
              description: 'Spray Irrigation - Storage'
            },
            points: [
              {
                id: generateUUID(),
                description: null,
                ngr1: 'TL 23198 88603',
                ngr2: null,
                ngr3: null,
                ngr4: null,
                source: {
                  id: generateUUID(),
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
