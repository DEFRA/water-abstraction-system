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
        returnsRequired: 'new-licence'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          reason: 'new_licence'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitReasonService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.returnsRequired).to.equal('new-licence')
      })

      it('returns page data for the journey', async () => {
        const result = await SubmitReasonService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          checkYourAnswersVisited: false,
          pageTitle: 'Select the reason for the requirements for returns',
          licenceRef: '01/ABC',
          reason: null
        }, { skip: ['id', 'error'] })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitReasonService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitReasonService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            checkYourAnswersVisited: false,
            pageTitle: 'Select the reason for the requirements for returns',
            licenceRef: '01/ABC',
            reason: null
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error', async () => {
          const result = await SubmitReasonService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select the reason for the requirements for returns'
          })
        })
      })
    })
  })
})
