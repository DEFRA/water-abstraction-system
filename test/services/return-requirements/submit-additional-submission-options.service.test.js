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

// Thing under test
const SubmitAdditionalSubmissionOptionsService = require('../../../app/services/return-requirements/submit-additional-submission-options.service.js')

describe('Return Requirements - Submit Additional Submission Options service', () => {
  let payload
  let session
  let yarStub

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

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('that is a new submission option', () => {
        beforeEach(() => {
          payload = {
            'additional-submission-options': 'multiple-upload'
          }
        })

        it('saves the submitted value', async () => {
          await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.additionalSubmissionOptions).to.equal(['multiple-upload'])
        })

        it("sets the notification message to 'Updated'", async () => {
          await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes updated' })
        })
      })

      describe('that is an updated submission option', () => {
        beforeEach(async () => {
          await session.$query().patch({
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
              reason: 'major-change',
              additionalSubmissionOptions: ['multiple-upload']
            }
          })

          payload = {
            'additional-submission-options': 'none'
          }
        })

        it('saves the submitted value', async () => {
          await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.additionalSubmissionOptions).to.equal(['none'])
        })

        it('returns the journey to redirect the page', async () => {
          const result = await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

          expect(result).to.equal({})
        })

        it("sets the notification message to 'Updated'", async () => {
          await SubmitAdditionalSubmissionOptionsService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes updated' })
        })
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
          backLink: `/system/return-requirements/${session.id}/check`,
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
