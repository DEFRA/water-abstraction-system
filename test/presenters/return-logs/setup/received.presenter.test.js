// Test helpers
import { formatLongDate } from '../../../../app/presenters/base.presenter.js'
import { today } from '../../../../app/lib/general.lib.js'

// Thing under test
import ReceivedPresenter from '../../../../app/presenters/return-logs/setup/received.presenter.js'

describe('Return Logs - Setup - Received presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      licenceId: 'a96ce5c6-2c42-4b3f-946d-0428b5f07ce6',
      returnLogId: '8280a3bb-aefb-4603-b71f-a58cef9169f3',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ReceivedPresenter(session)

      expect(result).toEqual({
        pageTitle: 'When was the return received?',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        pageTitleCaption: 'Return reference 012345',
        receivedDateOption: null,
        receivedDateDay: null,
        receivedDateMonth: null,
        receivedDateYear: null,
        backLink: {
          href: '/system/return-logs/8280a3bb-aefb-4603-b71f-a58cef9169f3/details',
          text: 'Back'
        },
        todaysDate: formatLongDate(today()),
        yesterdaysDate: _yesterdaysDate()
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = ReceivedPresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        })
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the view "Return Log" page', () => {
        const result = ReceivedPresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/return-logs/8280a3bb-aefb-4603-b71f-a58cef9169f3/details',
          text: 'Back'
        })
      })
    })
  })

  describe('the "receivedDate" properties', () => {
    describe("when the user has previously selected today's date as the received date", () => {
      beforeEach(() => {
        session.receivedDateOptions = 'today'
      })

      it('returns the "receivedDateOption" property populated to re-select the option', () => {
        const result = ReceivedPresenter(session)

        const { receivedDateOption, receivedDateDay, receivedDateMonth, receivedDateYear } = result

        expect(receivedDateDay).toBeNull()
        expect(receivedDateMonth).toBeNull()
        expect(receivedDateYear).toBeNull()
        expect(receivedDateOption).toEqual('today')
      })
    })

    describe('when the user has previously selected yesterdays date as the received date', () => {
      beforeEach(() => {
        session.receivedDateOptions = 'yesterday'
      })

      it('returns the "receivedDateOption" property populated to re-select the option', () => {
        const result = ReceivedPresenter(session)

        const { receivedDateOption, receivedDateDay, receivedDateMonth, receivedDateYear } = result

        expect(receivedDateDay).toBeNull()
        expect(receivedDateMonth).toBeNull()
        expect(receivedDateYear).toBeNull()
        expect(receivedDateOption).toEqual('yesterday')
      })
    })

    describe('when the user has previously selected custom date as the received date', () => {
      beforeEach(() => {
        session.receivedDateDay = '26'
        session.receivedDateMonth = '11'
        session.receivedDateYear = '2023'
        session.receivedDateOptions = 'custom-date'
      })

      it('returns the properties needed to re-populate the fields', () => {
        const result = ReceivedPresenter(session)

        const { receivedDateOption, receivedDateDay, receivedDateMonth, receivedDateYear } = result

        expect(receivedDateDay).toEqual('26')
        expect(receivedDateMonth).toEqual('11')
        expect(receivedDateYear).toEqual('2023')
        expect(receivedDateOption).toEqual('custom-date')
      })
    })
  })
})

function _yesterdaysDate() {
  const yesterdaysDate = new Date()
  yesterdaysDate.setDate(yesterdaysDate.getDate() - 1)

  return formatLongDate(yesterdaysDate)
}
