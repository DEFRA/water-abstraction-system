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

  describe('when called with an empty address object', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
        address: {}
      }
    })

    it('returns page data for the view', () => {
      const result = ManualPresenter.go(session)

      expect(result).to.equal({
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: `/system/address/${session.id}/postcode`,
        pageTitle: 'Enter the address',
        postcode: null
      })
    })
  })

  describe('when called with an address object', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
        address: {
          uprn: '123456789',
          addressLine1: '1 Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        }
      }
    })
    it('returns page data for the view', () => {
      const result = ManualPresenter.go(session)

      expect(result).to.equal({
        addressLine1: '1 Fake Farm',
        addressLine2: '1 Fake street',
        addressLine3: 'Fake Village',
        addressLine4: 'Fake City',
        backLink: `/system/address/${session.id}/select`,
        pageTitle: 'Enter the address',
        postcode: 'SW1A 1AA'
      })
    })
  })
})
