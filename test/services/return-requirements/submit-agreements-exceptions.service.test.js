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

describe('Submit Agreements and Exceptions service', () => {
  const requirementIndex = 0

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
          agreementsExceptions: [
            'gravity-fill',
            'two-part-tariff',
            '56-returns-exception'
          ]
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAgreementsExceptionsService.go(session.id, requirementIndex, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].agreementsExceptions).to.equal([
          'gravity-fill',
          'two-part-tariff',
          '56-returns-exception'
        ])
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitAgreementsExceptionsService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          checkYourAnswersVisited: false
        })
      })
    })
  })

  describe('with an invalid payload', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view', async () => {
      const result = await SubmitAgreementsExceptionsService.go(session.id, requirementIndex, payload)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select agreements and exceptions for the requirements for returns',
        agreementsExceptions: null,
        backLink: `/system/return-requirements/${session.id}/frequency-reported/0`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC'
      }, { skip: ['sessionId', 'error'] })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for the input element', async () => {
        const result = await SubmitAgreementsExceptionsService.go(session.id, requirementIndex, payload)

        expect(result.error).to.equal({
          text: 'Select if there are any agreements and exceptions needed for the requirements for returns'
        })
      })
    })
  })
})
