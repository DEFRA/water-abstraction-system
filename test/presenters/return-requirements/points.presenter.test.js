'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PointsPresenter = require('../../../app/presenters/return-requirements/points.presenter.js')

describe('Return Requirements - Points presenter', () => {
  const requirementIndex = 0

  let pointsData
  let session

  beforeEach(() => {
    pointsData = _pointsData()

    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkYourAnswersVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = PointsPresenter.go(session, requirementIndex, pointsData)

      expect(result).to.equal({
        backLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/purpose/0',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
          'Between National Grid References SO 524 692 and SO 531 689 (KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME)',
          'Within the area formed by the straight lines running between National Grid References NZ 892 055 NZ 895 054 NZ 893 053 and NZ 892 053 (AREA D)'
        ],
        licenceRef: '01/ABC',
        points: '',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe("the 'backLink' property", () => {
    describe("when the user has come from 'check your answers'", () => {
      beforeEach(() => {
        session.checkYourAnswersVisited = true
      })

      it("returns a link back to the 'check your answers' page", () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/check-your-answers')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it("returns a link back to the 'purpose' page", () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/purpose/0')
      })
    })
  })

  describe("the 'licencePoints' property", () => {
    describe('when the points data contains a single grid reference point', () => {
      beforeEach(() => {
        pointsData = [_pointsData()[0]]
      })

      it("returns a 'At National Grid Reference ...' point", () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.licencePoints).to.equal(['At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'])
      })
    })

    describe('when the points data contains a double grid reference point', () => {
      beforeEach(() => {
        pointsData = [_pointsData()[1]]
      })

      it("returns a 'Between National Grid References ...' point", () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.licencePoints).to.equal(['Between National Grid References SO 524 692 and SO 531 689 (KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME)'])
      })
    })

    describe('when the points data contains a multiple grid reference', () => {
      beforeEach(() => {
        pointsData = [_pointsData()[2]]
      })

      it("returns a 'Within the area formed by the straight lines running between National Grid References ...' point", () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.licencePoints).to.equal(['Within the area formed by the straight lines running between National Grid References NZ 892 055 NZ 895 054 NZ 893 053 and NZ 892 053 (AREA D)'])
      })
    })
  })

  describe("the 'points' property", () => {
    describe('when the user has previously submitted points', () => {
      beforeEach(() => {
        session.requirements[0].points = [
          'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
          'Between National Grid References SO 524 692 and SO 531 689 (KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME)'
        ]
      })

      it('returns a populated points', () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.points).to.equal('At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE),Between National Grid References SO 524 692 and SO 531 689 (KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME)')
      })
    })

    describe('when the user has not previously submitted a point', () => {
      it('returns an empty points', () => {
        const result = PointsPresenter.go(session, requirementIndex, pointsData)

        expect(result.points).to.equal('')
      })
    })
  })
})

function _pointsData () {
  return [
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
      NGR1_EAST: '524',
      NGR2_EAST: '531',
      NGR3_EAST: 'null',
      NGR4_EAST: 'null',
      LOCAL_NAME: 'KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME',
      NGR1_NORTH: '692',
      NGR1_SHEET: 'SO',
      NGR2_NORTH: '689',
      NGR2_SHEET: 'SO',
      NGR3_NORTH: 'null',
      NGR3_SHEET: 'null',
      NGR4_NORTH: 'null',
      NGR4_SHEET: 'null'
    },
    {
      NGR1_EAST: '892',
      NGR2_EAST: '895',
      NGR3_EAST: '893',
      NGR4_EAST: '892',
      LOCAL_NAME: 'AREA D',
      NGR1_NORTH: '055',
      NGR1_SHEET: 'NZ',
      NGR2_NORTH: '054',
      NGR2_SHEET: 'NZ',
      NGR3_NORTH: '053',
      NGR3_SHEET: 'NZ',
      NGR4_NORTH: '053',
      NGR4_SHEET: 'NZ'
    }
  ]
}
