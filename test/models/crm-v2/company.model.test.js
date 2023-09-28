'use strict'

// Test helpers
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')

describe('Company model', () => {
  let testInvoiceAccountAddresses
  let testRecord

  beforeAll(async () => {
    testRecord = await CompanyHelper.add()
    testInvoiceAccountAddresses = []

    const { companyId: agentCompanyId } = testRecord

    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
      // invoiceAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ startDate, agentCompanyId })
      testInvoiceAccountAddresses.push(invoiceAccountAddress)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyModel.query().findById(testRecord.companyId)

      expect(result).toBeInstanceOf(CompanyModel)
      expect(result.companyId).toBe(testRecord.companyId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).toBeTruthy()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.companyId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.companyId).toBe(testRecord.companyId)

        expect(result.invoiceAccountAddresses).toBeInstanceOf(Array)
        expect(result.invoiceAccountAddresses[0]).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[1])
      })
    })
  })
})
