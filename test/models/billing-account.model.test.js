'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const BillHelper = require('../support/helpers/bill.helper.js')
const BillModel = require('../../app/models/bill.model.js')
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const ContactHelper = require('../support/helpers/contact.helper.js')

// Thing under test
const BillingAccountModel = require('../../app/models/billing-account.model.js')

describe('Billing Account model', () => {
  let testBillingAccountAddresses
  let testBills
  let testChargeVersions
  let testCompany
  let testRecord

  before(async () => {
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

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingAccountModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillingAccountModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to bills', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('bills')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await BillingAccountModel.query().findById(testRecord.id).withGraphFetched('bills')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.bills).to.be.an.array()
        expect(result.bills[0]).to.be.an.instanceOf(BillModel)
        expect(result.bills).to.include(testBills[0])
        expect(result.bills).to.include(testBills[1])
      })
    })

    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await BillingAccountModel.query().findById(testRecord.id).withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(testChargeVersions[0])
        expect(result.chargeVersions).to.include(testChargeVersions[1])
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query().innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await BillingAccountModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })
  })

  describe('Instance methods', () => {
    let testAddress
    let alternateBillingAccount
    let fetchedRecord

    before(async () => {
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

          expect(result).to.equal('Example Trading Ltd')
        })
      })

      describe("when the 'current' billing account address is linked to a company", () => {
        it('uses the name of the company linked to the billing account address', async () => {
          fetchedRecord = await BillingAccountModel.query()
            .findById(alternateBillingAccount.id)
            .modify('contactDetails')

          const result = fetchedRecord.$accountName()

          expect(result).to.equal('Acme Ltd (UK)')
        })
      })

      describe('when there are no billing account addresses (modifier not used but method called)', () => {
        describe("and not even the 'company' property has been set", () => {
          it('returns undefined', () => {
            const result = BillingAccountModel.fromJson(testRecord).$accountName()

            expect(result).to.be.undefined()
          })
        })

        describe("but the 'company' property has been set", () => {
          it('returns the company name', () => {
            const result = BillingAccountModel.fromJson({ ...testRecord, company: testCompany }).$accountName()

            expect(result).to.equal('Example Trading Ltd')
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

            expect(result).to.be.an.array()
            expect(result).to.be.empty()
          })
        })

        describe('and it is linked to an address', () => {
          it('returns an array of just the populated address lines', async () => {
            fetchedRecord = await BillingAccountModel.query()
              .findById(alternateBillingAccount.id)
              .modify('contactDetails')

            const result = fetchedRecord.$addressLines()

            expect(result).to.equal([
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

          expect(result).to.be.an.array()
          expect(result).to.be.empty()
        })
      })
    })

    describe('$contactName', () => {
      describe("when the 'current' billing account address is not linked to a contact", () => {
        it('returns null', async () => {
          fetchedRecord = await BillingAccountModel.query().findById(testRecord.id).modify('contactDetails')

          const result = fetchedRecord.$contactName()

          expect(result).to.be.null()
        })
      })

      describe("when the 'current' billing account address is linked to a contact", () => {
        it('returns the contact name', async () => {
          fetchedRecord = await BillingAccountModel.query()
            .findById(alternateBillingAccount.id)
            .modify('contactDetails')

          const result = fetchedRecord.$contactName()

          expect(result).to.equal('Bugs Bunny')
        })
      })

      describe('when there are no billing account addresses (modifier not used but method called)', () => {
        it('returns null', async () => {
          const result = BillingAccountModel.fromJson(testRecord).$contactName()

          expect(result).to.be.null()
        })
      })
    })
  })
})
