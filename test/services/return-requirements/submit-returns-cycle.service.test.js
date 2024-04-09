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
const SubmitReturnsCycleService = require('../../../app/services/return-requirements/submit-returns-cycle.service.js')

describe('Submit Returns Cycle service', () => {
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
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      const payload = {
        returnsCycle: 'summer'
      }

      it('saves the submitted value', async () => {
        await SubmitReturnsCycleService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.returnsCycle).to.equal('summer')
      })

      it('returns an empty object (no page data needed for a redirect)', async () => {
        const result = await SubmitReturnsCycleService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected a returns cycle', () => {
        const payload = {}

        it('fetches the current setup session record', async () => {
          const result = await SubmitReturnsCycleService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitReturnsCycleService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            pageTitle: 'Select the returns cycle for the requirements for returns',
            returnsCycle: null
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the radio form element', async () => {
          const result = await SubmitReturnsCycleService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Select the returns cycle for the return requirement' })
        })
      })
    })
  })
})
