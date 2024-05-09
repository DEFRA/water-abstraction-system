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
const SubmitNoReturnsRequiredService = require('../../../app/services/return-requirements/submit-no-returns-required.service.js')

describe('Submit No Returns Required service', () => {
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
        journey: 'no-returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = {
          reason: 'abstraction-below-100-cubic-metres-per-day'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitNoReturnsRequiredService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reason).to.equal('abstraction-below-100-cubic-metres-per-day')
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

        expect(result).to.equal({ checkYourAnswersVisited: false, journey: 'no-returns-required' })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Why are no returns required?',
          backLink: `/system/return-requirements/${session.id}/start-date`,
          licenceRef: '01/ABC',
          reason: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select the reason for no returns required'
          })
        })
      })
    })
  })
})
