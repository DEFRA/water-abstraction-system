'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LineHelper = require('../../support/helpers/returns/line.helper.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')
const VersionModel = require('../../../app/models/returns/version.model.js')

// Thing under test
const LineModel = require('../../../app/models/returns/line.model.js')

describe('Line model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LineHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LineModel.query().findById(testRecord.lineId)

      expect(result).to.be.an.instanceOf(LineModel)
      expect(result.lineId).to.equal(testRecord.lineId)
    })
  })

  describe.only('Relationships', () => {
    describe('when linking to version', () => {
      let testVersion

      beforeEach(async () => {
        testVersion = await VersionHelper.add()
        testRecord = await LineHelper.add({ versionId: testVersion.versionId })
      })

      it('can successfully run a related query', async () => {
        const query = await LineModel.query()
          .innerJoinRelated('version')

        expect(query).to.exist()
      })

      it('can eager load the version', async () => {
        const result = await LineModel.query()
          .findById(testRecord.lineId)
          .withGraphFetched('version')

        console.log('Result :', result)
        expect(result).to.be.instanceOf(LineModel)
        expect(result.lineId).to.equal(testRecord.lineId)

        expect(result.version).to.be.an.instanceOf(VersionModel)
        expect(result.version).to.equal(testVersion)
      })
    })
  })
})
