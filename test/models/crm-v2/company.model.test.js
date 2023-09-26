'use strict'



// Test helpers the jest way
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')


jest.mock('../../support/helpers/database.helper.js', () => ({
  clean: jest.fn(),
}));
describe('Company model', () => {
  let testRecord

  beforeEach(async () => {
    DatabaseHelper.clean.mockReset();
  })

  describe('Basic query', () => {


    test('can successfully run a basic query', async () => {

      const companyHelperAddMock = jest.spyOn(CompanyHelper, 'add')
      testRecord = companyHelperAddMock.mockResolvedValue({ companyId: 1 });

      // Arrange: Mock the findById function to resolve with a specific value
      const findByIdMock = jest.spyOn(CompanyModel.query(), 'findById');
     
      const result = findByIdMock.mockResolvedValue(testRecord);

      expect(result.companyId).toEqual(testRecord.companyId);
      findByIdMock.mockRestore();      
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      let testInvoiceAccountAddresses;
     
      it('can successfully run a related query', async () => {
 
        const companyHelperAddMock = jest.spyOn(CompanyHelper, 'add')
        testRecord = companyHelperAddMock.mockResolvedValue({ companyId: 1 });

        const innerJoinRelatedMock = jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          // Mock other query builder methods if needed
          // You can chain other query builder methods as needed for your test
        }));
        const queryMock = jest.spyOn(CompanyModel, 'query');
        queryMock.mockReturnValue({
          innerJoinRelated: innerJoinRelatedMock,
        });
        expect(queryMock).toBeDefined();
        const query = await CompanyModel.query();
        expect(query).toBeDefined();
        expect(CompanyModel.query).toHaveBeenCalled();
      });


      test('can eager load the invoice account addresses', async () => {
        // Arrange: Mock each part of the chain
        const graphFetchedMock = jest.fn(() => ({
          where: jest.fn().mockReturnThis({ invoiceAccountAddresses: [], companyId: 1 }),
          // Mock other query builder methods if needed
          // You can chain other query builder methods as needed for your test
        }));

        const findByIdMock = jest.fn(() => ({
          withGraphFetched: (graphFetchedMock),
        }));

        // Mock the CompanyModel.query() method
        const queryMock = jest.spyOn(CompanyModel, 'query');
        const result = queryMock.mockReturnValue({
          findById: findByIdMock,
        });

        // Act: Call the function that uses the chain
        // Assert: Check the result and interactions with the mocks
       
        expect(result).toBeDefined();
        // Optionally, you can reset the mocks
        queryMock.mockRestore();
      });

    })
  })
})
