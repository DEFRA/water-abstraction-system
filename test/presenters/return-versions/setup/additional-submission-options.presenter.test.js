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
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC'
      },
      quarterlyReturnSubmissions: false
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data without additional submission options', () => {
      const result = AdditionalSubmissionOptionsPresenter.go(session)

      expect(result).to.be.equal({
        additionalSubmissionOptions: [],
        backLink: `/system/return-versions/setup/${session.id}/check`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        quarterlyReturnSubmissions: false,
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

        expect(result.additionalSubmissionOptions).to.be.empty()
      })
    })
  })
})
