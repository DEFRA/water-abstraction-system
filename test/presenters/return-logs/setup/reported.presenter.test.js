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
        pageTitle: 'How was this return reported?',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        returnReference: '012345',
        reported: null,
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/submission'
      })
    })
  })

  describe('the "reported" property', () => {
    describe('when the user has previously selected "Meter Readings" as the reported type', () => {
      beforeEach(() => {
        session.reported = 'meter-readings'
      })

      it('returns the "reported" property populated to re-select the option', () => {
        const result = ReportedPresenter.go(session)

        expect(result.reported).to.equal('meter-readings')
      })
    })

    describe('when the user has previously selected "Abstraction Volumes" as the reported type', () => {
      beforeEach(() => {
        session.reported = 'abstraction-volumes'
      })

      it('returns the "reported" property populated to re-select the option', () => {
        const result = ReportedPresenter.go(session)

        expect(result.reported).to.equal('abstraction-volumes')
      })
    })
  })
})
