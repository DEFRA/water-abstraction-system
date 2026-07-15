// Test helpers
import ReturnCycleHelper from '../support/helpers/return-cycle.helper.js'
import ReturnLogHelper from '../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../app/models/return-log.model.js'

// Thing under test
import ReturnCycleModel from '../../app/models/return-cycle.model.js'

describe('Return Cycle model', () => {
  let testRecord
  let testReturnLogs

  beforeAll(async () => {
    testRecord = await ReturnCycleHelper.select()

    testReturnLogs = []
    for (let i = 0; i < 2; i++) {
      const returnLog = await ReturnLogHelper.add({ returnCycleId: testRecord.id })

      testReturnLogs.push(returnLog)
    }
  })

  afterAll(async () => {
    for (const returnLog of testReturnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnCycleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnCycleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnCycleModel.query().innerJoinRelated('returnLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the return log', async () => {
        const result = await ReturnCycleModel.query().findById(testRecord.id).withGraphFetched('returnLogs')

        expect(result).toBeInstanceOf(ReturnCycleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnLogs).toBeInstanceOf(Array)
        expect(result.returnLogs[0]).toBeInstanceOf(ReturnLogModel)
        expect(result.returnLogs).toContainEqual(testReturnLogs[0])
        expect(result.returnLogs).toContainEqual(testReturnLogs[1])
      })
    })
  })
})
