'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitReasonService = require('../../../../app/services/return-versions/setup/submit-reason.service.js')

describe('Return Versions Setup - Submit Reason service', () => {
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
        startDateOptions: 'licenceStartDate'
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
          reason: 'new-licence'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitReasonService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reason).to.equal('new-licence')
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitReasonService.go(session.id, payload, yarStub)

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
          const result = await SubmitReasonService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitReasonService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitReasonService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the reason for the requirements for returns',
          backLink: `/system/return-versions/setup/${session.id}/start-date`,
          licenceRef: '01/ABC',
          reason: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitReasonService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({ text: 'Select the reason for the requirements for returns' })
        })
      })
    })
  })
})
