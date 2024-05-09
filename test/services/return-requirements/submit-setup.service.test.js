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
const SubmitSetupService = require('../../../app/services/return-requirements/submit-setup.service.js')

describe('Submit Setup service', () => {
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
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          setup: 'use-abstraction-data'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitSetupService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.setup).to.equal('use-abstraction-data')
      })

      describe('and the user has selected to use abstraction data', () => {
        it('returns the route to check your answers page', async () => {
          const result = await SubmitSetupService.go(session.id, payload)

          expect(result.redirect).to.equal('check-your-answers')
        })
      })

      describe('and the user has selected to setup the requirement manually', () => {
        beforeEach(() => {
          payload = {
            setup: 'set-up-manually'
          }
        })

        it('returns the route for the select purpose page', async () => {
          const result = await SubmitSetupService.go(session.id, payload)

          expect(result.redirect).to.equal('purpose/0')
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitSetupService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'How do you want to set up the requirements for returns?',
          backLink: `/system/return-requirements/${session.id}/reason`,
          licenceRef: '01/ABC',
          setup: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitSetupService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select how you want to set up the requirements for returns'
          })
        })
      })
    })
  })
})
