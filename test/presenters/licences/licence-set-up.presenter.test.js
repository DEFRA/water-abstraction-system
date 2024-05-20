'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceSetUpPresenter = require('../../../app/presenters/licences/licence-set-up.presenter.js')

describe('Licence set up presenter', () => {
  let licenceSetUp

  beforeEach(() => {
    licenceSetUp = []
  })

  describe('when provided with populated licence set up data', () => {
    it('correctly presents the data', () => {
      const result = LicenceSetUpPresenter.go(licenceSetUp)

      expect(result).to.equal({
        chargeVersions: [],
        workflowRecords: []
      })
    })
  })
})
