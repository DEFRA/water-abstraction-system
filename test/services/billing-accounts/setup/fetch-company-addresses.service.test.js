'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const CompanyAddressHelper = require('../../../support/helpers/company-address.helper.js')

// Thing under test
const FetchCompanyAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-company-addresses.service.js')

describe('Billing Accounts - Setup - Fetch Existing Addresses service', () => {
  let address
  let company
  let companyAddress
  let companyAddressDuplicate
  let companyWithNoAddress

  before(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()
    companyWithNoAddress = await CompanyHelper.add()

    companyAddress = await CompanyAddressHelper.add({
      addressId: address.id,
      companyId: company.id
    })
    companyAddressDuplicate = await CompanyAddressHelper.add({
      addressId: address.id,
      companyId: company.id
    })
  })

  after(async () => {
    await address.$query().delete()
    await company.$query().delete()
    await companyAddress.$query().delete()
    await companyAddressDuplicate.$query().delete()
    await companyWithNoAddress.$query().delete()
  })

  describe('when a matching company exists and has an address', () => {
    it('returns the company name and matching addresses', async () => {
      const result = await FetchCompanyAddressesService.go(company.id)

      expect(result).to.equal({
        company: {
          id: company.id,
          name: company.name
        },
        addresses: [
          {
            id: address.id,
            address1: address.address1,
            address2: address.address2,
            address3: address.address3,
            address4: address.address4,
            address5: address.address5,
            address6: address.address6,
            postcode: address.postcode
          }
        ]
      })
    })
  })

  describe('when a matching company exists and has no address', () => {
    it('returns the company name and an empty addresses array', async () => {
      const result = await FetchCompanyAddressesService.go(companyWithNoAddress.id)

      expect(result).to.equal({
        company: {
          id: companyWithNoAddress.id,
          name: companyWithNoAddress.name
        },
        addresses: []
      })
    })
  })
})
