'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StopOrReducePresenter = require('../../../../../app/presenters//licence-monitoring-station/setup/stop-or-reduce.presenter.js')

describe('Stop Or Reduce Presenter', () => {
  let session

  beforeEach(async () => {})

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = StopOrReducePresenter.go(session.id)

      expect(result).to.equal({})
    })
  })
})
