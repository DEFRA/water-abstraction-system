'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitReasonService = require('../../../app/services/return-requirements/submit-reason.service.js')

describe('Submit Reason service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        checkYourAnswersVisited: false,
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
        startDateOptions: 'licenceStartDate'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          reason: 'new-licence'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitReasonService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reason).to.equal('new-licence')
      })

      it('returns the checkYourAnswersVisited property (no page data needed for a redirect)', async () => {
        const result = await SubmitReasonService.go(session.id, payload)

        expect(result).to.equal({
          checkYourAnswersVisited: false
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitReasonService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the reason for the requirements for returns',
          backLink: `/system/return-requirements/${session.id}/start-date`,
          licenceRef: '01/ABC',
          reason: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitReasonService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Select the reason for the requirements for returns' })
        })
      })
    })
  })
})
