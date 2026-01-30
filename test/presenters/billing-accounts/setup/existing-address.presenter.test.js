'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')

// Thing under test
const ExistingAddressPresenter = require('../../../../app/presenters/billing-accounts/setup/existing-address.presenter.js')

describe('Billing Accounts - Setup - Existing Address Presenter', () => {
  const addresses = [
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: 'DEANERY ROAD',
        address4: 'BRISTOL',
        address5: 'BRISTOLSHIRE',
        address6: null,
        postcode: 'BS1 5AH'
      }
    }
  ]
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ExistingAddressPresenter.go(session, addresses)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: addresses[0].address.id,
            value: addresses[0].address.id,
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BRISTOLSHIRE, BS1 5AH',
            checked: false
          },
          { divider: 'or' },
          {
            id: 'new',
            value: 'new',
            text: 'Setup a new address',
            checked: false
          }
        ],
        pageTitle: `Select an existing address for ${session.billingAccount.company.name}`,
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
