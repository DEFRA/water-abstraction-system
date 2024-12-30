'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const SessionHelper = require('../support/helpers/session.helper.js')

// Thing under test
const SessionModel = require('../../app/models/session.model.js')

describe('Session model', () => {
  let testRecord

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await SessionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await SessionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(SessionModel)
      expect(result.id).to.equal(testRecord.id)
      expect(result.data).to.equal({})
    })
  })

  // NOTE: this is an Objection.js hook and not intended to be called directly
  describe('$afterFind', () => {
    describe('when "data" is empty', () => {
      beforeEach(async () => {
        testRecord = await SessionHelper.add()
      })

      it('adds nothing to the session instance properties', async () => {
        const result = await SessionModel.query().findById(testRecord.id)

        expect(Object.keys(result)).to.equal(['id', 'data', 'createdAt', 'updatedAt'])
      })
    })

    describe('when "data" is populated', () => {
      beforeEach(async () => {
        testRecord = await SessionHelper.add({
          data: {
            licence: {
              licenceRef: '01/123/01',
              startDate: new Date('2017-05-07')
            },
            purposes: ['foo', 'bar'],
            reason: 'major-change'
          }
        })
      })

      it('adds its properties to the session instance properties', async () => {
        const result = await SessionModel.query().findById(testRecord.id)

        expect(Object.keys(result)).to.equal(['id', 'data', 'createdAt', 'updatedAt', 'reason', 'licence', 'purposes'])

        expect(result.licence).to.equal({ licenceRef: '01/123/01', startDate: '2017-05-07T00:00:00.000Z' })
        expect(result.purposes).to.equal(['foo', 'bar'])
        expect(result.reason).to.equal('major-change')
      })
    })
  })

  describe('$update', () => {
    let recordToUpdate

    describe('when the session has an existing property that was updated', () => {
      beforeEach(async () => {
        testRecord = await SessionHelper.add({ data: { reason: 'major-change' } })

        recordToUpdate = await SessionModel.query().findById(testRecord.id)
        recordToUpdate.reason = 'minor-change'
      })

      it('is updated in the "data" field when "update()" is called', async () => {
        const result = await recordToUpdate.$update()

        // NOTE: We do not expect it to be used. But Objection.js patch() returns a count of records effected so we also
        // return that as a result. As we are patching the instance this should only ever be 1
        expect(result).to.equal(1)

        const refreshedInstance = await SessionModel.query().findById(testRecord.id)

        expect(refreshedInstance.data).to.equal({ reason: 'minor-change' })
        expect(refreshedInstance.reason).to.equal('minor-change')
      })
    })

    describe('when a new property is set on the session', () => {
      beforeEach(async () => {
        testRecord = await SessionHelper.add()

        recordToUpdate = await SessionModel.query().findById(testRecord.id)
        recordToUpdate.reason = 'new-licence'
      })

      it('is set in the "data" field when "update()" is called', async () => {
        const result = await recordToUpdate.$update()

        // NOTE: We do not expect it to be used. But Objection.js patch() returns a count of records effected so we also
        // return that as a result. As we are patching the instance this should only ever be 1
        expect(result).to.equal(1)

        const refreshedInstance = await SessionModel.query().findById(testRecord.id)

        expect(refreshedInstance.data).to.equal({ reason: 'new-licence' })
        expect(refreshedInstance.reason).to.equal('new-licence')
      })
    })

    describe('when the session has an existing property that was deleted', () => {
      beforeEach(async () => {
        testRecord = await SessionHelper.add({ data: { reason: 'name-or-address-change' } })

        recordToUpdate = await SessionModel.query().findById(testRecord.id)
        delete recordToUpdate.reason
      })

      it('removed from the "data" field when "update()" is called', async () => {
        const result = await recordToUpdate.$update()

        // NOTE: We do not expect it to be used. But Objection.js patch() returns a count of records effected so we also
        // return that as a result. As we are patching the instance this should only ever be 1
        expect(result).to.equal(1)

        const refreshedInstance = await SessionModel.query().findById(testRecord.id)

        expect(refreshedInstance.data).to.equal({})
        expect(refreshedInstance.reason).not.to.exist()
      })
    })
  })
})
