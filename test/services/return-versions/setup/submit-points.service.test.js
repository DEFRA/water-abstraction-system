'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const PointModel = require('../../../../app/models/point.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../../app/services/return-versions/setup/fetch-points.service.js')

// Thing under test
const SubmitPointsService = require('../../../../app/services/return-versions/setup/submit-points.service.js')

describe('Return Versions Setup - Submit Points service', () => {
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
          returnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01T00:00:00.000Z',
              reason: null,
              modLogs: []
            }
          ],
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
          points: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6'
        }

        Sinon.stub(FetchPointsService, 'go').resolves(_points())
      })

      it('saves the submitted value', async () => {
        await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].points).to.equal(['d03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6'])
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

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitPointsService.go(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Requirements for returns updated' })
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

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          pageTitle: 'Select the points for the requirements for returns',
          backLink: `/system/return-versions/setup/${session.id}/purpose/0`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licencePoints: [
            {
              id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
              description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            }
          ],
          licenceRef: '01/ABC',
          selectedPointIds: ''
        },
        { skip: ['sessionId', 'error'] }
      )
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

function _points() {
  const point = PointModel.fromJson({
    description: 'RIVER MEDWAY AT YALDING INTAKE',
    id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
    ngr1: 'TQ 69212 50394',
    ngr2: null,
    ngr3: null,
    ngr4: null
  })

  return [point]
}
