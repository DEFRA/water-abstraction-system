'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const ReturnHelper = require('../../support/helpers/returns/return.helper.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')
const VersionModel = require('../../../app/models/returns/version.model.js')

// Thing under test
const ReturnModel = require('../../../app/models/returns/return.model.js')

describe('Return model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ReturnHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnModel.query().findById(testRecord.returnId)

      expect(result).to.be.an.instanceOf(ReturnModel)
      expect(result.returnId).to.equal(testRecord.returnId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to version', () => {
      let testVersions

      beforeEach(async () => {
        const { returnId } = testRecord

        testVersions = []
        for (let i = 0; i < 2; i++) {
          const versionNumber = i
          const version = await VersionHelper.add({ returnId, versionNumber })
          testVersions.push(version)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnModel.query()
          .innerJoinRelated('versions')

        expect(query).to.exist()
      })

      it('can eager load the version', async () => {
        const result = await ReturnModel.query()
          .findById(testRecord.returnId)
          .withGraphFetched('versions')

        expect(result).to.be.instanceOf(ReturnModel)
        expect(result.returnId).to.equal(testRecord.returnId)

        expect(result.versions).to.be.an.array()
        expect(result.versions[0]).to.be.an.instanceOf(VersionModel)
        expect(result.versions).to.include(testVersions[0])
        expect(result.versions).to.include(testVersions[1])
      })
    })
  })
})
