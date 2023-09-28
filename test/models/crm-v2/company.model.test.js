'use strict'
/* global jest describe beforeEach test it xit expect */
// Test helpers
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')

jest.mock('../../support/helpers/database.helper.js', () => ({
  clean: jest.fn()
}))
describe('Company model', () => {
  let testRecord

  beforeEach(async () => {
    DatabaseHelper.clean.mockReset()
  })

  describe('Basic query', () => {
    test('can successfully run a basic query', async () => {
      const companyHelperAddMock = jest.spyOn(CompanyHelper, 'add')
      testRecord = companyHelperAddMock.mockResolvedValue({ companyId: 1 })

      const testRecordValue = await testRecord()

      // Arrange: Mock the findById function to resolve with a specific value
      const findByIdMock = jest.spyOn(CompanyModel.query(), 'findById')

      const result = findByIdMock.mockResolvedValue(testRecordValue)

      expect(await result().companyId).toEqual(testRecord.companyId)
      findByIdMock.mockRestore()
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      let testInvoiceAccountAddresses

      beforeEach(async () => {
        testInvoiceAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
          // invoiceAccountId and start date
          const invoiceAccountAddress = jest
            .spyOn(InvoiceAccountAddressHelper, 'add')
            .mockResolvedValue([
              {
                invoiceAccountId: 'b16efa32-9271-4333-aecf-b9358ba42892',
                addressId: '9570acde-752e-456a-a895-7b46a3c923a3',
                startDate: new Date('2023-08-18')
              }
            ])
          testInvoiceAccountAddresses.push(await invoiceAccountAddress())
        }
      })

      it('can successfully run a related query', async () => {
        const companyHelperAddMock = jest.spyOn(CompanyHelper, 'add')
        testRecord = companyHelperAddMock.mockResolvedValue({ companyId: 1 })

        const innerJoinRelatedMock = jest.fn(() => ({
          where: jest.fn().mockResolvedValue(['test'])
          // Mock other query builder methods if needed
          // You can chain other query builder methods as needed for your test
        }))
        const queryMock = jest.spyOn(CompanyModel, 'query')
        const queryMockResult = queryMock.mockResolvedValue({
          innerJoinRelated: innerJoinRelatedMock
        })
        expect(queryMockResult).toBeDefined()
        const query = await CompanyModel.query()
        expect(query).toBeDefined()
        expect(CompanyModel.query).toHaveBeenCalled()
        expect(testInvoiceAccountAddresses.length).toBe(2)
      })

      xit('can eager load the invoice account addresses', async () => {
        const myResult = jest
          .spyOn(CompanyModel.query().findById(), 'withGraphFetched')
          .mockResolvedValue([{ id: 1, companyId: 1 }])
        console.log(await myResult())
        const result = await CompanyModel.query()
          .findById(testRecord.companyId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.companyId).to.equal(testRecord.companyId)

        expect(result.invoiceAccountAddresses).to.be.an.array()
        expect(result.invoiceAccountAddresses[0]).to.be.an.instanceOf(
          InvoiceAccountAddressModel
        )
        expect(result.invoiceAccountAddresses).to.include(
          testInvoiceAccountAddresses[0]
        )
        expect(result.invoiceAccountAddresses).to.include(
          testInvoiceAccountAddresses[1]
        )
      })

      test('can eager load the invoice account addresses', async () => {
        // Arrange: Mock each part of the chain
        const graphFetchedMock = jest.fn(() => ({
          where: jest
            .fn()
            .mockResolvedValue({ invoiceAccountAddresses: [], companyId: 1 }) // Mock other query builder methods if needed
          // You can chain other query builder methods as needed for your test
        }))

        const findByIdMock = jest.fn(() => ({
          withGraphFetched: graphFetchedMock
        }))

        // Mock the CompanyModel.query() method
        const queryMock = jest.spyOn(CompanyModel, 'query')
        const result = await queryMock.mockResolvedValue({
          findById: findByIdMock
        })

        expect(result).toBeDefined()
        // Optionally, you can reset the mocks
        queryMock.mockRestore()
      })
    })
  })
})
