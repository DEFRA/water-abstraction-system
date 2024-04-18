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
          'from-abstraction-period-day': '01',
          'from-abstraction-period-month': '12',
          'to-abstraction-period-day': '02',
          'to-abstraction-period-month': '7'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAbstractionPeriodService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.abstractionPeriod).to.equal({
          'to-abstraction-period-day': '02',
          'from-abstraction-period-day': '01',
          'to-abstraction-period-month': '7',
          'from-abstraction-period-month': '12'
        })
      })

      it('returns an empty object (no page data needed for a redirect)', async () => {
        const result = await SubmitAbstractionPeriodService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not inputted anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: null,
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            id: 'aeb46f58-3431-42af-8724-361a7779becf',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            abstractionPeriod: {
              fromDay: null,
              fromMonth: null,
              toDay: null,
              toMonth: null
            }
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the data input form element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              fromResult: 'Select the from date of the abstraction period',
              toResult: 'Select the to date of the abstraction period'
            }
          })
        })
      })

      describe('because the user has not inputted a from abstraction period', () => {
        beforeEach(() => {
          payload = {
            'from-abstraction-period-day': null,
            'from-abstraction-period-month': null,
            'to-abstraction-period-day': '02',
            'to-abstraction-period-month': '7'
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: null,
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            id: 'aeb46f58-3431-42af-8724-361a7779becf',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            abstractionPeriod: {
              fromDay: null,
              fromMonth: null,
              toDay: '02',
              toMonth: '7'
            }
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the data input form element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              fromResult: 'Select the from date of the abstraction period',
              toResult: null
            }
          })
        })
      })

      describe('because the user has not inputted a to abstraction period', () => {
        beforeEach(() => {
          payload = {
            'from-abstraction-period-day': '08',
            'from-abstraction-period-month': '12',
            'to-abstraction-period-day': null,
            'to-abstraction-period-month': null
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: null,
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            id: 'aeb46f58-3431-42af-8724-361a7779becf',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            abstractionPeriod: {
              fromDay: '08',
              fromMonth: '12',
              toDay: null,
              toMonth: null
            }
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the data input form element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              fromResult: null,
              toResult: 'Select the to date of the abstraction period'
            }
          })
        })
      })

      describe('because the user has inputted invalid from and to abstraction periods', () => {
        beforeEach(() => {
          payload = {
            'from-abstraction-period-day': 'abc',
            'from-abstraction-period-month': '123',
            'to-abstraction-period-day': 'abc',
            'to-abstraction-period-month': '123'
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: null,
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            id: 'aeb46f58-3431-42af-8724-361a7779becf',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            abstractionPeriod: {
              fromDay: 'abc',
              fromMonth: '123',
              toDay: 'abc',
              toMonth: '123'
            }
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              fromResult: 'Enter a real from date',
              toResult: 'Enter a real to date'
            }
          })
        })
      })

      describe('because the user has inputted invalid from abstraction period', () => {
        beforeEach(() => {
          payload = {
            'from-abstraction-period-day': 'abc',
            'from-abstraction-period-month': '123',
            'to-abstraction-period-day': '02',
            'to-abstraction-period-month': '07'
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: null,
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            id: 'aeb46f58-3431-42af-8724-361a7779becf',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            abstractionPeriod: {
              fromDay: 'abc',
              fromMonth: '123',
              toDay: '02',
              toMonth: '07'
            }
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the data input form element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              fromResult: 'Enter a real from date',
              toResult: null
            }
          })
        })
      })

      describe('because the user has inputted invalid to abstraction period', () => {
        beforeEach(() => {
          payload = {
            'from-abstraction-period-day': '08',
            'from-abstraction-period-month': '12',
            'to-abstraction-period-day': 'abc',
            'to-abstraction-period-month': '123'
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: null,
            pageTitle: 'Enter the abstraction period for the requirements for returns',
            id: 'aeb46f58-3431-42af-8724-361a7779becf',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            abstractionPeriod: {
              fromDay: '08',
              fromMonth: '12',
              toDay: 'abc',
              toMonth: '123'
            }
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the data input form element', async () => {
          const result = await SubmitAbstractionPeriodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: {
              fromResult: null,
              toResult: 'Enter a real to date'
            }
          })
        })
      })
    })
  })
})
