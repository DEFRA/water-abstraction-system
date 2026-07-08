'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things to stub
const ReturnCycleModel = require('../../../../app/models/return-cycle.model.js')

// Thing under test
const CheckReturnCycleService = require('../../../../app/services/jobs/return-logs/check-return-cycle.service.js')

describe('Jobs - Return Logs - Check Return Cycle service', () => {
  const currentDate = new Date('2024-05-01')
  const id = '0055799f-8b6a-4753-ac78-57c61a6ef80b'

  let clock
  let cycleData
  let firstStub
  let insertStub
  let returningStub
  let summer

  beforeEach(() => {
    firstStub = Sinon.stub()
    insertStub = Sinon.stub().returnsThis()
    returningStub = Sinon.stub()

    Sinon.stub(ReturnCycleModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      limit: Sinon.stub().returnsThis(),
      first: firstStub,
      returning: returningStub,
      insert: insertStub
    })

    clock = Sinon.useFakeTimers(currentDate)
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when summer is true', () => {
    beforeEach(() => {
      cycleData = {
        id,
        dueDate: null,
        endDate: new Date('2024-10-31'),
        startDate: new Date('2023-11-01'),
        summer: true
      }
      summer = true
    })

    describe('and there is no matching return cycle for the change date', () => {
      beforeEach(() => {
        firstStub.resolves(undefined)
        returningStub.resolves(cycleData)
      })

      it('creates and then returns the new summer return cycle', async () => {
        const result = await CheckReturnCycleService(summer)

        const [insertObject] = insertStub.args[0]

        expect(insertStub.callCount).toEqual(1)
        expect(insertObject).toMatchObject({
          dueDate: null,
          endDate: cycleData.endDate,
          startDate: cycleData.startDate,
          summer: true,
          submittedInWrls: true
        })
        expect(result).toEqual(cycleData)
      })
    })

    describe('and there is a matching summer return cycle for the change date', () => {
      beforeEach(() => {
        firstStub.resolves(cycleData)
      })

      it('returns the matching summer cycle', async () => {
        const result = await CheckReturnCycleService(summer)

        expect(result).toEqual(cycleData)
      })
    })
  })

  describe('when summer is false', () => {
    beforeEach(() => {
      cycleData = {
        id,
        dueDate: null,
        endDate: new Date('2025-03-31'),
        startDate: new Date('2024-04-01'),
        summer: false
      }
      summer = false
    })

    describe('and there is no matching return cycle for the change date', () => {
      beforeEach(() => {
        firstStub.resolves(undefined)
        returningStub.resolves(cycleData)
      })

      it('creates and then returns the new summer return cycle', async () => {
        const result = await CheckReturnCycleService(summer)

        const [insertObject] = insertStub.args[0]

        expect(insertStub.callCount).toEqual(1)
        expect(insertObject).toMatchObject({
          dueDate: null,
          endDate: cycleData.endDate,
          startDate: cycleData.startDate,
          summer: false,
          submittedInWrls: true
        })
        expect(result).toEqual(cycleData)
      })
    })

    describe('when there is a matching all year return cycle for the change date', () => {
      beforeEach(() => {
        firstStub.resolves(cycleData)
      })

      it('returns the matching all year return cycle', async () => {
        const result = await CheckReturnCycleService(summer)

        expect(result).toEqual(cycleData)
      })
    })
  })
})
