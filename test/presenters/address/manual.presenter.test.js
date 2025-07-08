'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ManualPresenter = require('../../../app/presenters/address/manual.presenter.js')

describe('Address - Manual Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ManualPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
