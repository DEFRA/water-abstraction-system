'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const PointModel = require('../../../../app/models/point.model.js')

// Thing under test
const PointsPresenter = require('../../../../app/presenters/return-requirements/setup/points.presenter.js')

describe('Return Requirements Setup - Points presenter', () => {
  const requirementIndex = 0

  let points
  let session

  beforeEach(() => {
    points = _points()

    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
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
      const result = PointsPresenter.go(session, requirementIndex, points)

      expect(result).to.equal({
        backLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/purpose/0',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [{
          id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
          description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
        }, {
          id: '07820640-c95a-497b-87d6-9e0d3ef322db',
          description: 'Between National Grid References SO 524 692 and SO 531 689 (KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME)'
        }, {
          id: '1c925e6c-a788-4a56-9c1e-ebb46c83ef73',
          description: 'Within the area formed by the straight lines running between National Grid References NZ 892 055 NZ 895 054 NZ 893 053 and NZ 892 053 (AREA D)'
        }],
        licenceRef: '01/ABC',
        selectedPointIds: '',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "purpose" page', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/purpose/0')
      })
    })
  })

  describe('the "licencePoints" property', () => {
    describe('when the points data contains a single grid reference point', () => {
      beforeEach(() => {
        points = [_points()[0]]
      })

      it('returns a At "National Grid Reference ..." point', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.licencePoints).to.equal([{
          id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
          description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
        }])
      })
    })

    describe('when the points data contains a double grid reference point', () => {
      beforeEach(() => {
        points = [_points()[1]]
      })

      it('returns a "Between National Grid References ..." point', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.licencePoints).to.equal([{
          id: '07820640-c95a-497b-87d6-9e0d3ef322db',
          description: 'Between National Grid References SO 524 692 and SO 531 689 (KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME)'
        }])
      })
    })

    describe('when the points data contains a multiple grid reference', () => {
      beforeEach(() => {
        points = [_points()[2]]
      })

      it('returns a "Within the area formed by the straight lines running between National Grid References ..." point', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.licencePoints).to.equal([{
          id: '1c925e6c-a788-4a56-9c1e-ebb46c83ef73',
          description: 'Within the area formed by the straight lines running between National Grid References NZ 892 055 NZ 895 054 NZ 893 053 and NZ 892 053 (AREA D)'
        }])
      })
    })
  })

  describe('the "selectedPointIds" property', () => {
    describe('when the user has previously submitted points', () => {
      beforeEach(() => {
        session.requirements[0].points = [
          'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
          '1c925e6c-a788-4a56-9c1e-ebb46c83ef73'
        ]
      })

      it('returns a string containing the selected points concatenated', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.selectedPointIds).to.equal(
          'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6,1c925e6c-a788-4a56-9c1e-ebb46c83ef73'
        )
      })
    })

    describe('when the user has not previously submitted a point', () => {
      it('returns an empty string', () => {
        const result = PointsPresenter.go(session, requirementIndex, points)

        expect(result.selectedPointIds).to.equal('')
      })
    })
  })
})

function _points () {
  const points = []

  points.push(PointModel.fromJson({
    description: 'RIVER MEDWAY AT YALDING INTAKE',
    id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
    ngr1: 'TQ 69212 50394',
    ngr2: null,
    ngr3: null,
    ngr4: null
  }))

  points.push(PointModel.fromJson({
    description: 'KIRKENEL FARM ASHFORD CARBONEL - RIVER TEME',
    id: '07820640-c95a-497b-87d6-9e0d3ef322db',
    ngr1: 'SO 524 692',
    ngr2: 'SO 531 689',
    ngr3: null,
    ngr4: null
  }))

  points.push(PointModel.fromJson({
    description: 'AREA D',
    id: '1c925e6c-a788-4a56-9c1e-ebb46c83ef73',
    ngr1: 'NZ 892 055',
    ngr2: 'NZ 895 054',
    ngr3: 'NZ 893 053',
    ngr4: 'NZ 892 053'
  }))

  return points
}
