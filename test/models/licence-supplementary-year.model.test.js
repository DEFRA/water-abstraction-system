'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceSupplementaryYearHelper = require('../support/helpers/licence-supplementary-year.helper.js')

// Thing under test
const LicenceSupplementaryYearModel = require('../../app/models/licence-supplementary-year.model.js')

describe('Licence Supplementary Year model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceSupplementaryYearHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceSupplementaryYearModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceSupplementaryYearModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        testRecord = await LicenceSupplementaryYearHelper.add({ licenceId: testLicence.id })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceSupplementaryYearModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceSupplementaryYearModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceSupplementaryYearModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to a bill run', () => {
      let testBillRun

      beforeEach(async () => {
        testBillRun = await BillRunHelper.add()

        testRecord = await LicenceSupplementaryYearHelper.add({ billRunId: testBillRun.id })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceSupplementaryYearModel.query().innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await LicenceSupplementaryYearModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).to.be.instanceOf(LicenceSupplementaryYearModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRun).to.be.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })
  })
})
