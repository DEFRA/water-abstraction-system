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
const SubmitAbstractionPeriodService = require('../../../app/services/return-requirements/submit-abstraction-period.service.js')

describe('Submit Abstraction Period service', () => {
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
          'start-abstraction-period-day': '01',
          'start-abstraction-period-month': '12',
          'end-abstraction-period-day': '02',
          'end-abstraction-period-month': '7'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].abstractionPeriod).to.equal({
          'end-abstraction-period-day': '02',
          'start-abstraction-period-day': '01',
          'end-abstraction-period-month': '7',
          'start-abstraction-period-month': '12'
        })
      })

      it('returns the checkYourAnswersVisited property (no page data needed for a redirect)', async () => {
        const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

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
        const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Enter the abstraction period for the requirements for returns',
          abstractionPeriod: null,
          backLink: `/system/return-requirements/${session.id}/points/0`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC'
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for both input elements', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.error).to.equal({
            text: {
              startResult: 'Select the start date of the abstraction period',
              endResult: 'Select the end date of the abstraction period'
            }
          })
        })
      })

      describe('because the user has not submitted a start abstraction period', () => {
        beforeEach(() => {
          payload = {
            'start-abstraction-period-day': null,
            'start-abstraction-period-month': null,
            'end-abstraction-period-day': '02',
            'end-abstraction-period-month': '7'
          }
        })

        it('includes an error for the start date input element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.error).to.equal({
            text: {
              startResult: 'Select the start date of the abstraction period',
              endResult: null
            }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.abstractionPeriod).to.equal({
            'start-abstraction-period-day': null,
            'start-abstraction-period-month': null,
            'end-abstraction-period-day': '02',
            'end-abstraction-period-month': '7'
          })
        })
      })

      describe('because the user has not submitted an end abstraction period', () => {
        beforeEach(() => {
          payload = {
            'start-abstraction-period-day': '08',
            'start-abstraction-period-month': '12',
            'end-abstraction-period-day': null,
            'end-abstraction-period-month': null
          }
        })

        it('includes an error for the end date input element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.error).to.equal({
            text: {
              startResult: null,
              endResult: 'Select the end date of the abstraction period'
            }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.abstractionPeriod).to.equal({
            'start-abstraction-period-day': '08',
            'start-abstraction-period-month': '12',
            'end-abstraction-period-day': null,
            'end-abstraction-period-month': null
          })
        })
      })

      describe('because the user has submitted invalid values', () => {
        beforeEach(() => {
          payload = {
            'start-abstraction-period-day': 'abc',
            'start-abstraction-period-month': '123',
            'end-abstraction-period-day': 'abc',
            'end-abstraction-period-month': '123'
          }
        })

        it('includes an error for both input elements', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.error).to.equal({
            text: {
              startResult: 'Enter a real start date',
              endResult: 'Enter a real end date'
            }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, requirementIndex, payload)

          expect(result.abstractionPeriod).to.equal({
            'start-abstraction-period-day': 'abc',
            'start-abstraction-period-month': '123',
            'end-abstraction-period-day': 'abc',
            'end-abstraction-period-month': '123'
          })
        })
      })
    })
  })
})
