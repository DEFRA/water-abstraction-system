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
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          points: [
            'At National Grid Reference TQ 1234 1234 (Test local name)'
          ],
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
        const result = ReturnRequirementsPresenter.go(requirements, purposes, points, journey)

        expect(result.requirements).to.equal([{
          abstractionPeriod: 'From 1 June to 1 March',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          points: [
            'At National Grid Reference TQ 1234 1234 (Test local name)'
          ],
          purposes: [
            'A singular purpose'
          ],
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
