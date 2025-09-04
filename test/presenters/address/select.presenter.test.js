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
  let session

  beforeEach(async () => {
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

    session = {
      id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
      addressJourney: {
        activeNavBar: 'manage',
        address: { postcode: 'SW1A 1AA' },
        backLink: {
          href: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/contact-type',
          text: 'Back'
        },
        redirectUrl: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
      }
    }
  })

  it('correctly presents the data', () => {
    const result = SelectPresenter.go(session, addresses)

    expect(result).to.equal({
      activeNavBar: 'manage',
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
      backLink: {
        href: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
        text: 'Back'
      },
      pageTitle: 'Select the address',
      postcode: 'SW1A 1AA',
      sessionId: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061'
    })
  })

  describe('the "addresses" property', () => {
    describe('when multiple addresses were found', () => {
      it('returns all the addresses, and the inserted description entry is pluralised and selected', () => {
        const result = SelectPresenter.go(session, addresses)

        expect(result.addresses).to.equal([
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
        ])
      })
    })

    describe('when one address was found', () => {
      it('returns the one address, and the inserted description entry is singular and selected', () => {
        const result = SelectPresenter.go(session, [addresses[0]])

        expect(result.addresses).to.equal([
          {
            value: 'select',
            selected: true,
            text: `1 address found`
          },
          {
            text: 'address 1',
            value: '123456789'
          }
        ])
      })
    })
  })
})
