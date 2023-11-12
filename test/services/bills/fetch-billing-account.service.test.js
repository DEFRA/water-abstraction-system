'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const BillingAccountAddressHelper = require('../../support/helpers/crm-v2/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../../app/models/crm-v2/billing-account-address.model.js')
const BillingAccountHelper = require('../../support/helpers/crm-v2/billing-account.helper.js')
const BillingAccountModel = require('../../../app/models/crm-v2/billing-account.model.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactHelper = require('../../support/helpers/crm-v2/contact.helper.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const FetchBillingAccountService = require('../../../app/services/bills/fetch-billing-account.service.js')

describe('Fetch Billing Account service', () => {
  let linkedCompany
  let testBillingAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()

    linkedCompany = await CompanyHelper.add()

    testBillingAccount = await BillingAccountHelper.add({ companyId: linkedCompany.companyId })
  })

  describe('when a billing account with a matching ID exists', () => {
    describe('and that has multiple billing account addresses', () => {
      let linkedAddress

      beforeEach(async () => {
        const { invoiceAccountId } = testBillingAccount

        linkedAddress = await AddressHelper.add()
        const { addressId } = linkedAddress

        await Promise.all([
          BillingAccountAddressHelper.add({ invoiceAccountId, addressId, endDate: new Date('2023-09-18') }),
          BillingAccountAddressHelper.add({ invoiceAccountId, addressId, startDate: new Date('2023-09-19') })
        ])
      })

      it('only returns the current one', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.invoiceAccountId)

        expect(result.invoiceAccountId).to.equal(testBillingAccount.invoiceAccountId)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        expect(result.billingAccountAddresses).to.have.length(1)
        expect(result.billingAccountAddresses[0].endDate).to.be.null()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceof(BillingAccountAddressModel)
      })

      // All account address records are linked to an address
      it('returns details for the linked address', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.invoiceAccountId)

        expect(result.invoiceAccountId).to.equal(testBillingAccount.invoiceAccountId)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        const returnedAddress = result.billingAccountAddresses[0].address

        expect(returnedAddress.addressId).to.equal(linkedAddress.addressId)
        expect(returnedAddress).to.be.an.instanceof(AddressModel)
      })
    })

    // Agent company is optional in the account address record
    describe('and the current billing account address has an agent company', () => {
      let linkedAgentCompany

      beforeEach(async () => {
        const { invoiceAccountId } = testBillingAccount
        linkedAgentCompany = await CompanyHelper.add()

        await BillingAccountAddressHelper.add({ invoiceAccountId, agentCompanyId: linkedAgentCompany.companyId })
      })

      it('returns details for the linked agent company', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.invoiceAccountId)

        expect(result.invoiceAccountId).to.equal(testBillingAccount.invoiceAccountId)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        const returnedAgentCompany = result.billingAccountAddresses[0].agentCompany

        expect(returnedAgentCompany.companyId).to.equal(linkedAgentCompany.companyId)
        expect(returnedAgentCompany).to.be.an.instanceof(CompanyModel)
      })
    })

    // Contact is optional in the account address record
    describe('and the current billing account address has a contact', () => {
      let linkedContact

      beforeEach(async () => {
        const { invoiceAccountId } = testBillingAccount
        linkedContact = await ContactHelper.add()

        await BillingAccountAddressHelper.add({ invoiceAccountId, contactId: linkedContact.contactId })
      })

      it('returns details for the linked contact', async () => {
        const result = await FetchBillingAccountService.go(testBillingAccount.invoiceAccountId)

        expect(result.invoiceAccountId).to.equal(testBillingAccount.invoiceAccountId)
        expect(result).to.be.an.instanceOf(BillingAccountModel)

        const returnedContact = result.billingAccountAddresses[0].contact

        expect(returnedContact.contactId).to.equal(linkedContact.contactId)
        expect(returnedContact).to.be.an.instanceof(ContactModel)
      })
    })

    // All billing account records have a linked company
    it('returns details for the linked company', async () => {
      const result = await FetchBillingAccountService.go(testBillingAccount.invoiceAccountId)

      expect(result.invoiceAccountId).to.equal(testBillingAccount.invoiceAccountId)
      expect(result).to.be.an.instanceOf(BillingAccountModel)

      const returnedCompany = result.company

      expect(returnedCompany.contactId).to.equal(returnedCompany.companyId)
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
