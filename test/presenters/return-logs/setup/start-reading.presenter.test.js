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
        pageTitle: 'Enter the start meter reading',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        returnReference: '012345',
        startReading: null,
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported'
      })
    })
  })

  describe('the "startReading" property', () => {
    describe('when the user has previously entered a start reading', () => {
      beforeEach(() => {
        session.startReading = '156000'
      })

      it('returns the "startReading" property populated to display the input', () => {
        const result = StartReadingPresenter.go(session)

        expect(result.startReading).to.equal('156000')
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

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Reported" page', () => {
        const result = StartReadingPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported')
      })
    })
  })
})
