'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReturnRequirementsPresenter = require('../../../../app/presenters/return-requirements/check/returns-requirements.presenter.js')

describe('Return Requirements presenter', () => {
  let journey
  let points = []
  let purposes = []
  let requirement
  let requirements = []

  beforeEach(() => {
    journey = {}

    purposes = [{
      id: '772136d1-9184-417b-90cd-91053287d1df',
      description: 'A singular purpose'
    }]

    requirement = {
      abstractionPeriod: {
        'end-abstraction-period-day': '01',
        'end-abstraction-period-month': '03',
        'start-abstraction-period-day': '01',
        'start-abstraction-period-month': '06'
      },
      agreementsExceptions: [
        'gravity-fill'
      ],
      frequencyCollected: 'daily',
      frequencyReported: 'daily',
      points: [
        '9000031'
      ],
      purposes: [
        purposes[0].id
      ],
      returnsCycle: 'summer',
      siteDescription: 'A place in the sun'
    }

    points = [
      {
        ID: '9000031',
        AADD_ID: '9000020',
        NGR1_EAST: '1234',
        LOCAL_NAME: 'Test local name',
        NGR1_NORTH: '1234',
        NGR1_SHEET: 'TQ',
        FGAC_REGION_CODE: '9'
      }
    ]

    requirements = [{ ...requirement }]
  })

  describe('when provided requirements and purposes', () => {
    it('correctly presents the data', () => {
      const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

      expect(result).to.equal({
        returnsRequired: false,
        requirements: [{
          abstractionPeriod: 'From 1 June to 1 March',
          agreementsExceptions: 'Gravity fill',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          points: [
            'At National Grid Reference TQ 1234 1234 (Test local name)'
          ],
          purposes: [
            'A singular purpose'
          ],
          returnsCycle: 'Summer',
          siteDescription: 'A place in the sun'
        }]
      })
    })
  })

  describe("the 'requirements' property", () => {
    describe('when the requirement is "complete" (agreements exceptions is populated)', () => {
      it('correctly returns the requirement', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

        expect(result.requirements).to.equal([{
          abstractionPeriod: 'From 1 June to 1 March',
          agreementsExceptions: 'Gravity fill',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          points: [
            'At National Grid Reference TQ 1234 1234 (Test local name)'
          ],
          purposes: [
            'A singular purpose'
          ],
          returnsCycle: 'Summer',
          siteDescription: 'A place in the sun'
        }
        ])
      })

      it('maps the selected purpose ID\'s to their description', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

        expect(result.requirements[0].purposes).to.equal(['A singular purpose'])
      })

      it('maps the selected points to the abstraction point details format', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

        expect(result.requirements[0].points).to.equal(['At National Grid Reference TQ 1234 1234 (Test local name)'])
      })

      describe('and the return cycle is', () => {
        describe('Summer', () => {
          it('should return the text for a summer return cycle', () => {
            const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

            expect(result.requirements[0].returnsCycle).to.equal('Summer')
          })
        })

        describe('Winter and all year', () => {
          beforeEach(() => {
            requirements = [{ ...requirement, returnsCycle: 'winter-and-all-year' }]
          })

          it('should return the text for a Winter and all year return cycle', () => {
            const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

            expect(result.requirements[0].returnsCycle).to.equal('Winter and all year')
          })
        })
      })

      describe('and the agreement exceptions', () => {
        describe('is "none"', () => {
          beforeEach(() => {
            requirements = [{ ...requirement, agreementsExceptions: ['none'] }]
          })

          it('should return "None"', () => {
            const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

            expect(result.requirements[0].agreementsExceptions).to.equal('None')
          })
        })

        describe('has one exception', () => {
          it('should return the exception in the string equivalent', () => {
            const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill')
          })
        })

        describe('has two exceptions', () => {
          beforeEach(() => {
            requirements = [{ ...requirement, agreementsExceptions: ['gravity-fill', 'transfer-re-abstraction-scheme'] }]
          })
          it('should return the exceptions in the string equivalent seperated with an and \'exception1 and exception2\' ', () => {
            const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill and Transfer re-abstraction scheme')
          })
        })

        describe('has more than two exceptions', () => {
          beforeEach(() => {
            requirements = [{ ...requirement, agreementsExceptions: ['gravity-fill', 'transfer-re-abstraction-scheme', 'two-part-tariff', '56-returns-exception'] }]
          })
          it('should return the exceptions formatted in the string equivalent, in the serial comma style e.g \'exception1, exception2, and exception3\' ', () => {
            const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

            expect(result.requirements[0].agreementsExceptions).to.equal('Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception')
          })
        })
      })
    })

    describe('when the requirement is "incomplete" (agreements exceptions is not populated)', () => {
      beforeEach(() => {
        delete requirements[0].agreementsExceptions
      })

      it('does not return the requirement', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposes, journey)

        expect(result.requirements).to.equal([])
      })
    })
  })
})
