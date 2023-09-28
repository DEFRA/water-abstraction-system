'use strict'

// Test helpers
const LineHelper = require('../../support/helpers/returns/line.helper.js')
const LineModel = require('../../../app/models/returns/line.model.js')
const ReturnHelper = require('../../support/helpers/returns/return.helper.js')
const ReturnModel = require('../../../app/models/returns/return.model.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')

// Thing under test
const VersionModel = require('../../../app/models/returns/version.model.js')

describe('Version model', () => {
  let testLines
  let testRecord
  let testReturn

  beforeAll(async () => {
    testReturn = await ReturnHelper.add()
    testRecord = await VersionHelper.add({ returnId: testReturn.returnId })
    testLines = []

    const { versionId } = testRecord

    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the lines table means you cannot have 2 records with the same versionId, substance,
      // startDate and endDate
      const substance = i === 0 ? 'water' : 'dirt'
      const line = await LineHelper.add({ versionId, substance })
      testLines.push(line)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await VersionModel.query().findById(testRecord.versionId)

      expect(result).toBeInstanceOf(VersionModel)
      expect(result.versionId).toEqual(testRecord.versionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return', () => {
      it('can successfully run a related query', async () => {
        const query = await VersionModel.query()
          .innerJoinRelated('return')

        expect(query).toBeTruthy()
      })

      it('can eager load the return', async () => {
        const result = await VersionModel.query()
          .findById(testRecord.versionId)
          .withGraphFetched('return')

        expect(result).toBeInstanceOf(VersionModel)
        expect(result.versionId).toEqual(testRecord.versionId)

        expect(result.return).toBeInstanceOf(ReturnModel)
        expect(result.return).toEqual(testReturn)
      })
    })

    describe('when linking to lines', () => {
      it('can successfully run a related query', async () => {
        const query = await VersionModel.query()
          .innerJoinRelated('lines')

        expect(query).toBeTruthy()
      })

      it('can eager load the lines', async () => {
        const result = await VersionModel.query()
          .findById(testRecord.versionId)
          .withGraphFetched('lines')

        expect(result).toBeInstanceOf(VersionModel)
        expect(result.versionId).toEqual(testRecord.versionId)

        expect(result.lines).toBeInstanceOf(Array)
        expect(result.lines[0]).toBeInstanceOf(LineModel)
        expect(result.lines).toContainEqual(testLines[0])
        expect(result.lines).toContainEqual(testLines[1])
      })
    })
  })
})
