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
const SubmitPointsService = require('../../../app/services/return-requirements/submit-points.service.js')

describe('Return Requirements - Submit Points service', () => {
  const requirementIndex = 0

  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
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
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          points: ['1234']
        }

        Sinon.stub(FetchPointsService, 'go').resolves(_points())
      })

      it('saves the submitted value', async () => {
        await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].points).to.equal([
          '1234'
        ])
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
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
      const result = await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the points for the requirements for returns',
        backLink: `/system/return-requirements/${session.id}/purpose/0`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [{
          id: '1234',
          description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
        }],
        licenceRef: '01/ABC',
        points: ''
      }, { skip: ['sessionId', 'error'] })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for the input element', async () => {
        const result = await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

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
  ]
}
