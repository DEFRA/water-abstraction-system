'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
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
        journey: 'returns-required',
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid'
        },
        multipleUpload: false
      }
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with no additional options ', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'none'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.noAdditionalOptions).to.be.true()
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notification).to.equal({ title: 'Updated', text: 'Additional submission options updated' })
      })
    })

    describe('with multiple upload selected', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'multiple-upload'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.multipleUpload).to.be.true()
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notification).to.equal({ title: 'Updated', text: 'Additional submission options updated' })
      })
    })

    describe('with quarterly returns selected', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'quarterly-returns'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.quarterlyReturns).to.be.true()
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notification).to.equal({ title: 'Updated', text: 'Additional submission options updated' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            backLink: `/system/return-versions/setup/${session.id}/check`,
            pageTitle: 'Select any additional submission options for the return requirements',
            pageTitleCaption: 'Licence 01/ABC',
            licenceRef: '01/ABC',
            multipleUpload: false,
            noAdditionalOptions: undefined,
            quarterlyReturnSubmissions: false,
            quarterlyReturns: undefined
          },
          { skip: ['id', 'sessionId', 'error', 'licenceId'] }
        )
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
