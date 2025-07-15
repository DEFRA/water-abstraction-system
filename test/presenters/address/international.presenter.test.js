'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const InternationalPresenter = require('../../../app/presenters/address/international.presenter.js')

describe('Address - International Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = InternationalPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
