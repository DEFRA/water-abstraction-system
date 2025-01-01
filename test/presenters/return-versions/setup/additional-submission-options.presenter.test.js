'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

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
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      multipleUpload: false,
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data without additional submission options', () => {
      const result = AdditionalSubmissionOptionsPresenter.go(session)

      expect(result).to.be.equal({
        backLink: `/system/return-versions/setup/${session.id}/check`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        multipleUpload: false,
        noAdditionalOptions: undefined,
        quarterlyReturnSubmissions: false,
        quarterlyReturns: undefined,
        sessionId: session.id
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "check" page', () => {
      const result = AdditionalSubmissionOptionsPresenter.go(session)

      expect(result.backLink).to.equal(`/system/return-versions/setup/${session.id}/check`)
    })
  })

  describe('the "multipleUpload" property', () => {
    describe('when the user has previously submitted "multipleUpload" for additional options or it has been set initially when the licence holder is a water company', () => {
      beforeEach(() => {
        session.multipleUpload = true
      })

      it('returns true', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.multipleUpload).to.be.true()
      })
    })

    describe('when the user has not previously submitted "multipleUpload" for additional options', () => {
      beforeEach(() => {
        session.multipleUpload = false
      })

      it('returns false', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.multipleUpload).to.be.false()
      })
    })
  })

  describe('the "quarterlyReturns" property', () => {
    describe('when the user has previously submitted "quarterlyReturns" for additional options or it has been set initially when the licence holder is a water company and the return version start date is a quarterly return', () => {
      beforeEach(() => {
        session.quarterlyReturns = true
      })

      it('returns true', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.quarterlyReturns).to.be.true()
      })
    })

    describe('when the user has not previously submitted "quarterlyReturns" for additional options', () => {
      beforeEach(() => {
        session.quarterlyReturns = undefined
      })

      it('returns false', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.quarterlyReturns).to.be.undefined()
      })
    })
  })

  describe('the "quarterlyReturnSubmissions" property', () => {
    describe('when the return version start date is in for quarterly returns', () => {
      beforeEach(() => {
        session.returnVersionStartDate = '2025-04-01'
      })

      it('returns true', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.quarterlyReturnSubmissions).to.be.true()
      })
    })

    describe('when the return version start date is not for quarterly returns', () => {
      beforeEach(() => {
        session.returnVersionStartDate = '2001-01-01'
      })

      it('returns true', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.quarterlyReturnSubmissions).to.be.false()
      })
    })
  })

  describe('the "noAdditionalOptions" property', () => {
    describe('when the user has previously submitted "none" for additional options', () => {
      beforeEach(() => {
        session.noAdditionalOptions = true
      })

      it('returns true', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.noAdditionalOptions).to.be.true()
      })
    })

    describe('when the user has selected another additional option', () => {
      beforeEach(() => {
        session.noAdditionalOptions = false
      })

      it('returns false', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.noAdditionalOptions).to.be.false()
      })
    })

    describe('when the user has not previously submitted for no additional options', () => {
      it('returns false', () => {
        const result = AdditionalSubmissionOptionsPresenter.go(session)

        expect(result.noAdditionalOptions).to.be.undefined()
      })
    })
  })
})
