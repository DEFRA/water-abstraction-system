'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LineHelper = require('../../support/helpers/returns/line.helper.js')
const LineModel = require('../../../app/models/returns/line.model.js')
const ReturnHelper = require('../../support/helpers/returns/return.helper.js')
const ReturnModel = require('../../../app/models/returns/return.model.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')

// Thing under test
const VersionModel = require('../../../app/models/returns/version.model.js')

describe('Version model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await VersionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await VersionModel.query().findById(testRecord.versionId)

      expect(result).to.be.an.instanceOf(VersionModel)
      expect(result.versionId).to.equal(testRecord.versionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return', () => {
      let testReturn

      beforeEach(async () => {
        testReturn = await ReturnHelper.add()
        testRecord = await VersionHelper.add({ returnId: testReturn.returnId })
      })

      it('can successfully run a related query', async () => {
        const query = await VersionModel.query()
          .innerJoinRelated('return')

        expect(query).to.exist()
      })

      it('can eager load the return', async () => {
        const result = await VersionModel.query()
          .findById(testRecord.versionId)
          .withGraphFetched('return')

        expect(result).to.be.instanceOf(VersionModel)
        expect(result.versionId).to.equal(testRecord.versionId)

        expect(result.return).to.be.an.instanceOf(ReturnModel)
        expect(result.return).to.equal(testReturn)
      })
    })

    describe('when linking to lines', () => {
      let testLines

      beforeEach(async () => {
        testRecord = await VersionHelper.add()
        const { versionId } = testRecord

        testLines = []
        for (let i = 0; i < 2; i++) {
          const line = await LineHelper.add({ versionId })
          testLines.push(line)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await VersionModel.query()
          .innerJoinRelated('lines')

        expect(query).to.exist()
      })

      it('can eager load the lines', async () => {
        const result = await VersionModel.query()
          .findById(testRecord.versionId)
          .withGraphFetched('lines')

        expect(result).to.be.instanceOf(VersionModel)
        expect(result.versionId).to.equal(testRecord.versionId)

        expect(result.lines).to.be.an.array()
        expect(result.lines[0]).to.be.an.instanceOf(LineModel)
        expect(result.lines).to.include(testLines[0])
        expect(result.lines).to.include(testLines[1])
      })
    })
  })
})
