'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter')

describe('View Licence returns presenter', () => {
  let licence
  beforeEach(() => {
    licence = _licence()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(licence)

      expect(result).to.equal({
        activeTab: 'returns',
        message: 'hello returns'
      })
    })
  })
})

function _licence () {
  return {}
}
