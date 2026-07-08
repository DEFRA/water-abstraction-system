// Test helpers
import * as AddressHelper from '../support/helpers/address.helper.js'
import AddressModel from '../../app/models/address.model.js'
import * as BillingAccountAddressHelper from '../support/helpers/billing-account-address.helper.js'
import * as BillingAccountHelper from '../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../app/models/billing-account.model.js'
import * as CompanyHelper from '../support/helpers/company.helper.js'
import CompanyModel from '../../app/models/company.model.js'
import * as ContactHelper from '../support/helpers/contact.helper.js'
import ContactModel from '../../app/models/contact.model.js'

// Thing under test
import BillingAccountAddressModel from '../../app/models/billing-account-address.model.js'

describe('Billing Account Address model', () => {
  let testAddress
  let testBillingAccount
  let testContact
  let testCompany
  let testRecord

  beforeAll(async () => {
    // Link contact
    testContact = await ContactHelper.add()

    // Link billing account
    testBillingAccount = await BillingAccountHelper.add()

    // Link company
    testCompany = await CompanyHelper.add()

    // Link address
    testAddress = await AddressHelper.add()

    // Test record
    testRecord = await BillingAccountAddressHelper.add({
      addressId: testAddress.id,
      companyId: testCompany.id,
      billingAccountId: testBillingAccount.id,
      contactId: testContact.id
    })
  })

  afterAll(async () => {
    await testContact.$query().delete()
    await testBillingAccount.$query().delete()
    await testCompany.$query().delete()
    await testAddress.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingAccountAddressModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillingAccountAddressModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query().innerJoinRelated('address')

        expect(query).toBeDefined()
      })

      it('can eager load the address', async () => {
        const result = await BillingAccountAddressModel.query().findById(testRecord.id).withGraphFetched('address')

        expect(result).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.address).toBeInstanceOf(AddressModel)
        expect(result.address).toEqual(testAddress)
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query().innerJoinRelated('company')

        expect(query).toBeDefined()
      })

      it('can eager load the company', async () => {
        const result = await BillingAccountAddressModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })

    describe('when linking to billing account', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query().innerJoinRelated('billingAccount')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccount')

        expect(result).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccount).toBeInstanceOf(BillingAccountModel)
        expect(result.billingAccount).toEqual(testBillingAccount)
      })
    })

    describe('when linking to contact', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query().innerJoinRelated('contact')

        expect(query).toBeDefined()
      })

      it('can eager load the contact', async () => {
        const result = await BillingAccountAddressModel.query().findById(testRecord.id).withGraphFetched('contact')

        expect(result).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.contact).toBeInstanceOf(ContactModel)
        expect(result.contact).toEqual(testContact)
      })
    })
  })
})
