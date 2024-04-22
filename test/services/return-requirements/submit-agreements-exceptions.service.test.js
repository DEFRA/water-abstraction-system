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
const SubmitAgreementsExceptionsService = require('../../../app/services/return-requirements/submit-agreements-exceptions.service.js')

describe.only('Submit Agreements and Exceptions service', () => {
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
          licenceHolder: 'Turbo Kid',
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
          agreementsExceptions: 'gravity-fill'
        }
      })
    })

    it('saves the submitted value', async () => {
      await SubmitAgreementsExceptionsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data.agreementsExceptions).to.equal({
        agreementsExceptions: [
          'gravity-fill'
        ]
      })
    })

    it('returns an empty object (no page data needed for a redirect)', async () => {
      const result = await SubmitAgreementsExceptionsService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('with an invalid payload', () => {
    describe('because the user has not inputted anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fetches the current setup session record', async () => {
        const result = await SubmitAgreementsExceptionsService.go(session.id, payload)

        expect(result.id).to.equal(session.id)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitAgreementsExceptionsService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          error: null,
          pageTitle: 'Select agreements and exceptions for the requirements for returns',
          id: 'aeb46f58-3431-42af-8724-361a7779becf',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          agreementsExceptions: ''
        }, { skip: ['id', 'error'] })
      })
    })

    it('returns page data with an error for the data input form element', async () => {
      const result = await SubmitAgreementsExceptionsService.go(session.id, payload)

      expect(result.error).to.equal({
        text: {
          message: 'Select agreements and exceptions for the requirements for returns'
        }
      })
    })
  })
})
