// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { today } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitReceivedService from '../../../../app/services/return-logs/setup/submit-received.service.js'

describe('Return Logs - Setup - Submit Received service', () => {
  let payload
  let session
  let sessionData
  let testDate
  let yarStub

  beforeEach(() => {
    sessionData = {
      licenceId: 'cd190dc7-912a-46a5-9421-2750fb1c7ac8',
      returnLogId: '8280a3bb-aefb-4603-b71f-a58cef9169f3',
      returnReference: '12345',
      startDate: '2023-04-01T00:00:00.000Z'
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
    describe('with a valid payload (todays date)', () => {
      beforeEach(() => {
        testDate = today()
        payload = {
          receivedDateOptions: 'today'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitReceivedService(session.id, payload, yarStub)

        expect(session.receivedDateOptions).toEqual('today')
        expect(new Date(session.receivedDate)).toEqual(testDate)
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitReceivedService(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({ ...sessionData, checkPageVisited: true })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitReceivedService(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
          await SubmitReceivedService(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ titleText: 'Updated', text: 'Reporting details changed' })
        })
      })
    })

    describe('with a valid payload (yesterdays date)', () => {
      beforeEach(() => {
        testDate = today()
        testDate.setDate(testDate.getDate() - 1)
        payload = {
          receivedDateOptions: 'yesterday'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitReceivedService(session.id, payload, yarStub)

        expect(session.receivedDateOptions).toEqual('yesterday')
        expect(new Date(session.receivedDate)).toEqual(testDate)
        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('with a valid payload (custom received date)', () => {
      beforeEach(() => {
        payload = {
          receivedDateOptions: 'customDate',
          receivedDateDay: '26',
          receivedDateMonth: '11',
          receivedDateYear: '2023'
        }
      })

      it('saves the submitted values', async () => {
        await SubmitReceivedService(session.id, payload, yarStub)

        expect(session.receivedDateOptions).toEqual('customDate')
        expect(session.receivedDateDay).toEqual('26')
        expect(session.receivedDateMonth).toEqual('11')
        expect(session.receivedDateYear).toEqual('2023')
        expect(new Date(session.receivedDate)).toEqual(new Date('2023-11-26'))
        expect(session.$update).toHaveBeenCalled()
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitReceivedService(session.id, payload, yarStub)

        expect(result).toEqual({ checkPageVisited: undefined })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitReceivedService(session.id, payload, yarStub)

        expect(result).toMatchObject({
          pageTitle: 'When was the return received?',
          receivedDateDay: null,
          receivedDateMonth: null,
          receivedDateYear: null,
          receivedDateOption: null,
          backLink: {
            href: '/system/return-logs/8280a3bb-aefb-4603-b71f-a58cef9169f3/details',
            text: 'Back'
          },
          pageTitleCaption: 'Return reference 12345'
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReceivedService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#receivedDateOptions',
                text: 'Select the return received date'
              }
            ],
            receivedDateOptions: { text: 'Select the return received date' }
          })
        })
      })

      describe('because the user has selected custom received date and entered invalid data', () => {
        beforeEach(() => {
          payload = {
            receivedDateOptions: 'customDate',
            receivedDateDay: 'a',
            receivedDateMonth: 'b',
            receivedDateYear: 'c'
          }
        })

        it('includes an error for the date input element', async () => {
          const result = await SubmitReceivedService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#date',
                text: 'Enter a real received date'
              }
            ],
            date: { text: 'Enter a real received date' }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitReceivedService(session.id, payload, yarStub)

          expect(result.receivedDateDay).toEqual('a')
          expect(result.receivedDateMonth).toEqual('b')
          expect(result.receivedDateYear).toEqual('c')
          expect(result.receivedDateOption).toEqual('customDate')
        })
      })
    })
  })
})
