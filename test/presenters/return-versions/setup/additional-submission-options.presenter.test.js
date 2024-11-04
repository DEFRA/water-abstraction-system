'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AdditionalSubmissionOptionsPresenter = require('../../../../app/presenters/return-versions/setup/additional-submission-options.presenter.js')

describe('Return Versions Setup - Additional Submission Options presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        waterUndertaker: false
      },
      journey: 'returns-required',
      requirements: [{}],
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data without additional submission options', () => {
      const result = AdditionalSubmissionOptionsPresenter.go(session)

      expect(result).to.be.equal({
        backLink: `/system/return-versions/setup/${session.id}/check`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        additionalSubmissionOptions: ['none'],
        licenceRef: '01/ABC',
        sessionId: session.id,
        quarterlyReturnSubmissions: false
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "check" page', () => {
      const result = AdditionalSubmissionOptionsPresenter.go(session)

      expect(result.backLink).to.equal(`/system/return-versions/setup/${session.id}/check`)
    })
  })

  describe('the "additionalSubmissionOptions" property', () => {
    describe('when the user has previously submitted additional submission options', () => {
      beforeEach(() => {
        session.additionalSubmissionOptions = ['multiple-upload']
      })

      it('returns the options', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.additionalSubmissionOptions).to.include('multiple-upload')
      })
    })

    describe('when the user has not previously chosen options', () => {
      it('returns empty options', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.additionalSubmissionOptions).to.equal(['none'])
      })
    })
  })

  describe('the "quarterlyReturnSubmissions" property', () => {
    describe('when the return version is for quarterly return submissions', () => {
      beforeEach(() => {
        session.licence.waterUndertaker = true
        session.returnVersionStartDate = '2025-04-01'
      })

      it('returns quarterly returns submissions as true', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.quarterlyReturnSubmissions).to.equal(true)
      })

      describe('and the licence holder is a water company', () => {
        it('returns the default options', () => {
          const result = AdditionalSubmissionOptionsPresenter.go(session)

          expect(result.additionalSubmissionOptions).to.include('multiple-upload')
          expect(result.additionalSubmissionOptions).to.include('quarterly-return-submissions')
        })
      })

      describe('and the licence holder is not a water company', () => {
        beforeEach(() => {
          session.licence.waterUndertaker = false
        })

        it('returns the default options', () => {
          const result = AdditionalSubmissionOptionsPresenter.go(session)

          expect(result.additionalSubmissionOptions).to.equal(['none'])
        })
      })

      describe('and there is existing session data', () => {
        beforeEach(() => {
          session.additionalSubmissionOptions = ['none']
        })

        it('returns the session options', () => {
          const result = AdditionalSubmissionOptionsPresenter.go(session)

          expect(result.additionalSubmissionOptions).to.include('none')
        })
      })
    })

    describe('when the return version is not for quarterly return submissions', () => {
      beforeEach(() => {
        session.licence.waterUndertaker = true
        session.returnVersionStartDate = '2025-03-01'
      })

      describe('and the licence is for a water company', () => {
        it('returns the options', () => {
          const result = AdditionalSubmissionOptionsPresenter.go(session)

          expect(result.quarterlyReturnSubmissions).to.be.false()
          expect(result.additionalSubmissionOptions).to.equal(['multiple-upload', 'quarterly-return-submissions'])
        })
      })

      describe('and the licence is not for a water company', () => {
        beforeEach(() => {
          session.licence.waterUndertaker = false
        })

        it('returns the options', () => {
          const result = AdditionalSubmissionOptionsPresenter.go(session)

          expect(result.quarterlyReturnSubmissions).to.be.false()
          expect(result.additionalSubmissionOptions).to.equal(['none'])
        })
      })
    })
  })
})
