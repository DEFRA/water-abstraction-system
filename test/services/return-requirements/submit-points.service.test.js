'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')

// Thing under test
const SubmitPointsService = require('../../../app/services/return-requirements/submit-points.service.js')

describe('Return Requirements - Submit Points service', () => {
  const requirementIndex = 0

  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
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
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          points: [
            'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
          ]
        }

        Sinon.stub(FetchPointsService, 'go').resolves(_points())
      })

      it('saves the submitted value', async () => {
        await SubmitPointsService.go(session.id, requirementIndex, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].points).to.equal([
          'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
        ])
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitPointsService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          checkPageVisited: false
        })
      })
    })
  })

  describe('with a invalid payload', () => {
    beforeEach(() => {
      payload = {}

      Sinon.stub(FetchPointsService, 'go').resolves(_points())
    })

    it('returns page data for the view', async () => {
      const result = await SubmitPointsService.go(session.id, requirementIndex, payload)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the points for the requirements for returns',
        backLink: `/system/return-requirements/${session.id}/purpose/0`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
        ],
        licenceRef: '01/ABC',
        points: ''
      }, { skip: ['sessionId', 'error'] })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for the input element', async () => {
        const result = await SubmitPointsService.go(session.id, requirementIndex, payload)

        expect(result.error).to.equal({
          text: 'Select any points for the requirements for returns'
        })
      })
    })
  })
})

function _points () {
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
    }
  ]
}
