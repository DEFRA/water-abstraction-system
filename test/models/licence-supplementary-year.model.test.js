// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from '../support/helpers/bill-run.helper.js'
import BillRunModel from '../../app/models/bill-run.model.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import LicenceSupplementaryYearHelper from '../support/helpers/licence-supplementary-year.helper.js'

// Thing under test
import LicenceSupplementaryYearModel from '../../app/models/licence-supplementary-year.model.js'

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
