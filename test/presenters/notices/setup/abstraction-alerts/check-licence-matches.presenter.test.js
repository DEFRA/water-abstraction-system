'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckLicenceMatchesPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckLicenceMatchesPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
