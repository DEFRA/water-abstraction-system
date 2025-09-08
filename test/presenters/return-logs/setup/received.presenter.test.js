'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')

// Thing under test
const ReceivedPresenter = require('../../../../app/presenters/return-logs/setup/received.presenter.js')

describe('Return Logs - Setup - Received presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      licenceId: 'a96ce5c6-2c42-4b3f-946d-0428b5f07ce6',
      returnLogId: 'v1:1:01/12/123:10065476:2025-01-06:2025-10-31',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ReceivedPresenter.go(session)

      expect(result).to.equal({
        pageTitle: 'When was the return received?',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        caption: 'Return reference 012345',
        receivedDateOption: null,
        receivedDateDay: null,
        receivedDateMonth: null,
        receivedDateYear: null,
        backLink: '/system/return-logs?id=v1:1:01/12/123:10065476:2025-01-06:2025-10-31',
        todaysDate: formatLongDate(new Date()),
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
        const result = ReceivedPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the view "Return Log" page', () => {
        const result = ReceivedPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs?id=v1:1:01/12/123:10065476:2025-01-06:2025-10-31')
      })
    })
  })

  describe('the "receivedDate" properties', () => {
    describe("when the user has previously selected today's date as the received date", () => {
      beforeEach(() => {
        session.receivedDateOptions = 'today'
      })

      it('returns the "receivedDateOption" property populated to re-select the option', () => {
        const result = ReceivedPresenter.go(session)

        const { receivedDateOption, receivedDateDay, receivedDateMonth, receivedDateYear } = result

        expect(receivedDateDay).to.be.null()
        expect(receivedDateMonth).to.be.null()
        expect(receivedDateYear).to.be.null()
        expect(receivedDateOption).to.equal('today')
      })
    })

    describe('when the user has previously selected yesterdays date as the received date', () => {
      beforeEach(() => {
        session.receivedDateOptions = 'yesterday'
      })

      it('returns the "receivedDateOption" property populated to re-select the option', () => {
        const result = ReceivedPresenter.go(session)

        const { receivedDateOption, receivedDateDay, receivedDateMonth, receivedDateYear } = result

        expect(receivedDateDay).to.be.null()
        expect(receivedDateMonth).to.be.null()
        expect(receivedDateYear).to.be.null()
        expect(receivedDateOption).to.equal('yesterday')
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
        const result = ReceivedPresenter.go(session)

        const { receivedDateOption, receivedDateDay, receivedDateMonth, receivedDateYear } = result

        expect(receivedDateDay).to.equal('26')
        expect(receivedDateMonth).to.equal('11')
        expect(receivedDateYear).to.equal('2023')
        expect(receivedDateOption).to.equal('custom-date')
      })
    })
  })
})

function _yesterdaysDate() {
  const yesterdaysDate = new Date()
  yesterdaysDate.setDate(yesterdaysDate.getDate() - 1)

  return formatLongDate(yesterdaysDate)
}
