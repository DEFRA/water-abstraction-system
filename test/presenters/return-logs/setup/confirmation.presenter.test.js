'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ConfirmationPresenter = require('../../../../app/presenters/return-logs/setup/confirmation.presenter.js')

describe('Return Logs Setup - Confirmation presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      data: {
        licenceId: '7a12fa8e-b9fe-4567-a66e-592db1642cc9',
        licenceRef: '01/01',
        returnLogId: 'v1:6:01/01:10059108:2023-04-01:2024-03-31',
        underQuery: true,
        siteDescription: 'Addington Sandpits',
        purposes: 'Mineral Washing'
      }
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(session)

      expect(result).to.equal({
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        returnLog: {
          returnLogId: 'v1:6:01/01:10059108:2023-04-01:2024-03-31',
          purposes: 'Mineral Washing',
          siteDescription: 'Addington Sandpits'
        },
        licenceRef: '01/01',
        licenceId: '7a12fa8e-b9fe-4567-a66e-592db1642cc9',
        pageTitle: 'Query recorded'
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the returnLog is under query', () => {
      it('returns a "Query recorded"', () => {
        const result = ConfirmationPresenter.go(session)

        expect(result.pageTitle).to.equal('Query recorded')
      })
    })

    describe('when the returnLog is not under query', () => {
      beforeEach(() => {
        session.data.underQuery = false
      })

      it('returns "Query resolved"', () => {
        const result = ConfirmationPresenter.go(session)

        expect(result.pageTitle).to.equal('Query resolved')
      })
    })
  })
})
