'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')

describe('Company model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await CompanyHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyModel.query().findById(testRecord.companyId)

      expect(result).to.be.an.instanceOf(CompanyModel)
      expect(result.companyId).to.equal(testRecord.companyId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      let testInvoiceAccountAddresses

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()
        const { companyId: agentCompanyId } = testRecord

        testInvoiceAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ agentCompanyId })
          testInvoiceAccountAddresses.push(invoiceAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.companyId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.companyId).to.equal(testRecord.companyId)

        expect(result.invoiceAccountAddresses).to.be.an.array()
        expect(result.invoiceAccountAddresses[0]).to.be.an.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[1])
      })
    })
  })
})
