'use strict'

// Test helpers
const LineHelper = require('../../support/helpers/returns/line.helper.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')
const VersionModel = require('../../../app/models/returns/version.model.js')

// Thing under test
const LineModel = require('../../../app/models/returns/line.model.js')

describe('Line model', () => {
  let testRecord
  let testVersion

  beforeAll(async () => {
    testVersion = await VersionHelper.add()
    testRecord = await LineHelper.add({ versionId: testVersion.versionId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LineModel.query().findById(testRecord.lineId)

      expect(result).toBeInstanceOf(LineModel)
      expect(result.lineId).toEqual(testRecord.lineId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to version', () => {
      it('can successfully run a related query', async () => {
        const query = await LineModel.query()
          .innerJoinRelated('version')

        expect(query).toBeTruthy()
      })

      it('can eager load the version', async () => {
        const result = await LineModel.query()
          .findById(testRecord.lineId)
          .withGraphFetched('version')

        expect(result).toBeInstanceOf(LineModel)
        expect(result.lineId).toEqual(testRecord.lineId)

        expect(result.version).toBeInstanceOf(VersionModel)
        expect(result.version).toEqual(testVersion)
      })
    })
  })
})
