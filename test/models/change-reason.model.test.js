'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const ChangeReasonHelper = require('../support/helpers/change-reason.helper.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const { closeConnection } = require('../support/database.js')

// Thing under test
const ChangeReasonModel = require('../../app/models/change-reason.model.js')

const CHANGE_REASON_SUCCESSION_REMAINDER_INDEX = 9

describe('Change Reason model', () => {
  let testChargeVersions
  let testRecord

  before(async () => {
    testRecord = ChangeReasonHelper.select(CHANGE_REASON_SUCCESSION_REMAINDER_INDEX)
    const { id } = testRecord

    // Link charge versions
    testChargeVersions = []
    for (let i = 0; i < 2; i++) {
      const chargeVersion = await ChargeVersionHelper.add({ changeReasonId: id })

      testChargeVersions.push(chargeVersion)
    }
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChangeReasonModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChangeReasonModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChangeReasonModel.query().innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await ChangeReasonModel.query().findById(testRecord.id).withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(ChangeReasonModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(testChargeVersions[0])
        expect(result.chargeVersions).to.include(testChargeVersions[1])
      })
    })
  })
})
