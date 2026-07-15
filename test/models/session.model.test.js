// Test helpers
import SessionHelper from '../support/helpers/session.helper.js'

// Thing under test
import SessionModel from '../../app/models/session.model.js'

describe('Session model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await SessionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await SessionModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(SessionModel)
      expect(result.id).toEqual(testRecord.id)
      expect(result.data).toEqual({})
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

        expect(Object.keys(result).sort()).toEqual(['id', 'data', 'createdAt', 'updatedAt'].sort())
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

        expect(Object.keys(result).sort()).toEqual(
          ['id', 'data', 'createdAt', 'updatedAt', 'reason', 'licence', 'purposes'].sort()
        )

        expect(result.licence).toEqual({ licenceRef: '01/123/01', startDate: '2017-05-07T00:00:00.000Z' })
        expect(result.purposes).toEqual(['foo', 'bar'])
        expect(result.reason).toEqual('major-change')
      })
    })
  })

  // NOTE: this is also an Objection.js hook and not intended to be called directly
  describe('$afterInsert', () => {
    describe('when "data" is empty', () => {
      it('adds nothing to the session instance properties', async () => {
        const result = await SessionHelper.add()

        expect(Object.keys(result).sort()).toEqual(['id', 'data', 'createdAt', 'updatedAt'].sort())
      })
    })

    describe('when "data" is populated', () => {
      let testData

      beforeEach(async () => {
        testData = {
          data: {
            licence: {
              licenceRef: '01/123/01',
              startDate: new Date('2017-05-07')
            },
            purposes: ['foo', 'bar'],
            reason: 'major-change'
          }
        }
      })

      it('adds its properties to the session instance properties', async () => {
        const result = await SessionHelper.add(testData)

        expect(Object.keys(result).sort()).toEqual(
          ['id', 'data', 'createdAt', 'updatedAt', 'reason', 'licence', 'purposes'].sort()
        )

        expect(result.licence).toEqual({ licenceRef: '01/123/01', startDate: '2017-05-07T00:00:00.000Z' })
        expect(result.purposes).toEqual(['foo', 'bar'])
        expect(result.reason).toEqual('major-change')
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
        expect(result).toEqual(1)

        const refreshedInstance = await SessionModel.query().findById(testRecord.id)

        expect(refreshedInstance.data).toEqual({ reason: 'minor-change' })
        expect(refreshedInstance.reason).toEqual('minor-change')
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
        expect(result).toEqual(1)

        const refreshedInstance = await SessionModel.query().findById(testRecord.id)

        expect(refreshedInstance.data).toEqual({ reason: 'new-licence' })
        expect(refreshedInstance.reason).toEqual('new-licence')
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
        expect(result).toEqual(1)

        const refreshedInstance = await SessionModel.query().findById(testRecord.id)

        expect(refreshedInstance.data).toEqual({})
        expect(refreshedInstance.reason).toBeUndefined()
      })
    })
  })
})
