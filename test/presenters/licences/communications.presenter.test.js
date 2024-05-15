'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CommunicationsPresenter = require('../../../app/presenters/licences/communications.presenter.js')

describe('Communications presenter', () => {
  let communications

  beforeEach(() => {
    communications = []
  })

  describe('when provided with populated communications data', () => {
    it('correctly presents the data', () => {
      const result = CommunicationsPresenter.go(communications)

      expect(result).to.equal({
        communications: []
      })
    })
  })
})
