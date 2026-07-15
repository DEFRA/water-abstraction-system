// Test helpers
import BillHelper from '../support/helpers/bill.helper.js'
import BillLicenceHelper from '../support/helpers/bill-licence.helper.js'
import BillLicenceModel from '../../app/models/bill-licence.model.js'
import BillRunHelper from '../support/helpers/bill-run.helper.js'
import BillRunModel from '../../app/models/bill-run.model.js'
import BillingAccountHelper from '../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../app/models/billing-account.model.js'

// Thing under test
import BillModel from '../../app/models/bill.model.js'

describe('Bill model', () => {
  let testBillingAccount
  let testBillLicences
  let testBillRun
  let testRecord

  beforeAll(async () => {
    // Link bill runs
    testBillRun = await BillRunHelper.add()

    // Link billing accounts
    testBillingAccount = await BillingAccountHelper.add()

    // Test record
    testRecord = await BillHelper.add({ billingAccountId: testBillingAccount.id, billRunId: testBillRun.id })
    const { id } = testRecord

    // Link bill licences
    testBillLicences = []
    for (let i = 0; i < 2; i++) {
      const billLicence = await BillLicenceHelper.add({ billId: id })

      testBillLicences.push(billLicence)
    }
  })

  afterAll(async () => {
    await testBillRun.$query().delete()
    await testBillingAccount.$query().delete()

    for (const billLicence of testBillLicences) {
      await billLicence.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query().innerJoinRelated('billingAccount')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account', async () => {
        const result = await BillModel.query().findById(testRecord.id).withGraphFetched('billingAccount')

        expect(result).toBeInstanceOf(BillModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccount).toBeInstanceOf(BillingAccountModel)
        expect(result.billingAccount).toEqual(testBillingAccount)
      })
    })

    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query().innerJoinRelated('billRun')

        expect(query).toBeDefined()
      })

      it('can eager load the bill run', async () => {
        const result = await BillModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).toBeInstanceOf(BillModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })

    describe('when linking to bill licences', () => {
      it('can successfully run a related query', async () => {
        const query = await BillModel.query().innerJoinRelated('billLicences')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licences', async () => {
        const result = await BillModel.query().findById(testRecord.id).withGraphFetched('billLicences')

        expect(result).toBeInstanceOf(BillModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billLicences).toBeInstanceOf(Array)
        expect(result.billLicences[0]).toBeInstanceOf(BillLicenceModel)
        expect(result.billLicences).toContainEqual(testBillLicences[0])
        expect(result.billLicences).toContainEqual(testBillLicences[1])
      })
    })
  })
})
