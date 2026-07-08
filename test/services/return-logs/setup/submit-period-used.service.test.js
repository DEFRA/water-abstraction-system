'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitPeriodUsedService = require('../../../../app/services/return-logs/setup/submit-period-used.service.js')

describe('Return Logs Setup - Submit Period Used service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      startDate: '2023-04-01',
      endDate: '2024-03-31',
      periodStartDay: '01',
      periodStartMonth: '04',
      periodEndDay: '31',
      periodEndMonth: '03',
      singleVolumeQuantity: '1200',
      units: 'cubicMetres',
      unitSymbol: 'm³',
      lines: [
        // The session object will have the dates set as strings, so we need to convert the type here
        { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
        { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() },
        { startDate: new Date('2023-06-01').toISOString(), endDate: new Date('2023-06-30').toISOString() },
        { startDate: new Date('2023-07-01').toISOString(), endDate: new Date('2023-07-31').toISOString() },
        { startDate: new Date('2023-08-01').toISOString(), endDate: new Date('2023-08-31').toISOString() },
        { startDate: new Date('2023-09-01').toISOString(), endDate: new Date('2023-09-30').toISOString() },
        { startDate: new Date('2023-10-01').toISOString(), endDate: new Date('2023-10-31').toISOString() },
        { startDate: new Date('2023-11-01').toISOString(), endDate: new Date('2023-11-30').toISOString() },
        { startDate: new Date('2023-12-01').toISOString(), endDate: new Date('2023-12-31').toISOString() },
        { startDate: new Date('2024-01-01').toISOString(), endDate: new Date('2024-01-31').toISOString() },
        { startDate: new Date('2024-02-01').toISOString(), endDate: new Date('2024-02-29').toISOString() },
        { startDate: new Date('2024-03-01').toISOString(), endDate: new Date('2024-03-31').toISOString() }
      ]
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('because the user entered the default abstraction period', () => {
        beforeEach(() => {
          payload = { periodDateUsedOptions: 'default' }
        })

        it('saves the submitted option', async () => {
          await SubmitPeriodUsedService(session.id, payload)

          expect(session.periodDateUsedOptions).toEqual('default')
          expect(session.fromFullDate).toEqual('2023-04-01T00:00:00.000Z')
          expect(session.toFullDate).toEqual('2024-03-31T00:00:00.000Z')
          expect(session.$update.called).toBe(true)
        })

        it('applies the single volume to the applicable lines', async () => {
          await SubmitPeriodUsedService(session.id, payload)

          expect(session.lines[0].quantity).toEqual(100)
          expect(session.lines[1].quantity).toEqual(100)
          expect(session.lines[2].quantity).toEqual(100)
          expect(session.lines[3].quantity).toEqual(100)
          expect(session.lines[4].quantity).toEqual(100)
          expect(session.lines[5].quantity).toEqual(100)
          expect(session.lines[6].quantity).toEqual(100)
          expect(session.lines[7].quantity).toEqual(100)
          expect(session.lines[8].quantity).toEqual(100)
          expect(session.lines[9].quantity).toEqual(100)
          expect(session.lines[10].quantity).toEqual(100)
          expect(session.lines[11].quantity).toEqual(100)
        })
      })

      describe('because the user entered a custom period', () => {
        beforeEach(() => {
          payload = {
            periodDateUsedOptions: 'customDates',
            periodUsedFromDay: '15',
            periodUsedFromMonth: '08',
            periodUsedFromYear: '2023',
            periodUsedToDay: '20',
            periodUsedToMonth: '01',
            periodUsedToYear: '2024'
          }
        })

        it('saves the submitted option', async () => {
          await SubmitPeriodUsedService(session.id, payload)

          expect(session.periodDateUsedOptions).toEqual('customDates')
          expect(session.periodUsedFromDay).toEqual('15')
          expect(session.periodUsedFromMonth).toEqual('08')
          expect(session.periodUsedFromYear).toEqual('2023')
          expect(session.periodUsedToDay).toEqual('20')
          expect(session.periodUsedToMonth).toEqual('01')
          expect(session.periodUsedToYear).toEqual('2024')
          expect(session.fromFullDate).toEqual('2023-08-15T00:00:00.000Z')
          expect(session.toFullDate).toEqual('2024-01-20T00:00:00.000Z')
          expect(session.$update.called).toBe(true)
        })

        it('applies the single volume to the applicable lines', async () => {
          await SubmitPeriodUsedService(session.id, payload)

          expect(session.lines[0].quantity).toBeUndefined()
          expect(session.lines[1].quantity).toBeUndefined()
          expect(session.lines[2].quantity).toBeUndefined()
          expect(session.lines[3].quantity).toBeUndefined()
          expect(session.lines[4].quantity).toBeUndefined()
          expect(session.lines[5].quantity).toEqual(300)
          expect(session.lines[6].quantity).toEqual(300)
          expect(session.lines[7].quantity).toEqual(300)
          expect(session.lines[8].quantity).toEqual(300)
          expect(session.lines[9].quantity).toBeUndefined()
          expect(session.lines[10].quantity).toBeUndefined()
          expect(session.lines[11].quantity).toBeUndefined()
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitPeriodUsedService(session.id, payload)

        expect(result).toMatchObject({
          abstractionPeriod: '1 April to 31 March',
          backLink: { href: `/system/return-logs/setup/${session.id}/single-volume`, text: 'Back' },
          pageTitle: 'What period was used for this volume?',
          pageTitleCaption: 'Return reference 12345',
          periodDateUsedOptions: null,
          periodUsedFromDay: null,
          periodUsedFromMonth: null,
          periodUsedFromYear: null,
          periodUsedToDay: null,
          periodUsedToMonth: null,
          periodUsedToYear: null,
          showDefaultAbstractionPeriod: true
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitPeriodUsedService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#periodDateUsedOptions',
                text: 'Select what period was used for this volume'
              }
            ],
            periodDateUsedOptions: { text: 'Select what period was used for this volume' }
          })
        })
      })
    })
  })
})
