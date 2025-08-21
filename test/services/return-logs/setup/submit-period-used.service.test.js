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
        periodEndMonth: '03',
        singleVolumeQuantity: '1200',
        lines: [
          { startDate: new Date('2023-04-01'), endDate: new Date('2023-04-30') },
          { startDate: new Date('2023-05-01'), endDate: new Date('2023-05-31') },
          { startDate: new Date('2023-06-01'), endDate: new Date('2023-06-30') },
          { startDate: new Date('2023-07-01'), endDate: new Date('2023-07-31') },
          { startDate: new Date('2023-08-01'), endDate: new Date('2023-08-31') },
          { startDate: new Date('2023-09-01'), endDate: new Date('2023-09-30') },
          { startDate: new Date('2023-10-01'), endDate: new Date('2023-10-31') },
          { startDate: new Date('2023-11-01'), endDate: new Date('2023-11-30') },
          { startDate: new Date('2023-12-01'), endDate: new Date('2023-12-31') },
          { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') },
          { startDate: new Date('2024-02-01'), endDate: new Date('2024-02-29') },
          { startDate: new Date('2024-03-01'), endDate: new Date('2024-03-31') }
        ]
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
          expect(refreshedSession.fromFullDate).to.equal('2023-04-01T00:00:00.000Z')
          expect(refreshedSession.toFullDate).to.equal('2024-03-31T00:00:00.000Z')
        })

        it('applies the single volume to the applicable lines', async () => {
          await SubmitPeriodUsedService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines[0].quantity).to.equal(100)
          expect(refreshedSession.lines[1].quantity).to.equal(100)
          expect(refreshedSession.lines[2].quantity).to.equal(100)
          expect(refreshedSession.lines[3].quantity).to.equal(100)
          expect(refreshedSession.lines[4].quantity).to.equal(100)
          expect(refreshedSession.lines[5].quantity).to.equal(100)
          expect(refreshedSession.lines[6].quantity).to.equal(100)
          expect(refreshedSession.lines[7].quantity).to.equal(100)
          expect(refreshedSession.lines[8].quantity).to.equal(100)
          expect(refreshedSession.lines[9].quantity).to.equal(100)
          expect(refreshedSession.lines[10].quantity).to.equal(100)
          expect(refreshedSession.lines[11].quantity).to.equal(100)
        })
      })

      describe('because the user entered a custom period', () => {
        beforeEach(async () => {
          payload = {
            periodDateUsedOptions: 'custom-dates',
            'period-used-from-day': '15',
            'period-used-from-month': '08',
            'period-used-from-year': '2023',
            'period-used-to-day': '20',
            'period-used-to-month': '01',
            'period-used-to-year': '2024'
          }
        })

        it('saves the submitted option', async () => {
          await SubmitPeriodUsedService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.periodDateUsedOptions).to.equal('custom-dates')
          expect(refreshedSession.periodUsedFromDay).to.equal('15')
          expect(refreshedSession.periodUsedFromMonth).to.equal('08')
          expect(refreshedSession.periodUsedFromYear).to.equal('2023')
          expect(refreshedSession.periodUsedToDay).to.equal('20')
          expect(refreshedSession.periodUsedToMonth).to.equal('01')
          expect(refreshedSession.periodUsedToYear).to.equal('2024')
          expect(refreshedSession.fromFullDate).to.equal('2023-08-15T00:00:00.000Z')
          expect(refreshedSession.toFullDate).to.equal('2024-01-20T00:00:00.000Z')
        })

        it('applies the single volume to the applicable lines', async () => {
          await SubmitPeriodUsedService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.lines[0].quantity).to.not.exist()
          expect(refreshedSession.lines[1].quantity).to.not.exist()
          expect(refreshedSession.lines[2].quantity).to.not.exist()
          expect(refreshedSession.lines[3].quantity).to.not.exist()
          expect(refreshedSession.lines[4].quantity).to.not.exist()
          expect(refreshedSession.lines[5].quantity).to.equal(300)
          expect(refreshedSession.lines[6].quantity).to.equal(300)
          expect(refreshedSession.lines[7].quantity).to.equal(300)
          expect(refreshedSession.lines[8].quantity).to.equal(300)
          expect(refreshedSession.lines[9].quantity).to.not.exist()
          expect(refreshedSession.lines[10].quantity).to.not.exist()
          expect(refreshedSession.lines[11].quantity).to.not.exist()
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
            caption: 'Return reference 12345',
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
