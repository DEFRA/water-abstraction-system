'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitPeriodUsedService = require('../../../../app/services/return-logs/setup/submit-period-used.service.js')

describe('Return Logs Setup - Submit Period Used service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345',
        startDate: '2023-04-01',
        endDate: '2024-03-31',
        periodStartDay: '01',
        periodStartMonth: '04',
        periodEndDay: '31',
        periodEndMonth: '03'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('because the user entered the default abstraction period', () => {
        beforeEach(async () => {
          payload = { periodDateUsedOptions: 'default' }
        })

        it('saves the submitted option', async () => {
          await SubmitPeriodUsedService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.periodDateUsedOptions).to.equal('default')
        })
      })

      describe('because the user entered a custom period', () => {
        beforeEach(async () => {
          payload = {
            periodDateUsedOptions: 'custom-date',
            'period-used-from-day': '01',
            'period-used-from-month': '04',
            'period-used-from-year': '2023',
            'period-used-to-day': '31',
            'period-used-to-month': '03',
            'period-used-to-year': '2024'
          }
        })

        it('saves the submitted option', async () => {
          await SubmitPeriodUsedService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.periodDateUsedOptions).to.equal('custom-date')
          expect(refreshedSession.periodUsedFromDay).to.equal('01')
          expect(refreshedSession.periodUsedFromMonth).to.equal('04')
          expect(refreshedSession.periodUsedFromYear).to.equal('2023')
          expect(refreshedSession.periodUsedToDay).to.equal('31')
          expect(refreshedSession.periodUsedToMonth).to.equal('03')
          expect(refreshedSession.periodUsedToYear).to.equal('2024')
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitPeriodUsedService.go(session.id, payload)

        expect(result).to.equal(
          {
            abstractionPeriod: '1 April to 31 March',
            activeNavBar: 'search',
            backLink: `/system/return-logs/setup/${session.id}/single-volume`,
            pageTitle: 'What period was used for this volume?',
            returnReference: '12345',
            periodDateUsedOptions: null,
            periodUsedFromDay: null,
            periodUsedFromMonth: null,
            periodUsedFromYear: null,
            periodUsedToDay: null,
            periodUsedToMonth: null,
            periodUsedToYear: null
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitPeriodUsedService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#period-date-used-options',
                text: 'Select what period was used for this volume'
              }
            ],
            periodDateUsedOptions: { message: 'Select what period was used for this volume' }
          })
        })
      })
    })
  })
})
