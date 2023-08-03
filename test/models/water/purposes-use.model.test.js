'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargePurposeModel = require('../../../app/models/water/charge-purpose.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const PurposesUseHelper = require('../../support/helpers/water/purposes-use.helper.js')

// Thing under test
const PurposesUseModel = require('../../../app/models/water/purposes-use.model.js')

describe('Purposes Use model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await PurposesUseHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await PurposesUseModel.query().findById(testRecord.purposeUseId)

      expect(result).to.be.an.instanceOf(PurposesUseModel)
      expect(result.purposeUseId).to.equal(testRecord.purposeUseId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge purpose', () => {
      let testChargePurpose

      beforeEach(async () => {
        const { purposeUseId } = testRecord

        testChargePurpose = await ChargePurposeHelper.add({ purposeUseId })
      })

      it('can successfully run a related query', async () => {
        const query = await PurposesUseModel.query()
          .innerJoinRelated('chargePurpose')

        expect(query).to.exist()
      })

      it('can eager load the charge purpose', async () => {
        const result = await PurposesUseModel.query()
          .findById(testRecord.purposeUseId)
          .withGraphFetched('chargePurpose')

        expect(result).to.be.instanceOf(PurposesUseModel)
        expect(result.purposeUseId).to.equal(testRecord.purposeUseId)

        expect(result.chargePurpose).to.be.an.instanceOf(ChargePurposeModel)
        expect(result.chargePurpose).to.equal(testChargePurpose)
      })
    })
  })
})
