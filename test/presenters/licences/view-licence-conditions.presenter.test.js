'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicencesFixture = require('../../fixtures/licences.fixture.js')
const PointModel = require('../../../app/models/point.model.js')

// Thing under test
const ViewLicenceConditionsPresenter = require('../../../app/presenters/licences/view-licence-conditions.presenter.js')

describe('View Licence Conditions presenter', () => {
  let data

  beforeEach(() => {
    data = LicencesFixture.licenceConditions()
  })

  describe('when provided with a populated licence with licence conditions', () => {
    it('returns the expected licence conditions', () => {
      const result = ViewLicenceConditionsPresenter.go(data)

      expect(result).to.equal({
        conditionTypes: [
          {
            conditions: [
              {
                abstractionPoints: {
                  descriptions: [
                    'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)'
                  ],
                  label: 'Abstraction point'
                },
                conditionType: 'Cessation Condition',
                otherInformation: 'DROUGHT CONDITION',
                param1: {
                  label: 'Start date',
                  value: '01/05'
                },
                param2: {
                  label: 'End date',
                  value: '30/09'
                },
                purpose: 'Animal Watering & General Use In Non Farming Situations',
                subcodeDescription: 'Political - Hosepipe Ban'
              }
            ],
            displayTitle: 'Political cessation condition'
          }
        ],
        licenceId: '761bc44f-80d5-49ae-ab46-0a90495417b5',
        licenceRef: '01/123',
        pageTitle: 'Licence abstraction conditions'
      })
    })
  })

  describe('the "conditionTypes" property', () => {
    describe('the "conditions" property', () => {
      describe('the "abstractionPoints" property', () => {
        describe('the "descriptions" property', () => {
          it('returns an array of the abstraction point descriptions', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].abstractionPoints.descriptions).to.equal([
              'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)'
            ])
          })
        })

        describe('the "label" property', () => {
          describe('when the licence has one abstraction points descriptions', () => {
            it('returns the string "Abstraction point"', () => {
              const result = ViewLicenceConditionsPresenter.go(data)

              expect(result.conditionTypes[0].conditions[0].abstractionPoints.label).to.equal('Abstraction point')
            })
          })

          describe('when the licence has multiple abstraction points descriptions', () => {
            beforeEach(() => {
              data.conditions[0].licenceVersionPurposeConditions[0].licenceVersionPurpose.licenceVersionPurposePoints.push(
                {
                  id: '0316061a-bf21-45f5-9d6b-3488c1d15ba4',
                  point: PointModel.fromJson({
                    bgsReference: 'TL 99/023',
                    category: 'Reach',
                    depth: 989,
                    description: 'RIVER BY THE SEA',
                    hydroInterceptDistance: 99.01,
                    hydroReference: 'TL 34534/133',
                    hydroOffsetDistance: 88.56,
                    id: '3c316dcf-c16c-4532-805d-2be32c694571',
                    locationNote: 'Castle BY THE SEA, Brighton',
                    ngr1: 'SD 123 345',
                    ngr2: 'SD 345 345',
                    ngr3: 'SD 567 776',
                    ngr4: 'SD 123 667',
                    note: 'WELL IS RIVER-FED',
                    primaryType: 'Groundwater',
                    secondaryType: 'Borehole',
                    wellReference: '123123',
                    sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
                    sourceType: 'Borehole'
                  })
                }
              )
            })

            it('returns the string "Abstraction points"', () => {
              const result = ViewLicenceConditionsPresenter.go(data)

              expect(result.conditionTypes[0].conditions[0].abstractionPoints.label).to.equal('Abstraction points')
            })
          })
        })
      })

      describe('the "conditionType" property', () => {
        it('returns the licence version purpose condition type description value', () => {
          const result = ViewLicenceConditionsPresenter.go(data)

          expect(result.conditionTypes[0].conditions[0].conditionType).to.equal('Cessation Condition')
        })
      })

      describe('the "otherInformation" property', () => {
        it('returns the licence version purpose condition note value', () => {
          const result = ViewLicenceConditionsPresenter.go(data)

          expect(result.conditionTypes[0].conditions[0].otherInformation).to.equal('DROUGHT CONDITION')
        })
      })

      describe('the "param1" property', () => {
        describe('when the licence has null values for the param1 and param1Label values', () => {
          beforeEach(() => {
            data.conditions[0].param1Label = null
            data.conditions[0].licenceVersionPurposeConditions[0].param1 = null
          })

          it('returns "param1" property as null', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].param1).to.be.null()
          })
        })

        describe('when the licence has a null param1Label value but a populated param1 value', () => {
          beforeEach(() => {
            data.conditions[0].param1Label = null
          })

          it('returns the label as "Note 1" and value as the param1 value', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].param1.label).to.equal('Note 1')
            expect(result.conditionTypes[0].conditions[0].param1.value).to.equal('01/05')
          })
        })

        describe('when the licence has both the param1Label and param1 values populated', () => {
          it('returns the param1Label value as the label and param1 as the value', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].param1.label).to.equal('Start date')
            expect(result.conditionTypes[0].conditions[0].param1.value).to.equal('01/05')
          })
        })
      })

      describe('the "param2" property', () => {
        describe('when the licence has null values for the param2 and param2Label values', () => {
          beforeEach(() => {
            data.conditions[0].param2Label = null
            data.conditions[0].licenceVersionPurposeConditions[0].param2 = null
          })

          it('returns "param2" property as null', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].param2).to.be.null()
          })
        })

        describe('when the licence has a null param2Label value but a populated param2 value', () => {
          beforeEach(() => {
            data.conditions[0].param2Label = null
          })

          it('returns the label as "Note 2" and value as the param2 value', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].param2.label).to.equal('Note 2')
            expect(result.conditionTypes[0].conditions[0].param2.value).to.equal('30/09')
          })
        })

        describe('when the licence has both the param2Label and param2 values populated', () => {
          it('returns the param2Label value as the label and param2 as the value', () => {
            const result = ViewLicenceConditionsPresenter.go(data)

            expect(result.conditionTypes[0].conditions[0].param2.label).to.equal('End date')
            expect(result.conditionTypes[0].conditions[0].param2.value).to.equal('30/09')
          })
        })
      })

      describe('the "purpose" property', () => {
        it('returns the licences purpose description value', () => {
          const result = ViewLicenceConditionsPresenter.go(data)

          expect(result.conditionTypes[0].conditions[0].purpose).to.equal(
            'Animal Watering & General Use In Non Farming Situations'
          )
        })
      })

      describe('the "subcodeDescription" property', () => {
        it('returns the licences subcode description value', () => {
          const result = ViewLicenceConditionsPresenter.go(data)

          expect(result.conditionTypes[0].conditions[0].subcodeDescription).to.equal('Political - Hosepipe Ban')
        })
      })
    })

    describe('the "displayTitle" property', () => {
      it('returns the licenceVersionPurposeConditionType "displayTitle" value', () => {
        const result = ViewLicenceConditionsPresenter.go(data)

        expect(result.conditionTypes[0].displayTitle).to.equal('Political cessation condition')
      })
    })
  })
})
