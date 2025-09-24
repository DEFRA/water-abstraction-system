'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReportedPresenter = require('../../../../app/presenters/return-logs/setup/reported.presenter.js')

describe('Return Logs Setup - Reported presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ReportedPresenter.go(session)

      expect(result).to.equal({
        backLink: { href: `/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/submission`, text: 'Back' },
        reported: null,
        pageTitle: 'How was this return reported?',
        pageTitleCaption: 'Return reference 012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = ReportedPresenter.go(session)

        expect(result.backLink).to.equal({
          href: `/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check`,
          text: 'Back'
        })
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Submission" page', () => {
        const result = ReportedPresenter.go(session)

        expect(result.backLink).to.equal({
          href: `/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/submission`,
          text: 'Back'
        })
      })
    })
  })

  describe('the "reported" property', () => {
    describe('when the user has previously selected "Meter Readings" as the reported type', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns the "reported" property populated to re-select the option', () => {
        const result = ReportedPresenter.go(session)

        expect(result.reported).to.equal('meterReadings')
      })
    })

    describe('when the user has previously selected "Abstraction Volumes" as the reported type', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      it('returns the "reported" property populated to re-select the option', () => {
        const result = ReportedPresenter.go(session)

        expect(result.reported).to.equal('abstractionVolumes')
      })
    })
  })
})
