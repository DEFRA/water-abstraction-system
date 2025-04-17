'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const ReturnCycleModel = require('../../../../app/models/return-cycle.model.js')

// Thing under test
const CreateCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/create-current-return-cycle.service.js')

describe('Jobs - Return Logs - Create Current Return Cycle service', () => {
  let clock
  let insertStub

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date('2024-05-01'))
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when there is no matching return cycles for the current date', () => {
    before(() => {
      insertStub = Sinon.stub().returnsThis()
      Sinon.stub(ReturnCycleModel, 'query').returns({
        select: Sinon.stub().returnsThis(),
        orderBy: Sinon.stub().returnsThis(),
        limit: Sinon.stub().resolves([]),
        insert: insertStub
      })
    })

    it('creates both the all year and summer return cycles', async () => {
      await CreateCurrentReturnCycleService.go()

      const [insertObject] = insertStub.args[0]

      expect(insertStub.callCount).to.equal(1)
      expect(insertObject[0]).to.equal(
        {
          dueDate: new Date('2024-11-28T00:00:00.000Z'),
          endDate: new Date('2024-10-31T00:00:00.000Z'),
          startDate: new Date('2023-11-01T00:00:00.000Z'),
          summer: true,
          submittedInWrls: true
        },
        { skip: ['createdAt', 'updatedAt'] }
      )

      expect(insertObject[1]).to.equal(
        {
          dueDate: new Date('2025-04-28T00:00:00.000Z'),
          endDate: new Date('2025-03-31T00:00:00.000Z'),
          startDate: new Date('2024-04-01T00:00:00.000Z'),
          summer: false,
          submittedInWrls: true
        },
        { skip: ['createdAt', 'updatedAt'] }
      )
    })
  })

  describe('when there is only a matching summer return cycle for the current date', () => {
    before(() => {
      insertStub = Sinon.stub().returnsThis()
      Sinon.stub(ReturnCycleModel, 'query').returns({
        select: Sinon.stub().returnsThis(),
        orderBy: Sinon.stub().returnsThis(),
        limit: Sinon.stub().resolves([
          {
            createdAt: new Date('2024-05-01T00:00:00.000Z'),
            dueDate: new Date('2024-11-28T00:00:00.000Z'),
            endDate: new Date('2024-10-31T00:00:00.000Z'),
            summer: true,
            submittedInWrls: true,
            startDate: new Date('2023-11-01T00:00:00.000Z'),
            updatedAt: new Date('2024-05-01T00:00:00.000Z')
          }
        ]),
        insert: insertStub
      })
    })

    it('creates the all year return cycles', async () => {
      await CreateCurrentReturnCycleService.go()

      const [insertObject] = insertStub.args[0]

      expect(insertStub.callCount).to.equal(1)
      expect(insertObject[0]).to.equal(
        {
          dueDate: new Date('2024-11-28T00:00:00.000Z'),
          endDate: new Date('2024-10-31T00:00:00.000Z'),
          startDate: new Date('2023-11-01T00:00:00.000Z'),
          summer: true,
          submittedInWrls: true
        },
        { skip: ['createdAt', 'updatedAt'] }
      )
    })
  })

  describe('when there is only a matching all year return cycle for the current date', () => {
    before(() => {
      insertStub = Sinon.stub().returnsThis()
      Sinon.stub(ReturnCycleModel, 'query').returns({
        select: Sinon.stub().returnsThis(),
        orderBy: Sinon.stub().returnsThis(),
        limit: Sinon.stub().resolves([
          {
            createdAt: new Date('2024-05-01T00:00:00.000Z'),
            dueDate: new Date('2025-04-28T00:00:00.000Z'),
            endDate: new Date('2025-03-31T00:00:00.000Z'),
            summer: false,
            submittedInWrls: true,
            startDate: new Date('2024-04-01T00:00:00.000Z'),
            updatedAt: new Date('2024-05-01T00:00:00.000Z')
          }
        ]),
        insert: insertStub
      })
    })

    it('creates the summer return cycles', async () => {
      await CreateCurrentReturnCycleService.go()

      const [insertObject] = insertStub.args[0]

      expect(insertStub.callCount).to.equal(1)
      expect(insertObject[0]).to.equal(
        {
          dueDate: new Date('2025-04-28T00:00:00.000Z'),
          endDate: new Date('2025-03-31T00:00:00.000Z'),
          startDate: new Date('2024-04-01T00:00:00.000Z'),
          summer: false,
          submittedInWrls: true
        },
        { skip: ['createdAt', 'updatedAt'] }
      )
    })
  })

  describe('when there is both a matching all year and summer return cycles for the current date', () => {
    before(() => {
      insertStub = Sinon.stub().returnsThis()
      Sinon.stub(ReturnCycleModel, 'query').returns({
        select: Sinon.stub().returnsThis(),
        orderBy: Sinon.stub().returnsThis(),
        limit: Sinon.stub().resolves([
          {
            createdAt: new Date('2024-05-01T00:00:00.000Z'),
            dueDate: new Date('2025-04-28T00:00:00.000Z'),
            endDate: new Date('2025-03-31T00:00:00.000Z'),
            summer: false,
            submittedInWrls: true,
            startDate: new Date('2024-04-01T00:00:00.000Z'),
            updatedAt: new Date('2024-05-01T00:00:00.000Z')
          },
          {
            createdAt: new Date('2024-05-01T00:00:00.000Z'),
            dueDate: new Date('2024-11-28T00:00:00.000Z'),
            endDate: new Date('2024-10-31T00:00:00.000Z'),
            summer: true,
            submittedInWrls: true,
            startDate: new Date('2023-11-01T00:00:00.000Z'),
            updatedAt: new Date('2024-05-01T00:00:00.000Z')
          }
        ]),
        insert: insertStub
      })
    })

    it('does not insert anything in the database', async () => {
      await CreateCurrentReturnCycleService.go()

      expect(insertStub.callCount).to.equal(0)
    })
  })
})
