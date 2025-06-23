'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')

// Thing under test
const ViewLicencePurposePresenter = require('../../../app/presenters/licences/view-licence-purposes.presenter.js')

describe('Licences - View Licence Purpose presenter', () => {
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
            '180,000.00 cubic metres per year',
            '720.00 cubic metres per day',
            '144.00 cubic metres per hour',
            '40.00 litres per second'
          ])
        })
      })
    })

    describe('the "abstractionAmountsTitle" property', () => {
      describe('when the licence has one or less values in the abstractionAmounts array', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].annualQuantity = null
          licence.licenceVersions[0].licenceVersionPurposes[0].dailyQuantity = null
          licence.licenceVersions[0].licenceVersionPurposes[0].hourlyQuantity = null
        })

        it('returns the `abstractionAmountsTitle` of "Abstraction amount"', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionAmountsTitle).to.equal('Abstraction amount')
        })
      })

      describe('when the licence has more than one value in the abstractionAmounts array', () => {
        it('returns the `abstractionAmountsTitle` of "Abstraction amounts"', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionAmountsTitle).to.equal('Abstraction amounts')
        })
      })
    })

    describe('the "abstractionMethods" property', () => {
      describe('when the licence has more than two unique abstraction methods linked to a licence purpose', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposePoints = [
            {
              abstractionMethod: 'Unspecified Pump'
            },
            {
              abstractionMethod: 'Submersible Pump (Fixed)'
            },
            {
              abstractionMethod: 'Gravity & Sluice (Adjustable)'
            }
          ]
        })

        it('return the values display text joined with an ", and" (Unspecified Pump, Submersible Pump (Fixed), and Gravity & Sluice (Adjustable))', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionMethods).to.equal(
            'Unspecified Pump, Submersible Pump (Fixed), and Gravity & Sluice (Adjustable)'
          )
        })
      })

      describe('when the licence has two unique abstraction methods linked to a licence purpose', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposePoints = [
            {
              abstractionMethod: 'Unspecified Pump'
            },
            {
              abstractionMethod: 'Submersible Pump (Fixed)'
            }
          ]
        })

        it('return the values display text joined with an "and" (Unspecified Pump and Submersible Pump (Fixed))', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionMethods).to.equal('Unspecified Pump and Submersible Pump (Fixed)')
        })
      })

      describe('when the licence has one unique abstraction method linked to a licence purpose', () => {
        it('return the values display text (Unspecified Pump)', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionMethods).to.equal('Unspecified Pump')
        })
      })
    })

    describe('the "abstractionMethodsTitle" property', () => {
      describe('when there are multiple unique abstraction methods linked to a licence purpose', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposePoints = [
            {
              abstractionMethod: 'Unspecified Pump'
            },
            {
              abstractionMethod: 'Gravity & Sluice (Adjustable)'
            }
          ]
        })

        it('returns the text "Methods of abstraction" as the title', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionMethodsTitle).to.equal('Methods of abstraction')
        })
      })

      describe('when there is one or less unique abstraction methods linked to a licence purpose', () => {
        it('returns the text "Method of abstraction" as the title', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionMethodsTitle).to.equal('Method of abstraction')
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

    describe('the "abstractionPointsTitle" property', () => {
      describe('when the licence has one or less values in the abstractionPoints array', () => {
        it('returns the `abstractionPointsTitle` of "Abstraction point"', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionPointsTitle).to.equal('Abstraction point')
        })
      })

      describe('when the licence has more than one value in the abstractionPoints array', () => {
        beforeEach(() => {
          const point = PointModel.fromJson({
            id: '21d8e899-68de-4a63-9ee7-f1ee56e4b58c',
            description: null,
            ngr1: 'TL 22198 84603',
            ngr2: null,
            ngr3: null,
            ngr4: null,
            source: {
              id: 'd5fdb3ca-3f03-43ef-96ca-5c3e97e7f112',
              description: 'Tidal Water Midlands Region'
            }
          })

          licence.licenceVersions[0].licenceVersionPurposes[0].points.push(point)
        })

        it('returns the `abstractionPointsTitle` of "Abstraction points"', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].abstractionPointsTitle).to.equal('Abstraction points')
        })
      })
    })

    describe('the "purposeDescription"', () => {
      describe('when the licence has a related purpose with a populated description field', () => {
        it('returns the purpose description', () => {
          const result = ViewLicencePurposePresenter.go(licence)

          expect(result.licencePurposes[0].purposeDescription).equal('Spray Irrigation - Storage')
        })
      })
    })
  })
})

function _testLicence() {
  const point = PointModel.fromJson({
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
  })

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
            points: [point]
          }
        ]
      }
    ]
  })
}
