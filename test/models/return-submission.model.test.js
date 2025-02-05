'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnSubmissionLineHelper = require('../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionLineModel = require('../../app/models/return-submission-line.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../support/helpers/return-submission.helper.js')

// Thing under test
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')

const { unitNames } = require('../../app/lib/static-lookups.lib.js')

describe('Return Submission model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnSubmissionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnSubmissionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnSubmissionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      let testReturnLog

      beforeEach(async () => {
        testReturnLog = await ReturnLogHelper.add()
        testRecord = await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionModel.query().innerJoinRelated('returnLog')

        expect(query).to.exist()
      })

      it('can eager load the return log', async () => {
        const result = await ReturnSubmissionModel.query().findById(testRecord.id).withGraphFetched('returnLog')

        expect(result).to.be.instanceOf(ReturnSubmissionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLog).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLog).to.equal(testReturnLog)
      })
    })

    describe('when linking to return submission lines', () => {
      let testLines

      beforeEach(async () => {
        testRecord = await ReturnSubmissionHelper.add()
        const { id: returnSubmissionId } = testRecord

        testLines = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the lines table means you cannot have 2 records with the same returnSubmissionId,
          // startDate and endDate
          const returnSubmissionLine = await ReturnSubmissionLineHelper.add({
            returnSubmissionId,
            startDate: new Date(2022, 11, 1 + i),
            endDate: new Date(2022, 11, 2 + i)
          })

          testLines.push(returnSubmissionLine)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionModel.query().innerJoinRelated('returnSubmissionLines')

        expect(query).to.exist()
      })

      it('can eager load the return submission lines', async () => {
        const result = await ReturnSubmissionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnSubmissionLines')

        expect(result).to.be.instanceOf(ReturnSubmissionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnSubmissionLines).to.be.an.array()
        expect(result.returnSubmissionLines[0]).to.be.an.instanceOf(ReturnSubmissionLineModel)
        expect(result.returnSubmissionLines).to.include(testLines[0])
        expect(result.returnSubmissionLines).to.include(testLines[1])
      })
    })
  })

  describe('$applyReadings', () => {
    beforeEach(() => {
      testRecord = ReturnSubmissionModel.fromJson({
        metadata: {
          meters: [
            {
              readings: {
                '2022-12-01_2022-12-02': 1,
                '2022-12-03_2022-12-04': 2
              }
            }
          ]
        },
        returnSubmissionLines: [
          { startDate: new Date('2022-12-01'), endDate: new Date('2022-12-02') },
          { startDate: new Date('2022-12-03'), endDate: new Date('2022-12-04') },
          { startDate: new Date('2022-12-05'), endDate: new Date('2022-12-06') }
        ]
      })
    })

    it('applies readings to the return submission lines', () => {
      testRecord.$applyReadings()

      expect(testRecord.returnSubmissionLines[0].reading).to.equal(1)
      expect(testRecord.returnSubmissionLines[1].reading).to.equal(2)
      expect(testRecord.returnSubmissionLines[2].reading).be.null()
    })
  })

  describe('$meter', () => {
    describe('when the return submission contains meters', () => {
      beforeEach(async () => {
        testRecord = ReturnSubmissionModel.fromJson({
          metadata: {
            meters: [{ serialNumber: 'METER_1' }, { serialNumber: 'METER_2' }]
          }
        })
      })

      it('returns the first meter', () => {
        const result = testRecord.$meter()

        expect(result).to.equal({ serialNumber: 'METER_1' })
      })
    })

    describe('when the return submission contains no meters', () => {
      beforeEach(async () => {
        testRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns null', () => {
        const result = testRecord.$meter()

        expect(result).to.be.null()
      })
    })
  })

  describe('$method', () => {
    describe('when the return submission contains the method', () => {
      beforeEach(async () => {
        testRecord = ReturnSubmissionModel.fromJson({ metadata: { method: 'METHOD' } })
      })

      it('returns the method', () => {
        const result = testRecord.$method()

        expect(result).to.equal('METHOD')
      })
    })

    describe('when the return submission contains no method', () => {
      beforeEach(async () => {
        testRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns the method as abstractionVolumes', () => {
        const result = testRecord.$method()

        expect(result).to.equal('abstractionVolumes')
      })
    })
  })

  describe('$units', () => {
    describe('when the return submission contains the unit', () => {
      beforeEach(async () => {
        testRecord = ReturnSubmissionModel.fromJson({ metadata: { units: 'UNITS' } })
      })

      it('returns the unit', () => {
        const result = testRecord.$units()

        expect(result).to.equal('UNITS')
      })
    })

    describe('when the return submission contains no unit', () => {
      beforeEach(async () => {
        testRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns the units as cubic metres', () => {
        const result = testRecord.$units()

        expect(result).to.equal(unitNames.CUBIC_METRES)
      })
    })
  })
})
