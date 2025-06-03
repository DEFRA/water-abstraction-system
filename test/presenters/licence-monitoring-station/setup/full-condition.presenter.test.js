'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const FullConditionPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/full-condition.presenter.js')

describe('Full Condition Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = FullConditionPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
