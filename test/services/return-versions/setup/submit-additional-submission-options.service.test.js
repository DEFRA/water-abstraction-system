'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitAdditionalSubmissionOptionsService = require('../../../../app/services/return-versions/setup/submit-additional-submission-options.service.js')

describe('Return Versions Setup - Submit Additional Submission Options service', () => {
  let payload
  let session
  let yarStub

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

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'multiple-upload'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.additionalSubmissionOptions).to.include('multiple-upload')
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notification).to.equal({ title: 'Updated', text: 'Changes updated' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'search',
          backLink: `/system/return-versions/setup/${session.id}/check`,
          pageTitle: 'Select any additional submission options for the return requirements',
          licenceRef: '01/ABC',
          additionalSubmissionOptions: [undefined]
        }, { skip: ['id', 'sessionId', 'error', 'licenceId'] })
      })

      describe('because the user has not checked anything', () => {
        it('includes an error for the checkbox element', async () => {
          const result = await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            text: 'Select additional submission options for the requirements for returns'
          })
        })
      })
    })
  })
})
