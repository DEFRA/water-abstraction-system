'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const AddressModel = require('../../app/models/address.model.js')
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const ContactHelper = require('../support/helpers/contact.helper.js')
const ContactModel = require('../../app/models/contact.model.js')

// Thing under test
const FetchBillingAccountService = require('../../app/services/fetch-billing-account.service.js')

describe('Fetch Billing Account service', () => {
  let linkedCompany
  let testBillingAccount

  beforeEach(async () => {
    linkedCompany = await CompanyHelper.add()

    testBillingAccount = await BillingAccountHelper.add({ companyId: linkedCompany.id })
  })

  describe('when a billing account with a matching ID exists', () => {
    describe('and that has multiple billing account addresses', () => {
      let linkedAddress

      beforeEach(async () => {
        const { id: billingAccountId } = testBillingAccount

        linkedAddress = await AddressHelper.add()
        const { id: addressId } = linkedAddress

        await Promise.all([
          BillingAccountAddressHelper.add({ billingAccountId, addressId, endDate: new Date('2023-09-18') }),
          BillingAccountAddressHelper.add({ billingAccountId, addressId, startDate: new Date('2023-09-19') })
        ])
      })

      it('only returns the current one', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.id)

        expect(result.id).to.equal(testBillingAccount.id)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        expect(result.billingAccountAddresses).to.have.length(1)
        expect(result.billingAccountAddresses[0].endDate).to.be.null()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceof(BillingAccountAddressModel)
      })

      // All account address records are linked to an address
      it('returns details for the linked address', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.id)

        expect(result.id).to.equal(testBillingAccount.id)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        const returnedAddress = result.billingAccountAddresses[0].address

        expect(returnedAddress.id).to.equal(linkedAddress.id)
        expect(returnedAddress).to.be.an.instanceof(AddressModel)
      })
    })

    // Agent company is optional in the account address record
    describe('and the current billing account address has an agent company', () => {
      let linkedAgentCompany

      beforeEach(async () => {
        const { id: billingAccountId } = testBillingAccount

        linkedAgentCompany = await CompanyHelper.add()

        await BillingAccountAddressHelper.add({ billingAccountId, companyId: linkedAgentCompany.id })
      })

      it('returns details for the linked agent company', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.id)

        expect(result.id).to.equal(testBillingAccount.id)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        const returnedAgentCompany = result.billingAccountAddresses[0].company

        expect(returnedAgentCompany.id).to.equal(linkedAgentCompany.id)
        expect(returnedAgentCompany).to.be.an.instanceof(CompanyModel)
      })
    })

    // Contact is optional in the account address record
    describe('and the current billing account address has a contact', () => {
      let linkedContact

      beforeEach(async () => {
        const { id: billingAccountId } = testBillingAccount

        linkedContact = await ContactHelper.add()

        await BillingAccountAddressHelper.add({ billingAccountId, contactId: linkedContact.id })
      })

      it('returns details for the linked contact', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.id)

        expect(result.id).to.equal(testBillingAccount.id)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        const returnedContact = result.billingAccountAddresses[0].contact

        expect(returnedContact.id).to.equal(linkedContact.id)
        expect(returnedContact).to.be.an.instanceof(ContactModel)
      })
    })

    // All billing account records have a linked company
    it('returns details for the linked company', async () => {
      const result = await FetchBillingAccountService.go(testBillingAccount.id)

      expect(result.id).to.equal(testBillingAccount.id)
      expect(result).to.be.an.instanceOf(BillingAccountModel)

      const returnedCompany = result.company

      expect(returnedCompany.id).to.equal(returnedCompany.id)
      expect(returnedCompany).to.be.an.instanceof(CompanyModel)
    })
  })

  describe('when a billing account with a matching ID does not exist', () => {
    it('returns no results', async () => {
      const result = await FetchBillingAccountService.go('87049159-eb97-4378-8e23-04ec2d1de41e')

      expect(result).to.be.undefined()
    })
  })
})
