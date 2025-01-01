'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const {
  returnCycle,
  returnCycles,
  returnRequirement,
  returnRequirements,
  returnRequirementsAcrossReturnVersions
} = require('../../fixtures/return-logs.fixture.js')

// Things we need to stub
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')
const FetchLicenceReturnRequirementsService = require('../../../app/services/return-logs/fetch-licence-return-requirements.service.js')
const ReturnCycleModel = require('../../../app/models/return-cycle.model.js')
const VoidLicenceReturnLogsService = require('../../../app/services/return-logs/void-licence-return-logs.service.js')

// Thing under test
const ProcessLicenceReturnLogsService = require('../../../app/services/return-logs/process-licence-return-logs.service.js')

describe('Process licence return logs service', () => {
  const changeDate = new Date('2024-05-26')
  const currentDate = new Date('2024-07-15')
  const licenceId = '3acf7d80-cf74-4e86-8128-13ef687ea091'

  let clock
  let createReturnLogsStub
  let fetchReturnRequirementsStub
  let returnCycleModelStub
  let voidReturnLogsStub

  beforeEach(() => {
    // We control what the 'current' date is, so we can assert what the service does when not provided with `changeDate`
    clock = Sinon.useFakeTimers(currentDate)

    fetchReturnRequirementsStub = Sinon.stub(FetchLicenceReturnRequirementsService, 'go')
    createReturnLogsStub = Sinon.stub(CreateReturnLogsService, 'go')
    voidReturnLogsStub = Sinon.stub(VoidLicenceReturnLogsService, 'go').resolves()

    returnCycleModelStub = Sinon.stub().resolves(returnCycles())
    Sinon.stub(ReturnCycleModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      orderBy: returnCycleModelStub
    })
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when called with a known licence ID', () => {
    describe('and the licence has both "summer" and "all-year" return requirements', () => {
      beforeEach(() => {
        fetchReturnRequirementsStub.resolves(returnRequirements())
      })

      describe('and the change date means multiple return cycles need processing', () => {
        beforeEach(() => {
          returnCycleModelStub.resolves(returnCycles())

          createReturnLogsStub.onCall(0).resolves(['v1:4:01/25/90/3242:16999651:2024-11-01:2025-10-31'])
          createReturnLogsStub.onCall(1).resolves(['v1:4:01/25/90/3242:16999652:2024-04-01:2025-03-31'])
        })

        it('processes all the return requirements for the licence', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

          expect(createReturnLogsStub.callCount).to.equal(2)
          expect(voidReturnLogsStub.callCount).to.equal(2)
        })
      })

      describe('but the change date means only a single return cycle needs processing', () => {
        beforeEach(() => {
          returnCycleModelStub.resolves([returnCycle(true)])

          createReturnLogsStub.resolves(['v1:4:01/25/90/3242:16999651:2024-11-01:2025-10-31'])
        })

        it('processes only the matching return requirements for the licence', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

          // Confirm we only call create once with our summer return requirement
          const createReturnLogArgs = createReturnLogsStub.firstCall.args

          expect(createReturnLogsStub.callCount).to.equal(1)
          expect(createReturnLogArgs[0].id).to.equal('3bc0e31a-4bfb-47ef-aa6e-8aca37d9aac2')

          // Confirm we only call void once, with the return log ID generated from our summer return requirement
          const voidReturnLogArgs = voidReturnLogsStub.firstCall.args

          expect(voidReturnLogsStub.callCount).to.equal(1)
          expect(voidReturnLogArgs[0]).to.equal(['v1:4:01/25/90/3242:16999651:2024-11-01:2025-10-31'])
        })
      })
    })

    describe('and the licence has both "summer" and "all-year" return requirements across multiple return versions', () => {
      beforeEach(() => {
        fetchReturnRequirementsStub.resolves(returnRequirementsAcrossReturnVersions())
      })

      describe('and the change date means multiple return cycles need processing', () => {
        beforeEach(() => {
          returnCycleModelStub.resolves(returnCycles())

          createReturnLogsStub.onCall(0).resolves(['v1:4:01/25/90/3242:16999651:2024-11-01:2025-10-31'])
          createReturnLogsStub.onCall(1).resolves(['v1:4:01/25/90/3242:16999652:2024-04-01:2025-05-26'])
          createReturnLogsStub.onCall(2).resolves(['v1:4:01/25/90/3242:16999652:2024-05-27:2025-03-31'])
        })

        it('processes all the return requirements for the licence', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

          expect(createReturnLogsStub.callCount).to.equal(3)
          expect(voidReturnLogsStub.callCount).to.equal(2)
        })
      })
    })

    describe('and the licence has both "summer" and "all-year" return requirements across multiple return versions', () => {
      beforeEach(() => {
        fetchReturnRequirementsStub.resolves(returnRequirementsAcrossReturnVersions())
      })

      describe('and the change date replaces the earliest return version', () => {
        beforeEach(() => {
          returnCycleModelStub.resolves(returnCycles(4))

          createReturnLogsStub.onCall(0).resolves(['v1:4:01/25/90/3242:16999652:2024-11-01:2025-10-31'])
          createReturnLogsStub.onCall(1).resolves(['v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31'])
          createReturnLogsStub.onCall(2).resolves(['v1:4:01/25/90/3242:16999641:2024-04-01:2025-03-31'])
          createReturnLogsStub.onCall(3).resolves(['v1:4:01/25/90/3242:16999652:2023-11-01:2024-10-31'])
          createReturnLogsStub.onCall(4).resolves(['v1:4:01/25/90/3242:16999642:2023-11-01:2024-10-31'])
          createReturnLogsStub.onCall(5).resolves(['v1:4:01/25/90/3242:16999651:2023-04-01:2024-03-31'])
        })

        it('processes all the return requirements for the licence', async () => {
          const oldestReturnVersionStartDate = new Date('2022-04-01')
          await ProcessLicenceReturnLogsService.go(licenceId, oldestReturnVersionStartDate)

          expect(createReturnLogsStub.callCount).to.equal(6)
          expect(voidReturnLogsStub.callCount).to.equal(4)
        })
      })
    })

    describe('and the licence has only a "summer" return requirement', () => {
      beforeEach(() => {
        fetchReturnRequirementsStub.resolves([returnRequirement(true)])
        createReturnLogsStub.resolves()
      })

      describe('but the change date means only an "all-year" return cycle needs processing', () => {
        beforeEach(() => {
          returnCycleModelStub.resolves([returnCycle(false)])
        })

        it('does not process any return requirements for the licence', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

          expect(createReturnLogsStub.called).to.be.false()
          expect(voidReturnLogsStub.called).to.be.false()
        })
      })
    })

    describe('and the licence has only an "all-year" return requirement', () => {
      beforeEach(() => {
        fetchReturnRequirementsStub.resolves([returnRequirement(false)])
        createReturnLogsStub.resolves()
      })

      describe('but the change date means only a "summer" return cycle needs processing', () => {
        beforeEach(() => {
          returnCycleModelStub.resolves([returnCycle(true)])
        })

        it('does not process any return requirements for the licence', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

          expect(createReturnLogsStub.called).to.be.false()
          expect(voidReturnLogsStub.called).to.be.false()
        })
      })
    })
  })

  describe('when called with a unknown licence ID, or licence with no return requirements', () => {
    beforeEach(() => {
      fetchReturnRequirementsStub.resolves([])
      returnCycleModelStub.resolves()
      createReturnLogsStub.resolves()
      voidReturnLogsStub.resolves()
    })

    it('does not attempt to process the licence', async () => {
      await ProcessLicenceReturnLogsService.go(licenceId)

      expect(fetchReturnRequirementsStub.called).to.be.true()
      expect(returnCycleModelStub.called).to.be.false()
      expect(createReturnLogsStub.called).to.be.false()
      expect(voidReturnLogsStub.called).to.be.false()
    })
  })

  describe('when called with no "change date"', () => {
    beforeEach(() => {
      returnCycleModelStub.resolves(returnCycles())
      fetchReturnRequirementsStub.resolves([])
      createReturnLogsStub.resolves()
      voidReturnLogsStub.resolves()
    })

    it('defaults to using the current date as the change date', async () => {
      await ProcessLicenceReturnLogsService.go(licenceId)

      const fetchArgs = fetchReturnRequirementsStub.firstCall.args

      expect(fetchArgs[1]).to.equal(currentDate)

      expect(returnCycleModelStub.called).to.be.false()
      expect(createReturnLogsStub.called).to.be.false()
      expect(voidReturnLogsStub.called).to.be.false()
    })
  })
})
