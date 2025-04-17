'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const ReturnCycleModel = require('../../../app/models/return-cycle.model.js')

// Thing under test
const CheckReturnCycleService = require('../../../app/services/return-logs/check-return-cycle.service.js')

describe.only('Return Logs - Check Return Cycle service', () => {
  const changeDate = new Date('2024-05-01')
  let clock
  let insertStub
  let summer

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date('2024-05-01'))
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when summer is true', () => {
    beforeEach(() => {
      summer = true
    })

    describe('and there is no matching return cycle for the change date', () => {
      before(() => {
        insertStub = Sinon.stub().returnsThis()
        Sinon.stub(ReturnCycleModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves(undefined),
          returning: Sinon.stub().resolves({
            id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
            dueDate: new Date('2024-11-28T00:00:00.000Z'),
            endDate: new Date('2024-10-31T00:00:00.000Z'),
            startDate: new Date('2023-11-01T00:00:00.000Z'),
            summer: true
          }),
          insert: insertStub
        })
      })

      it('creates summer return cycle', async () => {
        const result = await CheckReturnCycleService.go(summer, changeDate)

        const [insertObject] = insertStub.args[0]

        expect(insertStub.callCount).to.equal(1)
        expect(insertObject).to.equal(
          {
            dueDate: new Date('2024-11-28T00:00:00.000Z'),
            endDate: new Date('2024-10-31T00:00:00.000Z'),
            startDate: new Date('2023-11-01T00:00:00.000Z'),
            summer: true,
            submittedInWrls: true
          },
          { skip: ['createdAt', 'updatedAt'] }
        )
        expect(result).to.equal({
          id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
          dueDate: new Date('2024-11-28T00:00:00.000Z'),
          endDate: new Date('2024-10-31T00:00:00.000Z'),
          startDate: new Date('2023-11-01T00:00:00.000Z'),
          summer: true
        })
      })
    })

    describe('and there is a matching summer return cycle for the change date', () => {
      before(() => {
        insertStub = Sinon.stub().returnsThis()
        Sinon.stub(ReturnCycleModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves({
            id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
            dueDate: new Date('2024-11-28T00:00:00.000Z'),
            endDate: new Date('2024-10-31T00:00:00.000Z'),
            startDate: new Date('2023-11-01T00:00:00.000Z'),
            summer: true
          }),
          insert: insertStub
        })
      })

      it('returns the summer cycles', async () => {
        const result = await CheckReturnCycleService.go(summer, changeDate)

        expect(result).to.equal({
          id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
          dueDate: new Date('2024-11-28T00:00:00.000Z'),
          endDate: new Date('2024-10-31T00:00:00.000Z'),
          startDate: new Date('2023-11-01T00:00:00.000Z'),
          summer: true
        })
      })
    })
  })

  describe('when summer is false', () => {
    beforeEach(() => {
      summer = false
    })

    describe('and there is no matching return cycle for the change date', () => {
      before(() => {
        insertStub = Sinon.stub().returnsThis()
        Sinon.stub(ReturnCycleModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves(undefined),
          returning: Sinon.stub().resolves({
            id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
            dueDate: new Date('2025-04-28T00:00:00.000Z'),
            endDate: new Date('2025-03-31T00:00:00.000Z'),
            startDate: new Date('2024-04-01T00:00:00.000Z'),
            summer: false
          }),
          insert: insertStub
        })
      })

      it('creates all year return cycle', async () => {
        const result = await CheckReturnCycleService.go(summer, changeDate)

        const [insertObject] = insertStub.args[0]

        expect(insertStub.callCount).to.equal(1)
        expect(insertObject).to.equal(
          {
            dueDate: new Date('2025-04-28T00:00:00.000Z'),
            endDate: new Date('2025-03-31T00:00:00.000Z'),
            startDate: new Date('2024-04-01T00:00:00.000Z'),
            summer: false,
            submittedInWrls: true
          },
          { skip: ['createdAt', 'updatedAt'] }
        )
        expect(result).to.equal({
          id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
          dueDate: new Date('2025-04-28T00:00:00.000Z'),
          endDate: new Date('2025-03-31T00:00:00.000Z'),
          startDate: new Date('2024-04-01T00:00:00.000Z'),
          summer: false
        })
      })
    })

    describe('when there is a matching all year return cycle for the change date', () => {
      before(() => {
        insertStub = Sinon.stub().returnsThis()
        Sinon.stub(ReturnCycleModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          where: Sinon.stub().returnsThis(),
          first: Sinon.stub().resolves({
            id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
            dueDate: new Date('2025-04-28T00:00:00.000Z'),
            endDate: new Date('2025-03-31T00:00:00.000Z'),
            summer: false,
            startDate: new Date('2024-04-01T00:00:00.000Z')
          }),
          insert: insertStub
        })
      })

      it('creates the all year return cycles', async () => {
        const result = await CheckReturnCycleService.go(summer, changeDate)

        expect(result).to.equal({
          id: '0055799f-8b6a-4753-ac78-57c61a6ef80b',
          dueDate: new Date('2025-04-28T00:00:00.000Z'),
          endDate: new Date('2025-03-31T00:00:00.000Z'),
          summer: false,
          startDate: new Date('2024-04-01T00:00:00.000Z')
        })
      })
    })
  })
})
