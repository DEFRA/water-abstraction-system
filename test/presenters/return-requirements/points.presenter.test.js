'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SelectPointsPresenter = require('../../../app/presenters/return-requirements/points.presenter.js')

describe.only('Select Points presenter', () => {
  let session
  let pointsData

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        }
      }
    }

    pointsData = {
      purposes: [{
        purposePoints: [{
          point_detail: {
            NGR1_SHEET: 'TL',
            NGR1_EAST: '23198',
            NGR1_NORTH: '88603'
          },
          point_source: {
            NAME: 'SURFACE WATER SOURCE OF SUPPLY'
          }
        },
        {
          point_detail: {
            NGR1_SHEET: 'TQ',
            NGR1_EAST: '72080',
            NGR1_NORTH: '75530'
          },
          point_source: {
            NAME: 'RIVER MEDWAY AT SPRINGFIELD'
          }
        }
        ]
      }]
    }
  })

  describe('when provided with a populated session', () => {
    describe('and no payload', () => {
      it('correctly presents the data', () => {
        const result = SelectPointsPresenter.go(session, pointsData)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licencePoints: [
            'At National Grid Reference TL 23198 88603',
            'At National Grid Reference TQ 72080 75530'
          ]
        })
      })
    })
  })
})
