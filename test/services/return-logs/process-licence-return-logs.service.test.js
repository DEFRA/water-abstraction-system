// Test framework dependencies

// Test helpers
import * as ReturnCyclesFixture from '../../support/fixtures/return-cycles.fixture.js'
import * as ReturnRequirementsFixture from '../../support/fixtures/return-requirements.fixture.js'

// Things we need to stub
import * as CreateReturnLogsService from '../../../app/services/return-logs/create-return-logs.service.js'
import * as FetchLicenceReturnRequirementsService from '../../../app/services/return-logs/fetch-licence-return-requirements.service.js'
import ReturnCycleModel from '../../../app/models/return-cycle.model.js'
import * as VoidLicenceReturnLogsService from '../../../app/services/return-logs/void-licence-return-logs.service.js'

// Thing under test
import ProcessLicenceReturnLogsService from '../../../app/services/return-logs/process-licence-return-logs.service.js'

describe('Return Logs - Process Licence Return Logs service', () => {
  const licenceId = '3acf7d80-cf74-4e86-8128-13ef687ea091'

  let changeDate
  let returnCycles
  let returnCycleModelStub
  let returnRequirements
  let returnVersionEndDate
  beforeEach(() => {
    // NOTE: We set the clock, not because it is needed for the services called, but so that the test data we're
    // providing makes sense in the context we use it.
    //
    // For example, each year new return cycles are added, which means one year a 'change date' would result in no
    // matching return cycles, but the next year there would be one, then two, and so on. By fixing the date we can use
    // test data that still covers all possible scenarios, but doesn't require us to make them overly complicated by
    // trying to make it dynamic.
    vi.useFakeTimers({ now: new Date('2026-01-09') })

    returnCycleModelStub = vi.fn()
    vi.spyOn(ReturnCycleModel, 'query').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: returnCycleModelStub
    })

    // Whatever CreateReturnLogsService is pushed into an array that is then passed to VoidLicenceReturnLogsService.
    // Our tests check that CreateReturnLogsService returns the results expected depending on what is passed in, so
    // we control what values are coming back. And the tests for VoidLicenceReturnLogsService ensure it does what is
    // expected with those values. So, any further tests here would not only complicate the tests further, they'd just
    // be duplicating work elsewhere.
    vi.spyOn(CreateReturnLogsService, 'default').mockResolvedValue([
      'v1:1:01/10/79/9184:21042654:2022-04-01:2023-03-31'
    ])
    vi.spyOn(VoidLicenceReturnLogsService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
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
          returnCycleModelStub.mockResolvedValue(returnCycles)
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
            vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)
          })

          it('processes the _right_ return requirements for each return cycle', async () => {
            await ProcessLicenceReturnLogsService(licenceId, changeDate)

            expect(CreateReturnLogsService.default).toHaveBeenCalledTimes(5)
            expect(VoidLicenceReturnLogsService.default).toHaveBeenCalledTimes(3)

            // First cycle is summer ending 2026-10-31; should process current summer req only
            expect(CreateReturnLogsService.default.mock.calls[0]).toEqual([
              returnRequirements[0],
              returnCycles[0],
              null,
              null
            ])

            // Second cycle is winter ending 2026-03-31; should process current and previous winter req
            expect(CreateReturnLogsService.default.mock.calls[1]).toEqual([
              returnRequirements[1],
              returnCycles[1],
              null,
              null
            ])
            expect(CreateReturnLogsService.default.mock.calls[2]).toEqual([
              returnRequirements[3],
              returnCycles[1],
              null,
              null
            ])

            // Third cycle is summer ending 2025-10-31; should process current and previous summer req
            expect(CreateReturnLogsService.default.mock.calls[3]).toEqual([
              returnRequirements[0],
              returnCycles[2],
              null,
              null
            ])
            expect(CreateReturnLogsService.default.mock.calls[4]).toEqual([
              returnRequirements[2],
              returnCycles[2],
              null,
              null
            ])
          })
        })

        describe('and the licence has no return versions that align with the cycles', () => {
          describe('because it has none', () => {
            beforeEach(() => {
              returnRequirements = []
              vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)
            })

            it('does not attempt to process any return cycles', async () => {
              await ProcessLicenceReturnLogsService(licenceId, changeDate)

              expect(FetchLicenceReturnRequirementsService.default).toHaveBeenCalled()
              expect(returnCycleModelStub).not.toHaveBeenCalled()
            })
          })

          describe('because the return version starts in the future', () => {
            beforeEach(() => {
              const futureWinterReq = ReturnRequirementsFixture.winterReturnRequirement()

              futureWinterReq.siteDescription = 'Previous Summer Requirement'
              futureWinterReq.returnVersion.startDate = new Date('2026-07-01')

              returnRequirements = [futureWinterReq]
              vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)
            })

            it('does not attempt to generate return logs', async () => {
              await ProcessLicenceReturnLogsService(licenceId, changeDate)

              expect(CreateReturnLogsService.default).not.toHaveBeenCalled()
            })

            it('still checks if return logs should be voided', async () => {
              await ProcessLicenceReturnLogsService(licenceId, changeDate)

              expect(VoidLicenceReturnLogsService.default).toHaveBeenCalled()
            })
          })
        })
      })

      describe('but the "changeDate" does not align with a return cycle (it is in the future)', () => {
        beforeEach(() => {
          changeDate = new Date('2030-06-15')

          returnCycleModelStub.mockResolvedValue([])
        })

        describe('though the licence has return requirements', () => {
          beforeEach(() => {
            returnRequirements = [ReturnRequirementsFixture.winterReturnRequirement()]

            vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)
          })

          it('does not attempt to generate return logs', async () => {
            await ProcessLicenceReturnLogsService(licenceId, changeDate)

            expect(CreateReturnLogsService.default).not.toHaveBeenCalled()
          })

          it('does not check if return logs should be voided (no return cycles were processed)', async () => {
            await ProcessLicenceReturnLogsService(licenceId, changeDate)

            expect(VoidLicenceReturnLogsService.default).not.toHaveBeenCalled()
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

          vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)

          // NOTE: If todays date was 2026-01-09, these are the return cycles that would be fetched for a "change date"
          // of 2024-04-01 and no end date on the return version
          //
          // - Summer ending 2026-10-31
          // - Winter ending 2026-03-31
          // - Summer ending 2025-10-31
          // - Winter ending 2025-03-31
          // - Summer ending 2024-10-31
          returnCycles = ReturnCyclesFixture.returnCycles(5)
          returnCycleModelStub.mockResolvedValue(returnCycles)
        })

        it('processes the return requirements for _all_ matching return cycles that exist', async () => {
          await ProcessLicenceReturnLogsService(licenceId, changeDate)

          // The requirement matches with two of the return cycles (winter), so 'create' is called twice
          expect(CreateReturnLogsService.default).toHaveBeenCalledTimes(2)

          // For every return cycle fetched, we need to call the void service, even if no return logs were created. If
          // this is the case, it means any existing return logs for that cycle need to be voided.
          expect(VoidLicenceReturnLogsService.default).toHaveBeenCalledTimes(returnCycles.length)

          // First cycle is summer ending 2026-10-31; should be ignored
          // Second cycle is winter ending 2026-03-31; should process our new requirement
          // Third cycle is summer ending 2025-10-31; should be ignored
          // Fourth cycle is winter ending 2025-03-31; should process our new requirement
          // Fifth cycle is summer ending 2024-10-31; should be ignored
          expect(CreateReturnLogsService.default.mock.calls[0]).toEqual([
            returnRequirements[0],
            returnCycles[1],
            null,
            null
          ])
          expect(CreateReturnLogsService.default.mock.calls[1]).toEqual([
            returnRequirements[0],
            returnCycles[3],
            null,
            null
          ])
        })
      })

      describe('and does have an end date', () => {
        beforeEach(() => {
          returnRequirements[0].returnVersion.endDate = new Date('2024-12-31')

          returnVersionEndDate = returnRequirements[0].returnVersion.endDate

          vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)

          // NOTE: If todays date was 2026-01-09, and "change date" is 2024-04-01 we'd fetch the same 5 as previous.
          // However, because the return version has an end date of 2024-12-31, only the return cycles that start before
          // that date would be fetched.
          //
          // - Winter ending 2025-03-31
          // - Summer ending 2024-10-31
          const allReturnCycles = ReturnCyclesFixture.returnCycles(5)

          returnCycles = [allReturnCycles[3], allReturnCycles[4]]
          returnCycleModelStub.mockResolvedValue(returnCycles)
        })

        it('processes the return requirements for _only_ the matching return cycles that exist', async () => {
          await ProcessLicenceReturnLogsService(licenceId, changeDate, returnVersionEndDate)

          // The requirement only matches with one of the return cycles, hence 'create' is only called once
          expect(CreateReturnLogsService.default).toHaveBeenCalledTimes(1)

          // For every return cycle fetched, we need to call the void service, even if no return logs were created. If
          // this is the case, it means any existing return logs for that cycle need to be voided.
          expect(VoidLicenceReturnLogsService.default).toHaveBeenCalledTimes(returnCycles.length)

          // First cycle is winter ending 2025-03-31; should process our new requirement
          // Second cycle is summer ending 2024-10-31; should be ignored
          expect(CreateReturnLogsService.default.mock.calls[0]).toEqual([
            returnRequirements[0],
            returnCycles[0],
            null,
            null
          ])
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
        returnCycleModelStub.mockResolvedValue([])

        returnVersionEndDate = returnRequirement.returnVersion.endDate

        vi.spyOn(FetchLicenceReturnRequirementsService, 'default').mockResolvedValue(returnRequirements)
      })

      it('does not attempt to generate return logs', async () => {
        await ProcessLicenceReturnLogsService(licenceId, changeDate, returnVersionEndDate)

        expect(CreateReturnLogsService.default).not.toHaveBeenCalled()
      })

      it('does not check if return logs should be voided (no return cycles were processed)', async () => {
        await ProcessLicenceReturnLogsService(licenceId, changeDate, returnVersionEndDate)

        expect(VoidLicenceReturnLogsService.default).not.toHaveBeenCalled()
      })
    })
  })
})
