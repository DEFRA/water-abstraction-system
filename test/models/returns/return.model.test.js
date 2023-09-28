'use strict'

// Test helpers
const ReturnHelper = require('../../support/helpers/returns/return.helper.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')
const VersionModel = require('../../../app/models/returns/version.model.js')

// Thing under test
const ReturnModel = require('../../../app/models/returns/return.model.js')

describe('Return model', () => {
  let testRecord
  let testVersions

  beforeAll(async () => {
    testRecord = await ReturnHelper.add()
    testVersions = []

    const { returnId } = testRecord

    for (let i = 0; i < 2; i++) {
      const versionNumber = i
      const version = await VersionHelper.add({ returnId, versionNumber })
      testVersions.push(version)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnModel.query().findById(testRecord.returnId)

      expect(result).toBeInstanceOf(ReturnModel)
      expect(result.returnId).toEqual(testRecord.returnId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to version', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnModel.query()
          .innerJoinRelated('versions')

        expect(query).toBeTruthy()
      })

      it('can eager load the version', async () => {
        const result = await ReturnModel.query()
          .findById(testRecord.returnId)
          .withGraphFetched('versions')

        expect(result).toBeInstanceOf(ReturnModel)
        expect(result.returnId).toEqual(testRecord.returnId)

        expect(result.versions).toBeInstanceOf(Array)
        expect(result.versions[0]).toBeInstanceOf(VersionModel)
        expect(result.versions).toContainEqual(testVersions[0])
        expect(result.versions).toContainEqual(testVersions[1])
      })
    })
  })
})
