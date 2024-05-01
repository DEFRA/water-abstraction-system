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
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Astro Boy',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required'
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

      it('returns redirect route for Returns required journey', async () => {
        const result = await SubmitSetupService.go(session.id, payload)

        expect(result).to.equal({ redirect: 'check-your-answers' })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitSetupService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitSetupService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            licenceRef: '01/ABC',
            pageTitle: 'How do you want to set up the requirements for returns?',
            setup: null
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error', async () => {
          const result = await SubmitSetupService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select how you want to set up the return requirement'
          })
        })
      })
    })
  })

  describe('with different setups', () => {
    describe('and setup is use-abstraction-data', () => {
      beforeEach(() => {
        payload = {
          setup: 'use-abstraction-data'
        }
      })

      it('redirects to the check your answers page', async () => {
        const result = await SubmitSetupService.go(session.id, payload)
        expect(result.redirect).to.equal('check-your-answers')
      })
    })

    describe('and setup is set-up-manually', () => {
      beforeEach(() => {
        payload = {
          setup: 'set-up-manually'
        }
      })

      it('redirects to the purpose page', async () => {
        const result = await SubmitSetupService.go(session.id, payload)
        expect(result.redirect).to.equal('purpose')
      })
    })
  })
})
