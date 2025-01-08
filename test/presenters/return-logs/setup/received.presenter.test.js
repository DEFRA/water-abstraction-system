'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReceivedPresenter = require('../../../../app/presenters/return-logs/setup/received.presenter.js')

describe('Return Logs Setup - Received presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      data: {
        licenceRef: '01/01'
      }
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ReceivedPresenter.go(session)

      expect(result).to.equal({
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        licenceRef: '01/01',
        receivedDateOption: null,
        receivedDateDay: null,
        receivedDateMonth: null,
        receivedDateYear: null,
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/start'
      })
    })
  })

  describe('the "receivedDate" properties', () => {
    describe('when the user has previously selected todays date as the received date', () => {
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
