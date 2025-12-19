'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchExistingAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-existing-addresses.service.js')

// Thing under test
const ViewSelectExistingAddressService = require('../../../../app/services/billing-accounts/setup/view-select-existing-address.service.js')

describe('Billing Accounts - Setup - Select Existing Address Service', () => {
  const addresses = _addresses()
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })

    Sinon.stub(FetchExistingAddressesService, 'go').returns(addresses)
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSelectExistingAddressService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/select-account`,
          text: 'Back'
        },
        items: [
          {
            id: addresses[0].address.id,
            value: addresses[0].address.id,
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BRISTOLSHIRE, BS1 5AH',
            checked: false
          },
          {
            id: addresses[1].address.id,
            value: addresses[1].address.id,
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BRISTOLSHIRE, BS1 5AH',
            checked: false
          },
          {
            id: addresses[2].address.id,
            value: addresses[2].address.id,
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BRISTOLSHIRE, BS1 5AH',
            checked: false
          },
          {
            id: addresses[3].address.id,
            value: addresses[3].address.id,
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BRISTOLSHIRE, BS1 5AH',
            checked: false
          },
          {
            id: addresses[4].address.id,
            value: addresses[4].address.id,
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BRISTOLSHIRE, BS1 5AH',
            checked: false
          },
          {
            id: addresses[5].address.id,
            value: addresses[5].address.id,
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

function _addresses() {
  return [
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
    },
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: 'DEANERY ROAD',
        address4: 'BRISTOL',
        address5: null,
        address6: 'BRISTOLSHIRE',
        postcode: 'BS1 5AH'
      }
    },
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: 'DEANERY ROAD',
        address4: null,
        address5: 'BRISTOL',
        address6: 'BRISTOLSHIRE',
        postcode: 'BS1 5AH'
      }
    },
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: null,
        address4: 'DEANERY ROAD',
        address5: 'BRISTOL',
        address6: 'BRISTOLSHIRE',
        postcode: 'BS1 5AH'
      }
    },
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: null,
        address3: 'HORIZON HOUSE',
        address4: 'DEANERY ROAD',
        address5: 'BRISTOL',
        address6: 'BRISTOLSHIRE',
        postcode: 'BS1 5AH'
      }
    },
    {
      address: {
        id: generateUUID(),
        address1: null,
        address2: 'ENVIRONMENT AGENCY',
        address3: 'HORIZON HOUSE',
        address4: 'DEANERY ROAD',
        address5: 'BRISTOL',
        address6: 'BRISTOLSHIRE',
        postcode: 'BS1 5AH'
      }
    }
  ]
}
