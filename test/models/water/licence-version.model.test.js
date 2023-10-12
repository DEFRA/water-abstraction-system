'use strict'

// Test helpers
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const LicenceVersionHelper = require('../../support/helpers/water/licence-version.helper.js')

// Thing under test
const LicenceVersionModel = require('../../../app/models/water/licence-version.model.js')

describe('Licence Version model', () => {
  let testLicence
  let testRecord

  beforeAll(async () => {
    testLicence = await LicenceHelper.add()

    const { licenceId } = testLicence
    testRecord = await LicenceVersionHelper.add({ licenceId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionModel.query().findById(testRecord.licenceVersionId)

      expect(result).toBeInstanceOf(LicenceVersionModel)
      expect(result.licenceVersionId).toBe(testRecord.licenceVersionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.licenceVersionId)
          .withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceVersionModel)
        expect(result.licenceVersionId).toBe(testRecord.licenceVersionId)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })
  })
})
