'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UniqueViolationError = require('objection').UniqueViolationError
const ReturnCycleModel = require('../../../../app/models/return-cycle.model.js')

// Thing under test
const CreateCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/create-current-return-cycle.service.js')

describe('Jobs - Return Logs - Create Return Cycle service', () => {
  let clock
  let insertStub
  let summer

  beforeEach(() => {
    insertStub = Sinon.stub().returnsThis()
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when summer is "false"', () => {
    before(() => {
      summer = false
    })

    describe('and the current date is for a return cycle that has not yet been created', () => {
      beforeEach(() => {
        Sinon.stub(ReturnCycleModel, 'query').returns({
          insert: insertStub,
          returning: Sinon.stub().withArgs('*').resolves()
        })
      })

      describe('and the current date is after the end of April (2024-05-01)', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date('2024-05-01'))
        })

        it('creates the correct "all year" return cycle', async () => {
          await CreateCurrentReturnCycleService.go(summer)

          // Check we create the return cycle as expected
          const [insertObject] = insertStub.args[0]

          expect(insertObject).to.equal(
            {
              dueDate: new Date(`2025-04-28`),
              endDate: new Date('2025-03-31'),
              summer,
              submittedInWrls: true,
              startDate: new Date('2024-04-01')
            },
            { skip: ['createdAt', 'updatedAt'] }
          )
        })
      })

      describe('and the current date is before the end of April (2024-01-01)', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date('2024-01-01'))
        })

        it('creates the correct "all year" return cycle', async () => {
          await CreateCurrentReturnCycleService.go(summer)

          // Check we create the return cycle as expected
          const [insertObject] = insertStub.args[0]

          expect(insertObject).to.equal(
            {
              dueDate: new Date('2024-04-28'),
              endDate: new Date('2024-03-31'),
              summer,
              submittedInWrls: true,
              startDate: new Date('2023-04-01')
            },
            { skip: ['createdAt', 'updatedAt'] }
          )
        })
      })
    })

    // NOTE: We test for this by simply removing all our stubbing. We know the current return cycles are seeded when the
    // test suite is started, so the current return cycles will already exist causing the service to fail as expected.
    describe('and the current date is for a return cycle that has already been created', () => {
      it('throws an error', async () => {
        const result = await expect(CreateCurrentReturnCycleService.go(summer)).to.reject()

        expect(result).to.be.instanceOf(UniqueViolationError)
      })
    })
  })

  describe('when summer is "true"', () => {
    before(() => {
      summer = true
    })

    describe('and the current date is for a return cycle that has not yet been created', () => {
      beforeEach(() => {
        Sinon.stub(ReturnCycleModel, 'query').returns({
          insert: insertStub,
          returning: Sinon.stub().withArgs('*').resolves()
        })
      })

      describe('and the current date is after the end of October (2024-12-01)', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date('2024-12-01'))
        })

        it('creates the correct "summer" return cycle', async () => {
          await CreateCurrentReturnCycleService.go(summer)

          // Check we create the return cycle as expected
          const [insertObject] = insertStub.args[0]

          expect(insertObject).to.equal(
            {
              dueDate: new Date('2025-11-28'),
              endDate: new Date('2025-10-31'),
              summer,
              submittedInWrls: true,
              startDate: new Date('2024-11-01')
            },
            { skip: ['createdAt', 'updatedAt'] }
          )
        })
      })

      describe('and the current date is before the end of October (2024-09-01)', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date('2024-09-01'))
        })

        it('creates the correct "summer" return cycle', async () => {
          await CreateCurrentReturnCycleService.go(summer)

          // Check we create the return cycle as expected
          const [insertObject] = insertStub.args[0]

          expect(insertObject).to.equal(
            {
              dueDate: new Date('2024-11-28'),
              endDate: new Date('2024-10-31'),
              summer,
              submittedInWrls: true,
              startDate: new Date('2023-11-01')
            },
            { skip: ['createdAt', 'updatedAt'] }
          )
        })
      })
    })

    // NOTE: We test for this by simply removing all our stubbing. We know the current return cycles are seeded when the
    // test suite is started, so the current return cycles will already exist causing the service to fail as expected.
    describe('and the current date is for a return cycle that has already been created', () => {
      it('throws an error', async () => {
        const result = await expect(CreateCurrentReturnCycleService.go(summer)).to.reject()

        expect(result).to.be.instanceOf(UniqueViolationError)
      })
    })
  })
})
