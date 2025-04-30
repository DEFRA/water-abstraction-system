'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ScaffyPresenter = require('../../../app/presenters/demo/scaffy.presenter.js')

describe('Scaffy Presenter', () => {
  let session

  beforeEach(async () => {})

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ScaffyPresenter.go(session.id)

      expect(result).to.equal({})
    })
  })
})
