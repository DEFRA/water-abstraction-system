'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const ViewLicencePurposePresenter = require('../../../app/presenters/licences/view-licence-purposes.presenter.js')

describe('View Licence Purpose presenter', () => {
  let licence

  beforeEach(() => {
    licence = _testLicence()
  })

  describe('when provided with populated licence purposes', () => {
    it('returns the expected licence purpose details', () => {
      const result = ViewLicencePurposePresenter.go(licence)

      expect(result).to.equal({
        id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
        licencePurposes: [
          {
            abstractionAmounts: [
              '180000.00 cubic metres per year',
              '720.00 cubic metres per day',
              '144.00 cubic metres per hour',
              '40.00 cubic metres per second (Instantaneous Quantity)'
            ],
            abstractionPeriod: '1 April to 31 October',
            abstractionPoints: [
              'At National Grid Reference TL 23198 88603'
            ],
            purposeDescription: 'Spray Irrigation - Storage'
          }
        ],
        licenceRef: '01/123',
        pageTitle: 'Licence purpose details'
      })
    })
  })

  describe('the "licencePurposes" property', () => {
    describe('the "abstractionAmounts" property', () => {
      describe('when the licence does not have populated annual, daily, hourly and per second abstraction quantity fields', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].annualQuantity = null
          licence.licenceVersions[0].licenceVersionPurposes[0].dailyQuantity = null
          licence.licenceVersions[0].licenceVersionPurposes[0].hourlyQuantity = null
          licence.licenceVersions[0].licenceVersionPurposes[0].instantQuantity = null
        })

        it('returns an empty array', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionAmounts).to.equal([])
        })
      })

      describe('when the licence has a related licenceVersionPurpose with populated annual, daily, hourly and per second abstraction quantity fields', () => {
        it('returns an array of abstraction amounts for each populated time frame', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionAmounts).to.equal([
            '180000.00 cubic metres per year',
            '720.00 cubic metres per day',
            '144.00 cubic metres per hour',
            '40.00 cubic metres per second (Instantaneous Quantity)'
          ])
        })
      })
    })

    describe('the "abstractionPeriod" property', () => {
      describe('when the licence has a related licenceVersionPurpose with populated abstraction period fields', () => {
        it('returns the licenceVersionPurposes abstraction period', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionPeriod).to.equal('1 April to 31 October')
        })
      })
    })

    describe('the "abstractionPoints" property', () => {
      describe('when the licence does not have related points', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].points = []
        })

        it('returns an empty array for the abstraction points', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionPoints).to.equal([])
        })
      })

      describe('when the licence has related points', () => {
        it('returns the related points, formatted as an array of strings', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
        })
      })
    })

    describe('the "purposeDescription"', () => {
      describe('when the licence does not have a related purpose description', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].purpose.description = null
        })

        it('returns the an empty array', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].purposeDescription).equal('')
        })
      })

      describe('when the licence has a related purpose with a populated description field', () => {
        it('returns the purpose description', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].purposeDescription).equal('Spray Irrigation - Storage')
        })
      })
    })

    describe('when there are multiple licences with identical `licenceVersionPurposes` details', () => {
      beforeEach(() => {
        licence.licenceVersions[0].licenceVersionPurposes.push({
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          annualQuantity: 180000,
          dailyQuantity: 720,
          hourlyQuantity: 144,
          instantQuantity: 40,
          purpose: {
            id: '0316229a-e76d-4785-bc2c-65075a1a8f50',
            description: 'Spray Irrigation - Storage'
          },
          points: [{
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
          }]
        })
      })

      it('returns the first occurrence of the `licenceVersionPurposes` and discards duplicates', () => {
        const result = ViewLicencePurposePresenter.go(licence)

        expect(result.licencePurposes).to.have.length(1)
      })
    })
  })
})

function _testLicence () {
  return LicenceModel.fromJson({
    id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
    licenceRef: '01/123',
    licenceVersions: [{
      createdAt: new Date('2022-06-05'),
      id: '4c42fd78-6e68-4eaa-9c88-781c323a5a38',
      reason: 'new-licence',
      status: 'current',
      startDate: new Date('2022-04-01'),
      licenceVersionPurposes: [{
        id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 10,
        annualQuantity: 180000,
        dailyQuantity: 720,
        hourlyQuantity: 144,
        instantQuantity: 40,
        purpose: {
          id: '0316229a-e76d-4785-bc2c-65075a1a8f50',
          description: 'Spray Irrigation - Storage'
        },
        points: [{
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
        }]
      }]
    }]
  })
}
