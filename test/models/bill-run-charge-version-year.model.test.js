'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const BillRunChargeVersionYearHelper = require('../support/helpers/bill-run-charge-version-year.helper.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')

// Thing under test
const BillRunChargeVersionYearModel = require('../../app/models/bill-run-charge-version-year.model.js')

describe('Bill Run Charge Version Year model', () => {
  let testBillRun
  let testChargeVersion
  let testRecord

  before(async () => {
    // Link to a bill run
    testBillRun = await BillRunHelper.add()
    const { id: billRunId } = testBillRun

    // Link to a charge version
    testChargeVersion = await ChargeVersionHelper.add()
    const { id: chargeVersionId } = testChargeVersion

    // Test record
    testRecord = await BillRunChargeVersionYearHelper.add({ billRunId, chargeVersionId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunChargeVersionYearModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillRunChargeVersionYearModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunChargeVersionYearModel.query().innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await BillRunChargeVersionYearModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).to.be.instanceOf(BillRunChargeVersionYearModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRun).to.be.an.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunChargeVersionYearModel.query().innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await BillRunChargeVersionYearModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(BillRunChargeVersionYearModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersion).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })
  })
})
