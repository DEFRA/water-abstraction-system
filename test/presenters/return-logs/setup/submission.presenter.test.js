'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SubmissionPresenter = require('../../../../app/presenters/return-logs/setup/submission.presenter.js')

describe('Return Logs Setup - Submission presenter', () => {
  let session

  describe('when provided with a populated session', () => {
    beforeEach(() => {
      session = {
        id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
        beenReceived: false,
        returnReference: '1234'
      }
    })

    it('correctly presents the data', () => {
      const result = SubmissionPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received',
        beenReceived: false,
        journey: null,
        pageTitle: 'What do you want to do with this return?',
        returnReference: '1234'
      })
    })

    describe('the "journey" property', () => {
      describe('when an option has been selected and submitted', () => {
        beforeEach(() => {
          session.journey = 'enter-return'
        })

        it('returns the selected option', () => {
          const result = SubmissionPresenter.go(session)

          expect(result.journey).to.equal('enter-return')
        })
      })
    })
  })
})
