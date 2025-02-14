'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AdHocLicencePresenter = require('../../../../app/presenters/notifications/setup/ad-hoc-licence.presenter.js')

describe('Notifications Setup - Ad Hoc Licence presenter', () => {
  let licenceRef

  it('correctly presents the data', () => {
    const result = AdHocLicencePresenter.go(licenceRef)

    expect(result).to.equal({
      licenceRef: null,
      pageTitle: 'Enter a licence number'
    })
  })

  describe('where the user has previously entered a licence ref', () => {
    beforeEach(() => {
      licenceRef = '01/111'
    })

    it('correctly presents the data', () => {
      const result = AdHocLicencePresenter.go(licenceRef)

      expect(result).to.equal({
        licenceRef: '01/111',
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
