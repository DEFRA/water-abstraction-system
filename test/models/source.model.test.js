'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const PointHelper = require('../support/helpers/point.helper.js')
const PointModel = require('../../app/models/point.model.js')
const SourceHelper = require('../support/helpers/source.helper.js')

// Thing under test
const SourceModel = require('../../app/models/source.model.js')

describe('Source model', () => {
  let testRecord

  beforeEach(() => {
    testRecord = SourceHelper.select()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await SourceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(SourceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to points', () => {
      let testPoints

      beforeEach(async () => {
        const { id } = testRecord

        testPoints = []
        for (let i = 0; i < 2; i++) {
          const point = await PointHelper.add({ sourceId: id })

          testPoints.push(point)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await SourceModel.query()
          .innerJoinRelated('points')

        expect(query).to.exist()
      })

      it('can eager load the points', async () => {
        const result = await SourceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('points')

        expect(result).to.be.instanceOf(SourceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.points).to.be.an.array()
        expect(result.points[0]).to.be.an.instanceOf(PointModel)
        expect(result.points).to.include(testPoints[0])
        expect(result.points).to.include(testPoints[1])
      })
    })
  })
})
