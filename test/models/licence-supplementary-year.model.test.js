'use strict'

// Test helpers
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceSupplementaryYearHelper = require('../support/helpers/licence-supplementary-year.helper.js')

// Thing under test
const LicenceSupplementaryYearModel = require('../../app/models/licence-supplementary-year.model.js')

describe('Licence Supplementary Year model', () => {
  let testBillRun
  let testLicence
  let testRecord

  beforeAll(async () => {
    testBillRun = await BillRunHelper.add()
    testLicence = await LicenceHelper.add()

    testRecord = await LicenceSupplementaryYearHelper.add({ billRunId: testBillRun.id, licenceId: testLicence.id })
  })

  afterAll(async () => {
    await testBillRun.$query().delete()
    await testLicence.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceSupplementaryYearModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceSupplementaryYearModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceSupplementaryYearModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceSupplementaryYearModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceSupplementaryYearModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to a bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceSupplementaryYearModel.query().innerJoinRelated('billRun')

        expect(query).toBeDefined()
      })

      it('can eager load the bill run', async () => {
        const result = await LicenceSupplementaryYearModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).toBeInstanceOf(LicenceSupplementaryYearModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })
  })
})
