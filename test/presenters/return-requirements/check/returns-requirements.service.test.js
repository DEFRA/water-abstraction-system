'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReturnRequirementsPresenter = require('../../../../app/services/return-requirements/check/returns-requirements.presenter.js')

describe('Return Requirements presenter', () => {
  let requirement
  let requirements = []
  let purposeIds = []
  let journey

  beforeEach(() => {
    requirement = {
      points: [
        '286'
      ],
      purposes: [
        '772136d1-9184-417b-90cd-91053287d1df'
      ],
      returnsCycle: 'summer',
      siteDescription: 'A place in the sun',
      abstractionPeriod: {
        'end-abstraction-period-day': '01',
        'end-abstraction-period-month': '03',
        'start-abstraction-period-day': '01',
        'start-abstraction-period-month': '06'
      },
      frequencyReported: 'daily',
      frequencyCollected: 'daily',
      agreementsExceptions: [
        'gravity-fill'
      ]
    }
    journey = {}

    purposeIds = [{
      id: '772136d1-9184-417b-90cd-91053287d1df',
      description: 'A singular purpose'
    }]

    requirements = [{ ...requirement }]
  })

  describe('when provided requirements and purposes', () => {
    it('correctly presents the data', () => {
      const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

      expect(result).to.equal({
        noReturnsRequired: false,
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
    describe('when the requirement has agreements exceptions', () => {
      it('correctly returns and requirement with agreements exceptions', () => {
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
    describe('when the requirement does not have any agreements exceptions', () => {
      beforeEach(() => {
        delete requirements[0].agreementsExceptions
      })

      it('correctly does not return the requirement', () => {
        const result = ReturnRequirementsPresenter.go(requirements, purposeIds, journey)

        expect(result.requirements).to.equal([])
      })
    })
  })
})
