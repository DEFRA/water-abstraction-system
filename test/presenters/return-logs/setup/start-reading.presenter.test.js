'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StartReadingPresenter = require('../../../../app/presenters/return-logs/setup/start-reading.presenter.js')

describe('Return Logs Setup - Start Reading presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = StartReadingPresenter.go(session)

      expect(result).to.equal({
        backLink: { href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported', text: 'Back' },
        pageTitle: 'Enter the start meter reading',
        pageTitleCaption: 'Return reference 012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startReading: null
      })
    })
  })

  describe('the "startReading" property', () => {
    describe('when the user has previously entered a start reading', () => {
      beforeEach(() => {
        session.startReading = 156000
      })

      it('returns the "startReading" property populated to display the input', () => {
        const result = StartReadingPresenter.go(session)

        expect(result.startReading).to.equal(156000)
      })
    })

    describe('when the user has previously entered a 0 start reading', () => {
      beforeEach(() => {
        session.startReading = 0
      })

      it('returns the "startReading" property with a string version of 0 to display the input', () => {
        const result = StartReadingPresenter.go(session)

        expect(result.startReading).to.equal('0')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = StartReadingPresenter.go(session)

        expect(result.backLink.href).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Reported" page', () => {
        const result = StartReadingPresenter.go(session)

        expect(result.backLink.href).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported')
      })
    })
  })
})
