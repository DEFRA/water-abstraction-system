'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AlertEmailAddressPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js')

describe('Alert Email Address Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertEmailAddressPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
