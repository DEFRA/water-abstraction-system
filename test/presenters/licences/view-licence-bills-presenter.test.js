'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceBillsPresenter = require('../../../app/presenters/licences/view-licence-bills.presenter')

describe('View Licence Bills presenter', () => {
  let auth

  beforeEach(() => {
    auth = undefined
  })

  describe('when provided with a bills data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceBillsPresenter.go(_bills())

      expect(result).to.equal({
        activeTab: 'bills'
      })
    })
  })
})

function _bills () {
  return {}
}
