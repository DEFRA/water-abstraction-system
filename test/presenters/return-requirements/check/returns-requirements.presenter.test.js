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
  let purposeIds = []
  let requirement
  let requirements = []

  beforeEach(() => {
    journey = {}

    purposeIds = [{
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
        '286'
      ],
      purposes: [
        purposeIds[0].id
      ],
      returnsCycle: 'summer',
      siteDescription: 'A place in the sun'
    }

    requirements = [{ ...requirement }]
  })

  describe('when provided requirements and purposes', () => {
    it('correctly presents the data', () => {
      const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

      expect(result).to.equal({
        returnsRequired: false,
        requirements: [{
          abstractionPeriod: 'From 1 June to 1 March',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          purposes: [
            'A singular purpose'
          ],
          siteDescription: 'A place in the sun'
        }]
      })
    })
  })

  describe("the 'requirements' property", () => {
    describe('when the requirement is "complete" (agreements exceptions is populated)', () => {
      it('correctly returns the requirement', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

        expect(result.requirements).to.equal([{
          abstractionPeriod: 'From 1 June to 1 March',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          purposes: [
            'A singular purpose'
          ],
          siteDescription: 'A place in the sun'
        }
        ])
      })
    })

    describe('when the requirement is "incomplete" (agreements exceptions is not populated)', () => {
      beforeEach(() => {
        delete requirements[0].agreementsExceptions
      })

      it('does not return the requirement', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

        expect(result.requirements).to.equal([])
      })
    })
    describe('has purpose id\'s', () => {
      describe('populated', () => {
        it('should map the purpose descriptions', () => {
          const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

          expect(result.requirements[0].purposes).to.equal(['A singular purpose'])
        })
      })

      describe('not populated', () => {
        beforeEach(() => {
          requirements[0].purposes = []
        })

        it('should leave the purpose empty', () => {
          const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

          expect(result.requirements[0].purposes).to.equal([])
        })
      })
    })
  })
})
