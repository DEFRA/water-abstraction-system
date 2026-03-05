'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const CompanyAddressHelper = require('../../support/helpers/company-address.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchCompanyDetailsService = require('../../../app/services/companies/fetch-company-details.service.js')

describe('Companies - Fetch Company details service', () => {
  let earlierAddress
  let address
  let company
  let companyAddress
  let earlierCompanyAddress

  describe('when there is a company', () => {
    before(async () => {
      company = await CompanyHelper.add()

      address = await AddressHelper.add()

      companyAddress = await CompanyAddressHelper.add({
        addressId: address.id,
        companyId: company.id,
        licenceRoleId: LicenceRoleHelper.select('licenceHolder').id,
        startDate: new Date('2010-02-03')
      })

      // We add an earlier company address to ensure we are sorting by the start date
      earlierAddress = await AddressHelper.add()
      earlierCompanyAddress = await CompanyAddressHelper.add({
        addressId: earlierAddress.id,
        companyId: company.id,
        licenceRoleId: LicenceRoleHelper.select('licenceHolder').id,
        startDate: new Date('2000-01-01')
      })
    })

    after(async () => {
      await address.$query().delete()
      await company.$query().delete()
      await companyAddress.$query().delete()
      await earlierCompanyAddress.$query().delete()
    })

    it('returns the matching company', async () => {
      const result = await FetchCompanyDetailsService.go(company.id, 'licenceHolder')

      expect(result).to.equal({
        id: company.id,
        name: 'Example Trading Ltd',
        companyAddresses: [
          {
            address: {
              address1: 'ENVIRONMENT AGENCY',
              address2: 'HORIZON HOUSE',
              address3: 'DEANERY ROAD',
              address4: 'BRISTOL',
              address5: null,
              address6: null,
              country: 'United Kingdom',
              id: address.id,
              postcode: 'BS1 5AH'
            },
            id: companyAddress.id
          }
        ]
      })
    })

    describe('and the company address does not have a corresponding role', () => {
      it('returns the matching company with no company addresses', async () => {
        const result = await FetchCompanyDetailsService.go(company.id, 'billing')

        expect(result).to.equal({
          id: company.id,
          name: 'Example Trading Ltd',
          companyAddresses: []
        })
      })
    })
  })
})
