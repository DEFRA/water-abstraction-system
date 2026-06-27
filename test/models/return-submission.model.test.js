'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
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
  let testReturnLog
  let testReturnSubmissionLines

  before(async () => {
    testReturnLog = await ReturnLogHelper.add()

    testRecord = await ReturnSubmissionHelper.add({ returnLogId: testReturnLog.id })

    testReturnSubmissionLines = []
    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the lines table means you cannot have 2 records with the same returnSubmissionId,
      // startDate and endDate
      const returnSubmissionLine = await ReturnSubmissionLineHelper.add({
        returnSubmissionId: testRecord.id,
        startDate: new Date(2022, 11, 1 + i),
        endDate: new Date(2022, 11, 2 + i)
      })

      testReturnSubmissionLines.push(returnSubmissionLine)
    }
  })

  after(async () => {
    await testReturnLog.$query().delete()

    for (const returnSubmissionLine of testReturnSubmissionLines) {
      await returnSubmissionLine.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnSubmissionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnSubmissionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
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
        expect(result.returnSubmissionLines).to.include(testReturnSubmissionLines[0])
        expect(result.returnSubmissionLines).to.include(testReturnSubmissionLines[1])
      })
    })
  })

  describe('$applyReadings', () => {
    let applyReadingsTestRecord

    beforeEach(() => {
      applyReadingsTestRecord = ReturnSubmissionModel.fromJson({
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
      applyReadingsTestRecord.$applyReadings()

      expect(applyReadingsTestRecord.returnSubmissionLines[0].reading).to.equal(1)
      expect(applyReadingsTestRecord.returnSubmissionLines[1].reading).to.equal(2)
      expect(applyReadingsTestRecord.returnSubmissionLines[2].reading).be.null()
    })
  })

  describe('$meter', () => {
    let meterTestRecord

    describe('when the return submission contains meters', () => {
      beforeEach(() => {
        meterTestRecord = ReturnSubmissionModel.fromJson({
          metadata: {
            meters: [{ serialNumber: 'METER_1' }, { serialNumber: 'METER_2' }]
          }
        })
      })

      it('returns the first meter', () => {
        const result = meterTestRecord.$meter()

        expect(result).to.equal({ serialNumber: 'METER_1' })
      })
    })

    describe('when the return submission contains no meters', () => {
      beforeEach(async () => {
        meterTestRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns null', () => {
        const result = meterTestRecord.$meter()

        expect(result).to.be.null()
      })
    })
  })

  describe('$method', () => {
    let methodTestRecord

    describe('when the return submission contains the method', () => {
      beforeEach(async () => {
        methodTestRecord = ReturnSubmissionModel.fromJson({ metadata: { method: 'METHOD' } })
      })

      it('returns the method', () => {
        const result = methodTestRecord.$method()

        expect(result).to.equal('METHOD')
      })
    })

    describe('when the return submission contains no method', () => {
      beforeEach(async () => {
        methodTestRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns the method as abstractionVolumes', () => {
        const result = methodTestRecord.$method()

        expect(result).to.equal('abstractionVolumes')
      })
    })
  })

  describe('$units', () => {
    let unitsTestRecord

    describe('when the return submission contains the unit', () => {
      beforeEach(async () => {
        unitsTestRecord = ReturnSubmissionModel.fromJson({ metadata: { units: 'UNITS' } })
      })

      it('returns the unit', () => {
        const result = unitsTestRecord.$units()

        expect(result).to.equal('UNITS')
      })
    })

    describe('when the return submission contains no unit', () => {
      beforeEach(async () => {
        unitsTestRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns the units as cubic metres', () => {
        const result = unitsTestRecord.$units()

        expect(result).to.equal(unitNames.CUBIC_METRES)
      })
    })
  })
})
