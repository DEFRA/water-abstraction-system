// Test helpers
import * as AddressHelper from '../support/helpers/address.helper.js'
import * as BillHelper from '../support/helpers/bill.helper.js'
import BillModel from '../../app/models/bill.model.js'
import * as BillingAccountAddressHelper from '../support/helpers/billing-account-address.helper.js'
import BillingAccountAddressModel from '../../app/models/billing-account-address.model.js'
import * as BillingAccountHelper from '../support/helpers/billing-account.helper.js'
import * as ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import ChargeVersionModel from '../../app/models/charge-version.model.js'
import * as CompanyHelper from '../support/helpers/company.helper.js'
import CompanyModel from '../../app/models/company.model.js'
import * as ContactHelper from '../support/helpers/contact.helper.js'

// Thing under test
import BillingAccountModel from '../../app/models/billing-account.model.js'

describe('Billing Account model', () => {
  let testBillingAccountAddresses
  let testBills
  let testChargeVersions
  let testCompany
  let testRecord

  beforeAll(async () => {
    testCompany = await CompanyHelper.add()

    testRecord = await BillingAccountHelper.add({ companyId: testCompany.id })

    testBillingAccountAddresses = []
    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 1) : new Date(2023, 9, 1)
      const endDate = i === 0 ? new Date(2023, 8, 31) : null
      const billingAccountAddress = await BillingAccountAddressHelper.add({
        billingAccountId: testRecord.id,
        endDate,
        startDate
      })

      testBillingAccountAddresses.push(billingAccountAddress)
    }

    testBills = []
    for (let i = 0; i < 2; i++) {
      const bill = await BillHelper.add({ billingAccountId: testRecord.id })

      testBills.push(bill)
    }

    testChargeVersions = []
    for (let i = 0; i < 2; i++) {
      const chargeVersion = await ChargeVersionHelper.add({ billingAccountId: testRecord.id })

      testChargeVersions.push(chargeVersion)
    }
  })

  afterAll(async () => {
    await testCompany.$query().delete()

    for (const billingAccountAddress of testBillingAccountAddresses) {
      await billingAccountAddress.$query().delete()
    }

    for (const bill of testBills) {
      await bill.$query().delete()
    }

    for (const chargeVersion of testChargeVersions) {
      await chargeVersion.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingAccountModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillingAccountModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccountAddresses')

        expect(result).toBeInstanceOf(BillingAccountModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccountAddresses).toBeInstanceOf(Array)
        expect(result.billingAccountAddresses[0]).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).toContainEqual(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).toContainEqual(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to bills', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('bills')

        expect(query).toBeDefined()
      })

      it('can eager load the bills', async () => {
        const result = await BillingAccountModel.query().findById(testRecord.id).withGraphFetched('bills')

        expect(result).toBeInstanceOf(BillingAccountModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.bills).toBeInstanceOf(Array)
        expect(result.bills[0]).toBeInstanceOf(BillModel)
        expect(result.bills).toContainEqual(testBills[0])
        expect(result.bills).toContainEqual(testBills[1])
      })
    })

    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('chargeVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the charge versions', async () => {
        const result = await BillingAccountModel.query().findById(testRecord.id).withGraphFetched('chargeVersions')

        expect(result).toBeInstanceOf(BillingAccountModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersions).toBeInstanceOf(Array)
        expect(result.chargeVersions[0]).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersions).toContainEqual(testChargeVersions[0])
        expect(result.chargeVersions).toContainEqual(testChargeVersions[1])
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('company')

        expect(query).toBeDefined()
      })

      it('can eager load the company', async () => {
        const result = await BillingAccountModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).toBeInstanceOf(BillingAccountModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })
  })

  describe('Instance methods', () => {
    let testAddress
    let alternateBillingAccount
    let fetchedRecord

    beforeAll(async () => {
      // Link the alternate billing account we'll use in instance method testing to the same company as the test record.
      // We'll link the 'current' billing account address to a different company to prove it takes precedence
      alternateBillingAccount = await BillingAccountHelper.add({ companyId: testCompany.id })

      // Add the first billing account address record which should be ignored as it is no longer 'current'
      await BillingAccountAddressHelper.add({
        billingAccountId: alternateBillingAccount.id,
        endDate: new Date('2024-05-31'),
        startDate: new Date('2024-04-01')
      })

      // Add the second billing account address record, which will be linked to a contact and different company to the
      // main billing account record. It will also have an address
      testAddress = await AddressHelper.add()
      const contact = await ContactHelper.add({ firstName: 'Bugs', lastName: 'Bunny' })
      const alternateCompany = await CompanyHelper.add({ name: 'Acme Ltd (UK)' })

      // Add two billing account address records so we can ensure the 'current' logic in the modifier is being exercised
      await BillingAccountAddressHelper.add({
        addressId: testAddress.id,
        billingAccountId: alternateBillingAccount.id,
        companyId: alternateCompany.id,
        contactId: contact.id,
        startDate: new Date('2024-06-01')
      })
    })

    describe('$accountName', () => {
      describe("when the 'current' billing account address is not linked to a company", () => {
        it('uses the name of the company linked directly to the billing account', async () => {
          fetchedRecord = await BillingAccountModel.query().findById(testRecord.id).modify('contactDetails')

          const result = fetchedRecord.$accountName()

          expect(result).toEqual('Example Trading Ltd')
        })
      })

      describe("when the 'current' billing account address is linked to a company", () => {
        it('uses the name of the company linked to the billing account address', async () => {
          fetchedRecord = await BillingAccountModel.query()
            .findById(alternateBillingAccount.id)
            .modify('contactDetails')

          const result = fetchedRecord.$accountName()

          expect(result).toEqual('Acme Ltd (UK)')
        })
      })

      describe('when there are no billing account addresses (modifier not used but method called)', () => {
        describe("and not even the 'company' property has been set", () => {
          it('returns undefined', () => {
            const result = BillingAccountModel.fromJson(testRecord).$accountName()

            expect(result).toBeUndefined()
          })
        })

        describe("but the 'company' property has been set", () => {
          it('returns the company name', () => {
            const result = BillingAccountModel.fromJson({ ...testRecord, company: testCompany }).$accountName()

            expect(result).toEqual('Example Trading Ltd')
          })
        })
      })
    })

    describe('$addressLines', () => {
      describe("when their is a 'current' billing account address", () => {
        describe('but it is not linked to an address', () => {
          it('returns an empty array', async () => {
            fetchedRecord = await BillingAccountModel.query().findById(testRecord.id).modify('contactDetails')

            const result = fetchedRecord.$addressLines()

            expect(result).toBeInstanceOf(Array)
            expect(result).toHaveLength(0)
          })
        })

        describe('and it is linked to an address', () => {
          it('returns an array of just the populated address lines', async () => {
            fetchedRecord = await BillingAccountModel.query()
              .findById(alternateBillingAccount.id)
              .modify('contactDetails')

            const result = fetchedRecord.$addressLines()

            expect(result).toEqual([
              'ENVIRONMENT AGENCY',
              'HORIZON HOUSE',
              'DEANERY ROAD',
              'BRISTOL',
              'BS1 5AH',
              'United Kingdom'
            ])
          })
        })
      })

      describe('when there are no billing account addresses (modifier not used but method called)', () => {
        it('returns an empty array', () => {
          const result = BillingAccountModel.fromJson(testRecord).$addressLines()

          expect(result).toBeInstanceOf(Array)
          expect(result).toHaveLength(0)
        })
      })
    })

    describe('$companyName', () => {
      describe("when the 'current' billing account address is not linked to a company", () => {
        it('returns the company name', async () => {
          fetchedRecord = await BillingAccountModel.query().findById(testRecord.id).modify('contactDetails')

          const result = fetchedRecord.$companyName()

          expect(result).toEqual('Example Trading Ltd')
        })
      })

      describe("when the 'current' billing account address is linked to a company", () => {
        it('returns the company name', async () => {
          fetchedRecord = await BillingAccountModel.query()
            .findById(alternateBillingAccount.id)
            .modify('contactDetails')

          const result = fetchedRecord.$companyName()

          expect(result).toEqual('Acme Ltd (UK)')
        })
      })
    })

    describe('$contactName', () => {
      describe("when the 'current' billing account address is not linked to a contact", () => {
        it('returns null', async () => {
          fetchedRecord = await BillingAccountModel.query().findById(testRecord.id).modify('contactDetails')

          const result = fetchedRecord.$contactName()

          expect(result).toBeNull()
        })
      })

      describe("when the 'current' billing account address is linked to a contact", () => {
        it('returns the contact name', async () => {
          fetchedRecord = await BillingAccountModel.query()
            .findById(alternateBillingAccount.id)
            .modify('contactDetails')

          const result = fetchedRecord.$contactName()

          expect(result).toEqual('Bugs Bunny')
        })
      })

      describe('when there are no billing account addresses (modifier not used but method called)', () => {
        it('returns null', async () => {
          const result = BillingAccountModel.fromJson(testRecord).$contactName()

          expect(result).toBeNull()
        })
      })
    })

    describe('$displayAddress', () => {
      it('returns the display address', async () => {
        fetchedRecord = await BillingAccountModel.query().findById(alternateBillingAccount.id).modify('contactDetails')

        const result = fetchedRecord.$displayAddress()

        expect(result).toEqual([
          'Acme Ltd (UK)',
          'Bugs Bunny',
          'ENVIRONMENT AGENCY',
          'HORIZON HOUSE',
          'DEANERY ROAD',
          'BRISTOL',
          'BS1 5AH',
          'United Kingdom'
        ])
      })
    })
  })
})
