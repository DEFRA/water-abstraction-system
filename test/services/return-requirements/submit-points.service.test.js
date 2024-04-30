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
const PointsValidator = require('../../../app/validators/return-requirements/points.validator.js')

// Thing under test
const SubmitPointsService = require('../../../app/services/return-requirements/submit-points.service.js')

describe('Submit Points service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required'
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

        Sinon.stub(FetchPointsService, 'go').resolves(_testFetchPointsService())

        Sinon.stub(PointsValidator, 'go').resolves(null)
      })

      it('saves the submitted value', async () => {
        await SubmitPointsService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.points).to.equal([
          'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
        ])
      })

      it('returns an empty object (no page data needed for a redirect)', async () => {
        const result = await SubmitPointsService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })
  })

  describe('with a invalid payload', () => {
    describe('because the user has not selected anything', () => {
      beforeEach(() => {
        payload = {}

        Sinon.stub(FetchPointsService, 'go').resolves(_testFetchPointsService())
      })

      it('fetches the current setup session record', async () => {
        const result = await SubmitPointsService.go(session.id, payload)

        expect(result.id).to.equal(session.id)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitPointsService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the points for the requirements for returns',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licencePoints: [
            'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
            'At National Grid Reference TQ 68083 33604 (BEWL WATER RESERVOIR)'
          ],
          selectedPoints: ''
        }, { skip: ['id', 'error'] })
      })

      it('returns page data with an error', async () => {
        const result = await SubmitPointsService.go(session.id, payload)

        expect(result.error).to.equal({
          text: 'Select any points for the return requirement'
        })
      })
    })
  })
})

function _testFetchPointsService () {
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
}
