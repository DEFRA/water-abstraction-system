// Test framework
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReturnLogHelper from '../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../app/models/return-log.model.js'
import ReturnSubmissionHelper from '../support/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from '../support/helpers/return-submission-line.helper.js'
import ReturnSubmissionLineModel from '../../app/models/return-submission-line.model.js'

// Thing under test
import ReturnSubmissionModel from '../../app/models/return-submission.model.js'

import { unitNames } from '../../app/lib/static-lookups.lib.js'

describe('Return Submission model', () => {
  let testRecord
  let testReturnLog
  let testReturnSubmissionLines

  beforeAll(async () => {
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

  afterAll(async () => {
    await testReturnLog.$query().delete()

    for (const returnSubmissionLine of testReturnSubmissionLines) {
      await returnSubmissionLine.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnSubmissionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnSubmissionModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionModel.query().innerJoinRelated('returnLog')

        expect(query).toBeDefined()
      })

      it('can eager load the return log', async () => {
        const result = await ReturnSubmissionModel.query().findById(testRecord.id).withGraphFetched('returnLog')

        expect(result).toBeInstanceOf(ReturnSubmissionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnLog).toBeInstanceOf(ReturnLogModel)
        expect(result.returnLog).toEqual(testReturnLog)
      })
    })

    describe('when linking to return submission lines', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnSubmissionModel.query().innerJoinRelated('returnSubmissionLines')

        expect(query).toBeDefined()
      })

      it('can eager load the return submission lines', async () => {
        const result = await ReturnSubmissionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnSubmissionLines')

        expect(result).toBeInstanceOf(ReturnSubmissionModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnSubmissionLines).toBeInstanceOf(Array)
        expect(result.returnSubmissionLines[0]).toBeInstanceOf(ReturnSubmissionLineModel)
        expect(result.returnSubmissionLines).toContainEqual(testReturnSubmissionLines[0])
        expect(result.returnSubmissionLines).toContainEqual(testReturnSubmissionLines[1])
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

      expect(applyReadingsTestRecord.returnSubmissionLines[0].reading).toEqual(1)
      expect(applyReadingsTestRecord.returnSubmissionLines[1].reading).toEqual(2)
      expect(applyReadingsTestRecord.returnSubmissionLines[2].reading).toBeNull()
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

        expect(result).toEqual({ serialNumber: 'METER_1' })
      })
    })

    describe('when the return submission contains no meters', () => {
      beforeEach(async () => {
        meterTestRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns null', () => {
        const result = meterTestRecord.$meter()

        expect(result).toBeNull()
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

        expect(result).toEqual('METHOD')
      })
    })

    describe('when the return submission contains no method', () => {
      beforeEach(async () => {
        methodTestRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns the method as abstractionVolumes', () => {
        const result = methodTestRecord.$method()

        expect(result).toEqual('abstractionVolumes')
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

        expect(result).toEqual('UNITS')
      })
    })

    describe('when the return submission contains no unit', () => {
      beforeEach(async () => {
        unitsTestRecord = ReturnSubmissionModel.fromJson()
      })

      it('returns the units as cubic metres', () => {
        const result = unitsTestRecord.$units()

        expect(result).toEqual(unitNames.CUBIC_METRES)
      })
    })
  })
})
