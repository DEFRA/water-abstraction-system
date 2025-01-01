'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const PointModel = require('../../../../../app/models/point.model.js')

// Thing under test
const ReturnRequirementsPresenter = require('../../../../../app/presenters/return-versions/setup/check/returns-requirements.presenter.js')

describe('Return Versions Setup - Return Requirements presenter', () => {
  let journey
  let point
  let requirement

  describe('when provided requirements, points and a journey', () => {
    beforeEach(() => {
      journey = 'returns-required'
      requirement = _requirement()
      point = _point()
    })

    describe('and the requirements are "complete"', () => {
      beforeEach(() => {
        requirement = _requirement()
      })

      it('correctly presents the data', () => {
        const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

        expect(result).to.equal({
          returnsRequired: true,
          requirements: [
            {
              abstractionPeriod: 'From 1 June to 1 March',
              agreementsExceptions: 'Gravity fill',
              frequencyCollected: 'daily',
              frequencyReported: 'daily',
              index: 0,
              points: ['At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'],
              purposes: ['Spray irrigation'],
              returnsCycle: 'Summer',
              siteDescription: 'A place in the sun'
            }
          ]
        })
      })

      describe('the requirements "abstractionPeriod" property', () => {
        it('formats the abstraction period for display', () => {
          const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

          const { abstractionPeriod } = result.requirements[0]

          expect(abstractionPeriod).to.equal('From 1 June to 1 March')
        })
      })

      describe('the requirements "agreementsExceptions" property', () => {
        describe('when "none" was the selected option', () => {
          beforeEach(() => {
            requirement.agreementsExceptions = ['none']
          })

          it('returns "None"', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { agreementsExceptions } = result.requirements[0]

            expect(agreementsExceptions).to.equal('None')
          })
        })

        describe('when one option was selected', () => {
          it("returns the option's display text (Gravity fill)", () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { agreementsExceptions } = result.requirements[0]

            expect(agreementsExceptions).to.equal('Gravity fill')
          })
        })

        describe('when two options were selected', () => {
          beforeEach(() => {
            requirement.agreementsExceptions = ['gravity-fill', 'transfer-re-abstraction-scheme']
          })

          it('returns the options display text joined with an "and" (Gravity fill and Transfer re-abstraction scheme)', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { agreementsExceptions } = result.requirements[0]

            expect(agreementsExceptions).to.equal('Gravity fill and Transfer re-abstraction scheme')
          })
        })

        describe('when more than two options were selected', () => {
          beforeEach(() => {
            requirement.agreementsExceptions = [
              'gravity-fill',
              'transfer-re-abstraction-scheme',
              'two-part-tariff',
              '56-returns-exception'
            ]
          })

          it('returns the options display text joined with an ", and" (Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception)', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { agreementsExceptions } = result.requirements[0]

            expect(agreementsExceptions).to.equal(
              'Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception'
            )
          })
        })
      })

      describe('the requirements "points" property', () => {
        // Formatting of the points is handled by PointModel.$describe() so testing is light here
        it('formats the points for display', () => {
          const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

          const { points } = result.requirements[0]

          expect(points).to.equal(['At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'])
        })
      })

      describe('the requirements "purposes" property', () => {
        describe('when a purpose description (alias) was added to the selected purpose', () => {
          beforeEach(() => {
            requirement.purposes[0].alias = 'spray indiscreetly'
          })

          it('formats the purposes for display with the purpose description in brackets', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { purposes } = result.requirements[0]

            expect(purposes).to.equal(['Spray irrigation (spray indiscreetly)'])
          })
        })

        describe('when a purpose description (alias) was not added to the selected purpose', () => {
          it('formats the purposes for display with just the default description', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { purposes } = result.requirements[0]

            expect(purposes).to.equal(['Spray irrigation'])
          })
        })
      })

      describe('the requirements "returnsCycle" property', () => {
        describe('when the requirement is for the "summer" returns cycle', () => {
          it('formats the cycle for display (Summer)', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { returnsCycle } = result.requirements[0]

            expect(returnsCycle).to.equal('Summer')
          })
        })

        describe('when the requirement is for the "winter-and-all-year" returns cycle', () => {
          beforeEach(() => {
            requirement.returnsCycle = 'winter-and-all-year'
          })

          it('formats the cycle for display (Winter and all year)', () => {
            const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

            const { returnsCycle } = result.requirements[0]

            expect(returnsCycle).to.equal('Winter and all year')
          })
        })
      })
    })

    describe('and none of the requirements are "complete"', () => {
      beforeEach(() => {
        requirement = _requirement()
        delete requirement.agreementsExceptions
      })

      it('correctly presents the data (empty requirements)', () => {
        const result = ReturnRequirementsPresenter.go([requirement], [point], journey)

        expect(result).to.equal({
          returnsRequired: true,
          requirements: []
        })
      })
    })
  })
})

function _point() {
  return PointModel.fromJson({
    description: 'RIVER MEDWAY AT YALDING INTAKE',
    id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
    ngr1: 'TQ 69212 50394',
    ngr2: null,
    ngr3: null,
    ngr4: null
  })
}

function _requirement() {
  return {
    abstractionPeriod: {
      'end-abstraction-period-day': '01',
      'end-abstraction-period-month': '03',
      'start-abstraction-period-day': '01',
      'start-abstraction-period-month': '06'
    },
    agreementsExceptions: ['gravity-fill'],
    frequencyCollected: 'day',
    frequencyReported: 'day',
    points: ['d03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6'],
    purposes: [
      {
        id: '772136d1-9184-417b-90cd-91053287d1df',
        alias: '',
        description: 'Spray irrigation'
      }
    ],
    returnsCycle: 'summer',
    siteDescription: 'A place in the sun'
  }
}
