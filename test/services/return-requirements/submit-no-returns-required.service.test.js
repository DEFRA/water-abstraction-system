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
const sessionData = {
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
    selectedOption: null

  }
}

describe('Submit No Returns Required service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ ...sessionData })
        payload = {
          reason: 'abstraction-below-100-cubic-metres-per-day'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitNoReturnsRequiredService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.reason).to.equal('abstraction-below-100-cubic-metres-per-day')
      })

      it('returns the journey to redirect the page', async () => {
        const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

        expect(result).to.equal({
          checkYourAnswersVisited: false,
          journey: 'no-returns-required'

        }, { skip: ['id'] })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ ...sessionData })
          payload = { journey: 'no-returns-required' }
        })

        it('returns page data for the view', async () => {
          const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            checkYourAnswersVisited: false,
            pageTitle: 'Why are no returns required?',
            licenceRef: '01/ABC',
            selectedOption: null
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error', async () => {
          const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select the reason for the requirements for returns'
          })
        })
      })
    })
    describe('when the user has visited check-your-answers', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          ...sessionData,
          data: {
            ...sessionData.data,
            checkYourAnswersVisited: true
          }
        })
        payload = {
          reason: 'abstraction-below-100-cubic-metres-per-day'
        }
      })

      it('redirects the user back to check-your-answers', async () => {
        const result = await SubmitNoReturnsRequiredService.go(session.id, payload)

        expect(result).to.equal({
          checkYourAnswersVisited: true,
          journey: 'no-returns-required'

        }, { skip: ['id'] })
      })
    })
  })
})
