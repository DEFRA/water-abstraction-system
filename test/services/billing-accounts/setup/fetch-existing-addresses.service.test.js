'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const CompanyHelper = require('../../../support/helpers/company-address.helper.js')
const CompanyAddressHelper = require('../../../support/helpers/company-address.helper.js')

// Thing under test
const FetchExistingAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-existing-addresses.service.js')

describe('Billing Accounts - Setup - Fetch Existing Addresses service', () => {
  let address
  let company

  describe('when a matching company exists', () => {
    beforeEach(async () => {
      address = await AddressHelper.add()
      company = await CompanyHelper.add()

      await CompanyAddressHelper.add({
        addressId: address.id,
        companyId: company.id
      })
    })

    it('returns the matching addresses', async () => {
      const result = await FetchExistingAddressesService.go(company.id)

      expect(result).to.equal(
        [
          {
            address: {
              id: address.id,
              address1: address.address1,
              address2: address.address2,
              address3: address.address3,
              address4: address.address4,
              address5: address.address5,
              address6: address.address6,
              postcode: address.postcode
            },
            addressId: address.id,
            companyId: company.id,
            default: false,
            endDate: null,
            startDate: new Date('2022-04-01')
          }
        ],
        { skip: ['createdAt', 'id', 'licenceRoleId', 'updatedAt'] }
      )
    })
  })
})
