'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const PointModel = require('../../../../app/models/point.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../../app/services/return-requirements/setup/fetch-points.service.js')

// Thing under test
const SelectPointsService = require('../../../../app/services/return-requirements/setup/points.service.js')

describe('Return Requirements Setup - Points service', () => {
  const requirementIndex = 0

  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        checkPageVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          returnVersions: [{
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })

    const point = PointModel.fromJson({
      description: 'RIVER MEDWAY AT YALDING INTAKE',
      id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
      ngr1: 'TQ 69212 50394',
      ngr2: null,
      ngr3: null,
      ngr4: null
    })

    Sinon.stub(FetchPointsService, 'go').resolves([point])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SelectPointsService.go(session.id, requirementIndex)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SelectPointsService.go(session.id, requirementIndex)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the points for the requirements for returns',
        backLink: `/system/return-requirements/setup/${session.id}/purpose/0`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          {
            id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
            description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
          }
        ],
        licenceRef: '01/ABC',
        selectedPointIds: ''
      }, { skip: ['sessionId'] })
    })
  })
})
