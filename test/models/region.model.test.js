// Test helpers
import * as BillRunHelper from '../support/helpers/bill-run.helper.js'
import * as CompanyHelper from '../support/helpers/company.helper.js'
import * as LicenceHelper from '../support/helpers/licence.helper.js'
import * as RegionHelper from '../support/helpers/region.helper.js'
import BillRunModel from '../../app/models/bill-run.model.js'
import CompanyModel from '../../app/models/company.model.js'
import LicenceModel from '../../app/models/licence.model.js'

// Thing under test
import RegionModel from '../../app/models/region.model.js'

describe('Region model', () => {
  let testBillRuns
  let testCompanies
  let testLicences
  let testRecord

  beforeAll(async () => {
    testRecord = RegionHelper.select()

    testBillRuns = []
    testCompanies = []
    testLicences = []

    for (let i = 0; i < 2; i++) {
      // Create test bill runs
      const billRun = await BillRunHelper.add({ regionId: testRecord.id })

      testBillRuns.push(billRun)

      // Create test companies
      const company = await CompanyHelper.add({ regionId: testRecord.id })

      testCompanies.push(company)

      // Create test licences
      const licence = await LicenceHelper.add({
        licenceRef: LicenceHelper.generateLicenceRef(),
        regionId: testRecord.id
      })

      testLicences.push(licence)
    }
  })

  afterAll(async () => {
    for (const billRun of testBillRuns) {
      await billRun.$query().delete()
    }

    for (const company of testCompanies) {
      await company.$query().delete()
    }

    for (const licence of testLicences) {
      await licence.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RegionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(RegionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill runs', () => {
      it('can successfully run a related query', async () => {
        const query = await RegionModel.query().innerJoinRelated('billRuns')

        expect(query).toBeDefined()
      })

      it('can eager load the bill runs', async () => {
        const result = await RegionModel.query().findById(testRecord.id).withGraphFetched('billRuns')

        expect(result).toBeInstanceOf(RegionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRuns).toBeInstanceOf(Array)
        expect(result.billRuns[0]).toBeInstanceOf(BillRunModel)
        expect(result.billRuns).toContainEqual(testBillRuns[0])
        expect(result.billRuns).toContainEqual(testBillRuns[1])
      })
    })

    describe('when linking to companies', () => {
      it('can successfully run a related query', async () => {
        const query = await RegionModel.query().innerJoinRelated('companies')

        expect(query).toBeDefined()
      })

      it('can eager load the companies', async () => {
        const result = await RegionModel.query().findById(testRecord.id).withGraphFetched('companies')

        expect(result).toBeInstanceOf(RegionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companies).toBeInstanceOf(Array)
        expect(result.companies[0]).toBeInstanceOf(CompanyModel)
        expect(result.companies).toContainEqual(testCompanies[0])
        expect(result.companies).toContainEqual(testCompanies[1])
      })
    })

    describe('when linking to licences', () => {
      it('can successfully run a related query', async () => {
        const query = await RegionModel.query().innerJoinRelated('licences')

        expect(query).toBeDefined()
      })

      it('can eager load the licences', async () => {
        const result = await RegionModel.query().findById(testRecord.id).withGraphFetched('licences')

        expect(result).toBeInstanceOf(RegionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licences).toBeInstanceOf(Array)
        expect(result.licences[0]).toBeInstanceOf(LicenceModel)
        expect(result.licences).toContainEqual(testLicences[0])
        expect(result.licences).toContainEqual(testLicences[1])
      })
    })
  })
})
