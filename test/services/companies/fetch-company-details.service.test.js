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
const { tomorrow, yesterday } = require('../../support/general.js')

// Thing under test
const FetchCompanyDetailsService = require('../../../app/services/companies/fetch-company-details.service.js')

describe('Companies - Fetch Company details service', () => {
  let addressDifferentRole
  let addressEndDateInPast
  let addressEndDateInFuture
  let addressNoEndDate
  let company
  let companyAddressDifferentRole
  let companyAddressEndDateInFuture
  let companyAddressEndDateInPast
  let companyAddressNoEndDate

  before(async () => {
    const licenceRoleId = LicenceRoleHelper.select('licenceHolder').id

    company = await CompanyHelper.add()

    addressNoEndDate = await AddressHelper.add({ address1: 'No end date' })
    companyAddressNoEndDate = await CompanyAddressHelper.add({
      addressId: addressNoEndDate.id,
      companyId: company.id,
      licenceRoleId,
      startDate: new Date('2022-04-01')
    })

    addressEndDateInFuture = await AddressHelper.add({ address1: 'End date in the future' })
    companyAddressEndDateInFuture = await CompanyAddressHelper.add({
      addressId: addressEndDateInFuture.id,
      companyId: company.id,
      endDate: tomorrow(),
      licenceRoleId,
      startDate: new Date('2021-04-01')
    })

    addressEndDateInPast = await AddressHelper.add({ address1: 'End date in the past' })
    companyAddressEndDateInPast = await CompanyAddressHelper.add({
      addressId: addressEndDateInPast.id,
      companyId: company.id,
      endDate: yesterday(),
      licenceRoleId,
      startDate: new Date('2021-06-01')
    })

    addressDifferentRole = await AddressHelper.add({ address1: 'No end date' })
    companyAddressDifferentRole = await CompanyAddressHelper.add({
      addressId: addressDifferentRole.id,
      companyId: company.id,
      licenceRoleId: LicenceRoleHelper.select('returnsTo').id,
      startDate: new Date('2022-04-01')
    })
  })

  after(async () => {
    await addressDifferentRole.$query().delete()
    await companyAddressDifferentRole.$query().delete()

    await addressEndDateInPast.$query().delete()
    await companyAddressEndDateInPast.$query().delete()

    await addressEndDateInFuture.$query().delete()
    await companyAddressEndDateInFuture.$query().delete()

    await addressNoEndDate.$query().delete()
    await companyAddressNoEndDate.$query().delete()

    await company.$query().delete()
  })

  describe('when there is a company', () => {
    it("returns the matching company's details and _all_ addresses for the specified role", async () => {
      const result = await FetchCompanyDetailsService.go(company.id, 'licenceHolder')

      expect(result).to.equal({
        id: company.id,
        name: 'Example Trading Ltd',
        companyAddresses: [
          {
            address: {
              address1: addressNoEndDate.address1,
              address2: 'HORIZON HOUSE',
              address3: 'DEANERY ROAD',
              address4: 'BRISTOL',
              address5: null,
              address6: null,
              country: 'United Kingdom',
              id: addressNoEndDate.id,
              postcode: 'BS1 5AH'
            },
            endDate: companyAddressNoEndDate.endDate,
            id: companyAddressNoEndDate.id,
            startDate: companyAddressNoEndDate.startDate
          },
          {
            address: {
              address1: addressEndDateInFuture.address1,
              address2: 'HORIZON HOUSE',
              address3: 'DEANERY ROAD',
              address4: 'BRISTOL',
              address5: null,
              address6: null,
              country: 'United Kingdom',
              id: addressEndDateInFuture.id,
              postcode: 'BS1 5AH'
            },
            endDate: companyAddressEndDateInFuture.endDate,
            id: companyAddressEndDateInFuture.id,
            startDate: companyAddressEndDateInFuture.startDate
          },
          {
            address: {
              address1: addressEndDateInPast.address1,
              address2: 'HORIZON HOUSE',
              address3: 'DEANERY ROAD',
              address4: 'BRISTOL',
              address5: null,
              address6: null,
              country: 'United Kingdom',
              id: addressEndDateInPast.id,
              postcode: 'BS1 5AH'
            },
            endDate: companyAddressEndDateInPast.endDate,
            id: companyAddressEndDateInPast.id,
            startDate: companyAddressEndDateInPast.startDate
          }
        ]
      })
    })

    describe('and the company does not have any addresses for the specified role', () => {
      it("returns the matching company's details and no addresses", async () => {
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
