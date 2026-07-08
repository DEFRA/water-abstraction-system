// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitReadingsService from '../../../../app/services/return-logs/setup/submit-readings.service.js'

describe('Return Logs Setup - Submit Readings service', () => {
  let payload
  let session
  let sessionData
  let yarStub
  let yearMonth

  beforeEach(() => {
    sessionData = {
      lines: [
        {
          endDate: '2023-04-30T00:00:00.000Z',
          reading: 100,
          startDate: '2023-04-01T00:00:00.000Z'
        },
        {
          endDate: '2023-05-31T00:00:00.000Z',
          startDate: '2023-05-01T00:00:00.000Z'
        },
        {
          endDate: '2023-06-30T00:00:00.000Z',
          reading: 300,
          startDate: '2023-06-01T00:00:00.000Z'
        }
      ],
      returnsFrequency: 'month',
      returnReference: '1234'
    }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and no readings have been entered', () => {
        beforeEach(() => {
          payload = {}
          yearMonth = '2023-4' // May 2023
        })

        it('saves the reading for May as null', async () => {
          await SubmitReadingsService(session.id, payload, yarStub, yearMonth)

          expect(session.lines).toEqual([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              reading: 100,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              reading: null,
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              reading: 300,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ])
          expect(session.$update.called).toBe(true)
        })

        it('sets the notification message title to "Updated" and the text to "Readings have been updated" ', async () => {
          await SubmitReadingsService(session.id, payload, yarStub, yearMonth)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ titleText: 'Updated', text: 'Readings have been updated' })
        })
      })

      describe('and a reading has been entered', () => {
        beforeEach(() => {
          payload = { '2023-06-30T00:00:00.000Z': '200' }
          yearMonth = '2023-5' // June 2023
        })

        it('saves the reading for June as 200', async () => {
          await SubmitReadingsService(session.id, payload, yarStub, yearMonth)

          expect(session.lines).toEqual([
            {
              endDate: '2023-04-30T00:00:00.000Z',
              reading: 100,
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z'
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              reading: 200,
              startDate: '2023-06-01T00:00:00.000Z'
            }
          ])
          expect(session.$update.called).toBe(true)
        })

        it('sets the notification message title to "Updated" and the text to "Readings have been updated" ', async () => {
          await SubmitReadingsService(session.id, payload, yarStub, yearMonth)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ titleText: 'Updated', text: 'Readings have been updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = { '2023-04-30T00:00:00.000Z': 'INVALID' }
        yearMonth = '2023-3' // April 2023
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitReadingsService(session.id, payload, yarStub, yearMonth)

        expect(result).toEqual({
          error: {
            '2023-04-30T00:00:00.000Z': {
              text: 'Reading must be a number or blank'
            },
            errorList: [
              {
                href: '#2023-04-30T00:00:00.000Z',
                text: 'Reading must be a number or blank'
              }
            ]
          },
          backLink: {
            href: `/system/return-logs/setup/${session.id}/check`,
            text: 'Back'
          },
          inputLines: [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              error: 'Reading must be a number or blank',
              label: 'April 2023',
              reading: 'INVALID',
              viewId: 'April2023'
            }
          ],
          pageTitle: 'Water abstracted April 2023',
          pageTitleCaption: 'Return reference 1234'
        })
      })

      describe('because the user has not entered a number', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReadingsService(session.id, payload, yarStub, yearMonth)

          expect(result.error).toEqual({
            '2023-04-30T00:00:00.000Z': {
              text: 'Reading must be a number or blank'
            },
            errorList: [
              {
                href: '#2023-04-30T00:00:00.000Z',
                text: 'Reading must be a number or blank'
              }
            ]
          })
        })
      })
    })
  })
})
