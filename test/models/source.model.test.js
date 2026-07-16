// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import PointHelper from '../support/helpers/point.helper.js'
import PointModel from '../../app/models/point.model.js'
import SourceHelper from '../support/helpers/source.helper.js'

// Thing under test
import SourceModel from '../../app/models/source.model.js'

describe('Source model', () => {
  let testPoints
  let testRecord

  beforeAll(async () => {
    testRecord = SourceHelper.select()

    testPoints = []
    for (let i = 0; i < 2; i++) {
      const point = await PointHelper.add({ sourceId: testRecord.id })

      testPoints.push(point)
    }
  })

  afterAll(async () => {
    for (const point of testPoints) {
      await point.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await SourceModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(SourceModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to points', () => {
      it('can successfully run a related query', async () => {
        const query = await SourceModel.query().innerJoinRelated('points')

        expect(query).toBeDefined()
      })

      it('can eager load the points', async () => {
        const result = await SourceModel.query().findById(testRecord.id).withGraphFetched('points')

        expect(result).toBeInstanceOf(SourceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.points).toBeInstanceOf(Array)
        expect(result.points[0]).toBeInstanceOf(PointModel)
        expect(result.points).toContainEqual(testPoints[0])
        expect(result.points).toContainEqual(testPoints[1])
      })
    })
  })
})
