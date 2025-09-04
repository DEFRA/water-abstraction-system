'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitReportedService = require('../../../../app/services/return-logs/setup/submit-reported.service.js')

describe('Return Logs Setup - Submit Reported service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { reported: 'meter-readings' }
      })

      it('saves the submitted option', async () => {
        await SubmitReportedService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reported).to.equal('meter-readings')
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitReportedService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: undefined,
            reported: 'meter-readings'
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitReportedService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true,
            reported: 'meter-readings'
          })
        })

        it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
          await SubmitReportedService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', titleText: 'Updated', text: 'Reporting details changed' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitReportedService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            pageTitle: 'How was this return reported?',
            activeNavBar: 'search',
            reported: null,
            backLink: `/system/return-logs/setup/${session.id}/submission`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReportedService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({ text: 'Select how this return was reported' })
        })
      })
    })
  })
})
