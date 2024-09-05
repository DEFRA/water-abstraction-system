'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')

// Thing under test
const SelectPointsService = require('../../../app/services/return-requirements/points.service.js')

describe('Return Requirements - Select Points service', () => {
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

    Sinon.stub(FetchPointsService, 'go').resolves([
      {
        ID: '1234',
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
      }
    ])
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
        backLink: `/system/return-requirements/${session.id}/purpose/0`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          {
            id: '1234',
            description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
          }
        ],
        licenceRef: '01/ABC',
        points: ''
      }, { skip: ['sessionId'] })
    })
  })
})
