'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionNoteHelper = require('../support/helpers/charge-version-note.helper.js')

// Thing under test
const ChargeVersionNoteModel = require('../../app/models/charge-version-note.model.js')

describe('Charge Version Note model', () => {
  let testRecord

  before(async () => {
    testRecord = await ChargeVersionNoteHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionNoteModel.query()
        .findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeVersionNoteModel)
      expect(result.id).to.be.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ noteId: testRecord.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionNoteModel.query()
          .withGraphFetched('chargeVersion')

        expect(query).to.exist()
      })
    })
  })
})
