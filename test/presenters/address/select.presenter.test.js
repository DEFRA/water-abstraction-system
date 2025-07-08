'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SelectPresenter = require('../../../app/presenters/address/select.presenter.js')

describe('Address - Select Presenter', () => {
  let addresses

  describe('when called with one address', () => {
    beforeEach(() => {
      addresses = [
        {
          address: 'address 1',
          postcode: 'SW1A 1AA',
          uprn: '123456789'
        }
      ]
    })

    it('returns page data for the view', () => {
      const result = SelectPresenter.go(addresses)

      expect(result).to.equal({
        addresses: [
          {
            value: 'select',
            selected: true,
            text: `1 address found`
          },
          {
            text: 'address 1',
            value: '123456789'
          }
        ],
        pageTitle: 'Select the address',
        postcode: addresses[0].postcode
      })
    })
  })

  describe('when called with multiple addresses', () => {
    beforeEach(() => {
      addresses = [
        {
          address: 'address 1',
          postcode: 'SW1A 1AA',
          uprn: '123456789'
        },
        {
          address: 'address 2',
          postcode: 'SW1A 1AA',
          uprn: '123456780'
        }
      ]
    })

    it('returns page data for the view', () => {
      const result = SelectPresenter.go(addresses)

      expect(result).to.equal({
        addresses: [
          {
            value: 'select',
            selected: true,
            text: `2 addresses found`
          },
          {
            text: 'address 1',
            value: '123456789'
          },
          {
            text: 'address 2',
            value: '123456780'
          }
        ],
        pageTitle: 'Select the address',
        postcode: addresses[0].postcode
      })
    })
  })
})
