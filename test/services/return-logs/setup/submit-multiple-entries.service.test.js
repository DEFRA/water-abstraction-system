// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitMultipleEntriesService from '../../../../app/services/return-logs/setup/submit-multiple-entries.service.js'

describe('Return Logs Setup - Submit Multiple Entries service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      lines: [
        { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
        { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
      ],
      returnsFrequency: 'month',
      reported: 'abstractionVolumes',
      unitSymbol: 'Ml'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { multipleEntries: '100, 200' }
      })

      describe('and the user has previously selected "abstractionVolumes" as the reported type', () => {
        it('saves the submitted option', async () => {
          await SubmitMultipleEntriesService(session.id, payload, yarStub)

          expect(session.lines[0].quantity).toEqual(100)
          expect(session.lines[0].quantityCubicMetres).toEqual(100000)
          expect(session.lines[1].quantity).toEqual(200)
          expect(session.lines[1].quantityCubicMetres).toEqual(200000)
          expect(session.$update.called).toBe(true)
        })

        it('sets the notification message title to "Updated" and the text to "2 monthly volumes have been updated" ', async () => {
          await SubmitMultipleEntriesService(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            title: 'Updated',
            text: '2 monthly volumes have been updated'
          })
        })
      })

      describe('and the user has previously selected "meterReadings" as the reported type', () => {
        beforeEach(() => {
          sessionData = {
            returnReference: '12345',
            lines: [
              { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
              { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
            ],
            returnsFrequency: 'month',
            reported: 'meterReadings'
          }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted option', async () => {
          await SubmitMultipleEntriesService(session.id, payload, yarStub)

          expect(session.lines[0].reading).toEqual(100)
          expect(session.lines[1].reading).toEqual(200)
          expect(session.$update.called).toBe(true)
        })

        it('sets the notification message title to "Updated" and the text to "2 monthly meter readings have been updated" ', async () => {
          await SubmitMultipleEntriesService(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            title: 'Updated',
            text: '2 monthly meter readings have been updated'
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitMultipleEntriesService(session.id, payload, yarStub)

        expect(result).toMatchObject({
          backLink: {
            href: `/system/return-logs/setup/${session.id}/check`,
            text: 'Back'
          },
          endDate: '1 May 2023',
          frequency: 'monthly',
          lineCount: 2,
          measurementType: 'volumes',
          multipleEntries: null,
          pageTitle: 'Enter multiple monthly volumes',
          pageTitleCaption: 'Return reference 12345',
          startDate: '1 April 2023'
        })
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input form element', async () => {
          const result = await SubmitMultipleEntriesService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#multipleEntries',
                text: 'Enter 2 monthly volumes'
              }
            ],
            multipleEntries: {
              text: 'Enter 2 monthly volumes'
            }
          })
        })
      })
    })
  })
})
