'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceNumberPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/licence-number.presenter.js')

describe('Licence Monitoring Station Setup - Licence Number Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicenceNumberPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
