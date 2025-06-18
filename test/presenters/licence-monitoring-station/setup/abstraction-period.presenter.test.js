'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AbstractionPeriodPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/abstraction-period.presenter.js')

describe('Abstraction Period Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AbstractionPeriodPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
