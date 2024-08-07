'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const NoteHelper = require('../support/helpers/note.helper.js')

// Thing under test
const NoteModel = require('../../app/models/note.model.js')

describe('Note model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await NoteHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await NoteModel.query()
        .findById(testRecord.id)

      expect(result).to.be.an.instanceOf(NoteModel)
      expect(result.id).to.be.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      beforeEach(async () => {
        testRecord = await NoteHelper.add()
        await ChargeVersionHelper.add({ noteId: testRecord.id })
      })

      it('can successfully run a related query', async () => {
        const query = await NoteModel.query()
          .withGraphFetched('chargeVersions')

        expect(query).to.exist()
      })
    })
  })
})
