'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceFixture = require('../../fixtures/licences.fixture.js')
const PointModel = require('../../../app/models/point.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const PurposesPresenter = require('../../../app/presenters/licences/purposes.presenter.js')

describe('Licences - Purposes presenter', () => {
  let licenceFixture

  beforeEach(() => {
    licenceFixture = LicenceFixture.licence()
  })

  describe('when provided with populated licence purposes', () => {
    it('returns the expected licence purpose details', () => {
      const result = PurposesPresenter.go(licenceFixture.licence)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licenceFixture.licence.id}/summary`,
          text: 'Go back to summary'
        },
        licenceBaseLink: `/system/licences/${licenceFixture.licence.id}`,
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
        pageTitle: 'Purposes, periods and amounts',
        pageTitleCaption: `Licence ${licenceFixture.licence.licenceRef}`,
        showingPurposes: 'Showing 1 purposes'
      })
    })
  })

  describe('the "licencePurposes" property', () => {
    describe('the "abstractionAmounts" property', () => {
      describe('when the licence does not have populated annual, daily, hourly and per second abstraction quantity fields', () => {
        beforeEach(() => {
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].annualQuantity = null
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].dailyQuantity = null
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].hourlyQuantity = null
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].instantQuantity = null
        })

        it('returns an empty array', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionAmounts).to.equal([])
        })
      })

      describe('when the licence has a related licenceVersionPurpose with populated annual, daily, hourly and per second abstraction quantity fields', () => {
        it('returns an array of abstraction amounts for each populated time frame', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

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
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].annualQuantity = null
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].dailyQuantity = null
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].hourlyQuantity = null
        })

        it('returns the `abstractionAmountsTitle` of "Abstraction amount"', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionAmountsTitle).to.equal('Abstraction amount')
        })
      })

      describe('when the licence has more than one value in the abstractionAmounts array', () => {
        it('returns the `abstractionAmountsTitle` of "Abstraction amounts"', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionAmountsTitle).to.equal('Abstraction amounts')
        })
      })
    })

    describe('the "abstractionMethods" property', () => {
      describe('when the licence has more than two unique abstraction methods linked to a licence purpose', () => {
        beforeEach(() => {
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposePoints = [
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
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionMethods).to.equal(
            'Unspecified Pump, Submersible Pump (Fixed), and Gravity & Sluice (Adjustable)'
          )
        })
      })

      describe('when the licence has two unique abstraction methods linked to a licence purpose', () => {
        beforeEach(() => {
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposePoints = [
            {
              abstractionMethod: 'Unspecified Pump'
            },
            {
              abstractionMethod: 'Submersible Pump (Fixed)'
            }
          ]
        })

        it('return the values display text joined with an "and" (Unspecified Pump and Submersible Pump (Fixed))', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionMethods).to.equal('Unspecified Pump and Submersible Pump (Fixed)')
        })
      })

      describe('when the licence has one unique abstraction method linked to a licence purpose', () => {
        it('return the values display text (Unspecified Pump)', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionMethods).to.equal('Unspecified Pump')
        })
      })
    })

    describe('the "abstractionMethodsTitle" property', () => {
      describe('when there are multiple unique abstraction methods linked to a licence purpose', () => {
        beforeEach(() => {
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposePoints = [
            {
              abstractionMethod: 'Unspecified Pump'
            },
            {
              abstractionMethod: 'Gravity & Sluice (Adjustable)'
            }
          ]
        })

        it('returns the text "Methods of abstraction" as the title', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionMethodsTitle).to.equal('Methods of abstraction')
        })
      })

      describe('when there is one or less unique abstraction methods linked to a licence purpose', () => {
        it('returns the text "Method of abstraction" as the title', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionMethodsTitle).to.equal('Method of abstraction')
        })
      })
    })

    describe('the "abstractionPeriod" property', () => {
      describe('when the licence has a related licenceVersionPurpose with populated abstraction period fields', () => {
        it('returns the licenceVersionPurposes abstraction period', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionPeriod).to.equal('1 April to 31 October')
        })
      })
    })

    describe('the "abstractionPoints" property', () => {
      describe('when the licence does not have related points', () => {
        beforeEach(() => {
          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].points = []
        })

        it('returns an empty array for the abstraction points', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionPoints).to.equal([])
        })
      })

      describe('when the licence has related points', () => {
        it('returns the related points, formatted as an array of strings', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
        })
      })
    })

    describe('the "abstractionPointsTitle" property', () => {
      describe('when the licence has one or less values in the abstractionPoints array', () => {
        it('returns the `abstractionPointsTitle` of "Abstraction point"', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionPointsTitle).to.equal('Abstraction point')
        })
      })

      describe('when the licence has more than one value in the abstractionPoints array', () => {
        beforeEach(() => {
          const point = PointModel.fromJson({
            id: generateUUID(),
            description: null,
            ngr1: 'TL 22198 84603',
            ngr2: null,
            ngr3: null,
            ngr4: null,
            source: {
              id: generateUUID(),
              description: 'Tidal Water Midlands Region'
            }
          })

          licenceFixture.licence.licenceVersions[0].licenceVersionPurposes[0].points.push(point)
        })

        it('returns the `abstractionPointsTitle` of "Abstraction points"', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].abstractionPointsTitle).to.equal('Abstraction points')
        })
      })
    })

    describe('the "purposeDescription"', () => {
      describe('when the licence has a related purpose with a populated description field', () => {
        it('returns the purpose description', () => {
          const result = PurposesPresenter.go(licenceFixture.licence)

          expect(result.licencePurposes[0].purposeDescription).equal('Spray Irrigation - Storage')
        })
      })
    })
  })
})
