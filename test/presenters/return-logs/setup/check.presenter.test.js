'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckPresenter = require('../../../../app/presenters/return-logs/setup/check.presenter.js')

describe('Return Logs Setup - Check presenter', () => {
  let session

  describe('when provided with a populated session', () => {
    beforeEach(() => {
      session = {
        id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
        returnReference: '1234'
      }
    })

    it('correctly presents the data', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        pageTitle: 'Check details and enter new volumes or readings',
        returnReference: '1234',
        sessionId: session.id
      })
    })
  })
})
