'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCyclesFixture = require('../../fixtures/return-cycles.fixture.js')
const ReturnRequirementsFixture = require('../../fixtures/return-requirements.fixture.js')

// Things we need to stub
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')
const FetchLicenceReturnRequirementsService = require('../../../app/services/return-logs/fetch-licence-return-requirements.service.js')
const ReturnCycleModel = require('../../../app/models/return-cycle.model.js')
const VoidLicenceReturnLogsService = require('../../../app/services/return-logs/void-licence-return-logs.service.js')

// Thing under test
const ProcessLicenceReturnLogsService = require('../../../app/services/return-logs/process-licence-return-logs.service.js')

describe('Return Logs - Process Licence Return Logs service', () => {
  const licenceId = '3acf7d80-cf74-4e86-8128-13ef687ea091'

  let changeDate
  let clock
  let createReturnLogsStub
  let fetchReturnRequirementsStub
  let returnCycles
  let returnCycleModelStub
  let returnRequirements
  let returnVersionEndDate
  let voidReturnLogsStub

  beforeEach(() => {
    // NOTE: We set the clock, not because it is needed for the services called, but so that the test data we're
    // providing makes sense in the context we use it.
    //
    // For example, each year new return cycles are added, which means one year a 'change date' would result in no
    // matching return cycles, but the next year there would be one, then two, and so on. By fixing the date we can use
    // test data that still covers all possible scenarios, but doesn't require us to make them overly complicated by
    // trying to make it dynamic.
    clock = Sinon.useFakeTimers(new Date('2026-01-09'))

    returnCycleModelStub = Sinon.stub()
    Sinon.stub(ReturnCycleModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      orderBy: returnCycleModelStub
    })

    fetchReturnRequirementsStub = Sinon.stub(FetchLicenceReturnRequirementsService, 'go')

    // Whatever CreateReturnLogsService is pushed into an array that is then passed to VoidLicenceReturnLogsService.
    // Our tests check that CreateReturnLogsService returns the results expected depending on what is passed in, so
    // we control what values are coming back. And the tests for VoidLicenceReturnLogsService ensure it does what is
    // expected with those values. So, any further tests here would not only complicate the tests further, they'd just
    // be duplicating work elsewhere.
    createReturnLogsStub = Sinon.stub(CreateReturnLogsService, 'go').resolves(['6662dd0f-8065-485c-bb6c-e99ffb1aa3fc'])
    voidReturnLogsStub = Sinon.stub(VoidLicenceReturnLogsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when processing a licence end date change', () => {
    beforeEach(() => {
      // NOTE: This is never passed in when processing a licence end date change. We set it to null here to highlight
      // this, but like ProcessLicenceEndDateChangesService, we don't ever pass the argument in
      returnVersionEndDate = null
    })

    describe('and the licence has been "ended" in NALD', () => {
      describe('and the "changeDate" aligns with a return cycle', () => {
        beforeEach(() => {
          changeDate = new Date('2025-06-15')

          // NOTE: The query to fetch return cycles is based on returnCycle.endDate > changeDate. This means we'll
          // normally pull back at least two return cycles: a summer and a winter in that order. In this scenario we
          // have
          //
          // - Summer ending 2026-10-31
          // - Winter ending 2026-03-31
          // - Summer ending 2025-10-31
          //
          // The next winter ends 2025-03-31, which is before our change date, so the results would stop here.
          returnCycles = ReturnCyclesFixture.returnCycles(3)
          returnCycleModelStub.resolves(returnCycles)
        })

        describe('and the licence has return versions that align with the cycles', () => {
          beforeEach(() => {
            // NOTE: In most cases a licence will have a single return version that aligns, and one or two return
            // requirements that are for the same cycle (summer or winter).
            //
            // To fully test the service whilst avoiding lots of duplication in the tests, we create a gnarly scenario!
            // We have two return versions, each with a return requirement for summer and winter, giving us four
            // return requirements to process against the three return cycles above.
            //
            // We're not testing the return logs that created here; that is the responsibility of the
            // CreateReturnLogsService tests. We are testing that the service processes the 'right' return requirements.

            const previousSummerReq = ReturnRequirementsFixture.summerReturnRequirement()
            previousSummerReq.siteDescription = 'Previous Summer Requirement'
            previousSummerReq.returnVersion.startDate = new Date('2020-04-01')
            previousSummerReq.returnVersion.endDate = new Date('2025-04-30')

            const previousWinterReq = ReturnRequirementsFixture.winterReturnRequirement()
            previousWinterReq.siteDescription = 'Previous Winter Requirement'
            previousWinterReq.returnVersion = previousSummerReq.returnVersion

            const currentSummerReq = ReturnRequirementsFixture.summerReturnRequirement()
            currentSummerReq.siteDescription = 'Current Summer Requirement'
            currentSummerReq.returnVersion.startDate = new Date('2025-05-01')

            const currentWinterReq = ReturnRequirementsFixture.winterReturnRequirement()
            currentWinterReq.siteDescription = 'Current Winter Requirement'
            currentWinterReq.returnVersion = currentSummerReq.returnVersion

            returnRequirements = [currentSummerReq, currentWinterReq, previousSummerReq, previousWinterReq]
            fetchReturnRequirementsStub.resolves(returnRequirements)
          })

          it('processes the _right_ return requirements for each return cycle', async () => {
            await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

            expect(createReturnLogsStub.callCount).to.equal(5)
            expect(voidReturnLogsStub.callCount).to.equal(3)

            // First cycle is summer ending 2026-10-31; should process current summer req only
            expect(createReturnLogsStub.getCall(0).args).to.equal([returnRequirements[0], returnCycles[0], null])

            // Second cycle is winter ending 2026-03-31; should process current and previous winter req
            expect(createReturnLogsStub.getCall(1).args).to.equal([returnRequirements[1], returnCycles[1], null])
            expect(createReturnLogsStub.getCall(2).args).to.equal([returnRequirements[3], returnCycles[1], null])

            // Third cycle is summer ending 2025-10-31; should process current and previous summer req
            expect(createReturnLogsStub.getCall(3).args).to.equal([returnRequirements[0], returnCycles[2], null])
            expect(createReturnLogsStub.getCall(4).args).to.equal([returnRequirements[2], returnCycles[2], null])
          })
        })

        describe('and the licence has no return versions that align with the cycles', () => {
          describe('because it has none', () => {
            beforeEach(() => {
              returnRequirements = []
              fetchReturnRequirementsStub.resolves(returnRequirements)
            })

            it('does not attempt to process any return cycles', async () => {
              await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

              expect(fetchReturnRequirementsStub.called).to.be.true()
              expect(returnCycleModelStub.called).to.be.false()
            })
          })

          describe('because the return version starts in the future', () => {
            beforeEach(() => {
              const futureWinterReq = ReturnRequirementsFixture.winterReturnRequirement()

              futureWinterReq.siteDescription = 'Previous Summer Requirement'
              futureWinterReq.returnVersion.startDate = new Date('2026-07-01')

              returnRequirements = [futureWinterReq]
              fetchReturnRequirementsStub.resolves(returnRequirements)
            })

            it('does not attempt to generate or void any return logs', async () => {
              await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

              expect(returnCycleModelStub.called).to.be.true()
              expect(createReturnLogsStub.called).to.be.false()
              expect(voidReturnLogsStub.called).to.be.false()
            })
          })
        })
      })

      describe('but the "changeDate" does not align with a return cycle (it is in the future)', () => {
        beforeEach(() => {
          changeDate = new Date('2030-06-15')

          returnCycleModelStub.resolves([])
        })

        describe('though the licence has return requirements', () => {
          beforeEach(() => {
            returnRequirements = [ReturnRequirementsFixture.winterReturnRequirement()]

            fetchReturnRequirementsStub.resolves(returnRequirements)
          })

          it('does not attempt to generate or void any return logs', async () => {
            await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

            expect(returnCycleModelStub.called).to.be.true()
            expect(createReturnLogsStub.called).to.be.false()
            expect(voidReturnLogsStub.called).to.be.false()
          })
        })
      })
    })
  })

  describe('when submitting a new return version', () => {
    describe('and it aligns with the return cycles', () => {
      beforeEach(() => {
        changeDate = new Date('2024-04-01')

        const returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()

        returnRequirement.returnVersion.startDate = changeDate
        returnRequirements = [returnRequirement]
      })

      describe('and does not have an end date', () => {
        beforeEach(() => {
          returnVersionEndDate = returnRequirements[0].returnVersion.endDate

          fetchReturnRequirementsStub.resolves(returnRequirements)

          // NOTE: If todays date was 2026-01-09, these are the return cycles that would be fetched for a "change date"
          // of 2024-04-01 and no end date on the return version
          //
          // - Summer ending 2026-10-31
          // - Winter ending 2026-03-31
          // - Summer ending 2025-10-31
          // - Winter ending 2025-03-31
          // - Summer ending 2024-10-31
          returnCycles = ReturnCyclesFixture.returnCycles(5)
          returnCycleModelStub.resolves(returnCycles)
        })

        it('would process the return requirements for _all_ matching return cycles that exist', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate)

          expect(createReturnLogsStub.callCount).to.equal(2)
          expect(voidReturnLogsStub.callCount).to.equal(2)

          // First cycle is summer ending 2026-10-31; should be ignored
          // Second cycle is winter ending 2026-03-31; should process our new requirement
          // Third cycle is summer ending 2025-10-31; should be ignored
          // Fourth cycle is winter ending 2025-03-31; should process our new requirement
          // Fifth cycle is summer ending 2024-10-31; should be ignored
          expect(createReturnLogsStub.getCall(0).args).to.equal([returnRequirements[0], returnCycles[1], null])
          expect(createReturnLogsStub.getCall(1).args).to.equal([returnRequirements[0], returnCycles[3], null])
        })
      })

      describe('and does have an end date', () => {
        beforeEach(() => {
          returnRequirements[0].returnVersion.endDate = new Date('2024-12-31')

          returnVersionEndDate = returnRequirements[0].returnVersion.endDate

          fetchReturnRequirementsStub.resolves(returnRequirements)

          // NOTE: If todays date was 2026-01-09, and "change date" is 2024-04-01 we'd fetch the same 5 as previous.
          // However, because the return version has an end date of 2024-12-31, only the return cycles that start before
          // that date would be fetched.
          //
          // - Winter ending 2025-03-31
          // - Summer ending 2024-10-31
          const allReturnCycles = ReturnCyclesFixture.returnCycles(5)

          returnCycles = [allReturnCycles[3], allReturnCycles[4]]
          returnCycleModelStub.resolves(returnCycles)
        })

        it('would process the return requirements for _only_ the matching return cycles that exist', async () => {
          await ProcessLicenceReturnLogsService.go(licenceId, changeDate, returnVersionEndDate)

          expect(createReturnLogsStub.callCount).to.equal(1)
          expect(voidReturnLogsStub.callCount).to.equal(1)

          // First cycle is winter ending 2025-03-31; should process our new requirement
          // Second cycle is summer ending 2024-10-31; should be ignored
          expect(createReturnLogsStub.getCall(0).args).to.equal([returnRequirements[0], returnCycles[0], null])
        })
      })
    })

    describe('but it does not align with a return cycle (it is in the future)', () => {
      beforeEach(() => {
        changeDate = new Date('2030-06-15')

        const returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()

        returnRequirement.returnVersion.startDate = changeDate
        returnRequirements = [returnRequirement]

        // NOTE: If todays date was 2026-01-09, no return cycles would be fetched for a "change date" of 2024-04-01 by
        // the service (they wouldn't exist yet)
        returnCycleModelStub.resolves([])

        returnVersionEndDate = returnRequirement.returnVersion.endDate

        fetchReturnRequirementsStub.resolves(returnRequirements)
      })

      it('does not attempt to generate or void any return logs', async () => {
        await ProcessLicenceReturnLogsService.go(licenceId, changeDate, returnVersionEndDate)

        expect(returnCycleModelStub.called).to.be.true()
        expect(createReturnLogsStub.called).to.be.false()
        expect(voidReturnLogsStub.called).to.be.false()
      })
    })
  })
})
