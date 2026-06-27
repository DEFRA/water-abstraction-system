'use strict'

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceEndDateChangeHelper = require('../support/helpers/licence-end-date-change.helper.js')

// Thing under test
const LicenceEndDateChangeModel = require('../../app/models/licence-end-date-change.model.js')

describe('Licence End Date Change model', () => {
  let testLicence
  let testRecord

  beforeAll(async () => {
    // Link licence
    testLicence = await LicenceHelper.add()

    // Test record
    testRecord = await LicenceEndDateChangeHelper.add({ licenceId: testLicence.id })
  })

  afterAll(async () => {
    await testLicence.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEndDateChangeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceEndDateChangeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEndDateChangeModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceEndDateChangeModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceEndDateChangeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })
  })
})
