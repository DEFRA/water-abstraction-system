'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PointsPresenter = require('../../../app/presenters/return-requirements/points.presenter.js')

describe('Select Points presenter', () => {
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

    pointsData = [{
      NGR1_EAST: '69212',
      NGR2_EAST: 'null',
      NGR3_EAST: 'null',
      NGR4_EAST: 'null',
      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
      NGR1_NORTH: '50394',
      NGR1_SHEET: 'TQ',
      NGR2_NORTH: 'null',
      NGR2_SHEET: 'null',
      NGR3_NORTH: 'null',
      NGR3_SHEET: 'null',
      NGR4_NORTH: 'null',
      NGR4_SHEET: 'null'
    },
    {
      NGR1_EAST: '69212',
      NGR2_EAST: 'null',
      NGR3_EAST: 'null',
      NGR4_EAST: 'null',
      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
      NGR1_NORTH: '50394',
      NGR1_SHEET: 'TQ',
      NGR2_NORTH: 'null',
      NGR2_SHEET: 'null',
      NGR3_NORTH: 'null',
      NGR3_SHEET: 'null',
      NGR4_NORTH: 'null',
      NGR4_SHEET: 'null'
    },
    {
      NGR1_EAST: '68083',
      NGR2_EAST: 'null',
      NGR3_EAST: 'null',
      NGR4_EAST: 'null',
      LOCAL_NAME: 'BEWL WATER RESERVOIR',
      NGR1_NORTH: '33604',
      NGR1_SHEET: 'TQ',
      NGR2_NORTH: 'null',
      NGR2_SHEET: 'null',
      NGR3_NORTH: 'null',
      NGR3_SHEET: 'null',
      NGR4_NORTH: 'null',
      NGR4_SHEET: 'null'
    }
    ]
  })

  describe('when provided with a populated session', () => {
    describe('and no payload', () => {
      it('correctly presents the data', () => {
        const result = PointsPresenter.go(session, pointsData)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licencePoints: [
            'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
            'At National Grid Reference TQ 68083 33604 (BEWL WATER RESERVOIR)'
          ]
        })
      })
    })
  })

  describe('and with a payload', () => {
    const payload = {
      points: [
        'At National Grid Reference TQ 68083 33604 (BEWL WATER RESERVOIR)'
      ]
    }

    it('correctly presents the data', () => {
      const result = PointsPresenter.go(session, pointsData, payload)

      expect(result).to.equal({
        id: '61e07498-f309-4829-96a9-72084a54996d',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        licencePoints: [
          'At National Grid Reference TQ 68083 33604 (BEWL WATER RESERVOIR)'
        ]
      })
    })
  })
})
