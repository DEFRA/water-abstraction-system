'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCyclesFixture = require('../../fixtures/return-cycles.fixture.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnRequirementsFixture = require('../../fixtures/return-requirements.fixture.js')
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const { today } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

// Thing under test
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')

describe('Return Logs - Create Return Logs service', () => {
  const todaysDate = today()
  const year = todaysDate.getFullYear()

  let clock
  let notifierStub
  let returnCycle
  let returnRequirement

  beforeEach(() => {
    // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
    clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    describe('and the return cycle is "summer"', () => {
      describe('and is before 2025-04-01 (before quarterly)', () => {
        beforeEach(() => {
          returnCycle = ReturnCyclesFixture.returnCycles(4)[2] // summer 2024-11-01 to 2025-10-31
        })

        describe('and the return requirement is "summer"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-10-31`])
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-10-31`])
          })
        })

        // NOTE: The quarterly return functionality is only relevant for cycles after 2025-04-01. It is not possible to
        // create a return version that is quarterly which starts before 2025-04-01.
      })

      describe('and is after 2025-04-01 (after quarterly)', () => {
        beforeEach(() => {
          returnCycle = ReturnCyclesFixture.summerCycle()
        })

        describe('and the return requirement is "summer"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-10-31`])
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-10-31`])
          })
        })

        // NOTE: Quarterly return functionality only applies to winter return requirements linked to a return version
        // with the quarterly flag set. You cannot set the quarterly flag on a return version that contains summer
        // return requirements.
      })

      describe('and the return log to be created already exists', () => {
        let formattedStartDate
        let formattedEndDate

        beforeEach(async () => {
          returnCycle = ReturnCyclesFixture.summerCycle()
          returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()

          const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

          formattedStartDate = formatDateObjectToISO(returnCycle.startDate)
          formattedEndDate = formatDateObjectToISO(returnCycle.endDate)

          await ReturnLogHelper.add({
            returnId: `${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`,
            licenceRef: returnRequirement.returnVersion.licence.licenceRef,
            endDate: returnCycle.endDate,
            returnReference: returnRequirement.reference,
            startDate: returnCycle.startDate
          })
        })

        it('returns the existing return log returnId instead of creating a new one', async () => {
          const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

          const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

          expect(results).to.equal([`${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`])
        })
      })
    })

    describe('and the return cycle is "winter"', () => {
      describe('and is before 2025-04-01 (before quarterly)', () => {
        beforeEach(() => {
          returnCycle = ReturnCyclesFixture.returnCycles(4)[3] // winter 2024-04-01 to 2025-03-31
        })

        describe('and the return requirement is "summer"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2025-03-31`])
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2025-03-31`])
          })
        })

        describe('and the return requirement is "quarterly"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
          })

          describe('and neither the licence nor the return version end during the return cycle', () => {
            it('will create just one return log from the requirement and return its returnId', async () => {
              const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2025-03-31`])
            })
          })

          describe('and the licence ends', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-05-01')
              })

              it('will create 1 return log ending on the licence end date and return the returnId', async () => {
                const results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('on the start date of the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-07-01')
              })

              it('will still create just 1 return log ending on the licence end date and return the returnId', async () => {
                const results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-07-01`])
              })
            })
          })

          describe('and the return version ends during the return cycle and in the first quarter', () => {
            beforeEach(() => {
              returnRequirement.returnVersion.endDate = new Date('2024-05-01')
            })

            it('will create 1 return log ending on the return version end date and return the returnId', async () => {
              const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
            })
          })

          describe('and the return version starts during the return cycle and in the second quarter', () => {
            beforeEach(() => {
              returnRequirement.returnVersion.startDate = new Date('2024-07-27')
            })

            it('will create 1 return log, starting on the return version start date and return the returnId', async () => {
              const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-07-27:2025-03-31`])
            })
          })
        })
      })

      describe('and is after 2025-04-01 (after quarterly)', () => {
        beforeEach(() => {
          returnCycle = ReturnCyclesFixture.winterCycle()
          returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
        })

        describe('and the return requirement is "summer"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2026-03-31`])
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          it('will create a return log from the requirement and return its returnId', async () => {
            const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

            const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

            expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2026-03-31`])
          })
        })

        describe('and the return requirement is "quarterly"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
          })

          describe('and neither the licence nor the return version end during the return cycle', () => {
            it('will create 4 return logs from the requirement and return their returnIds', async () => {
              const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([
                `${returnLogPrefix}:2025-04-01:2025-06-30`,
                `${returnLogPrefix}:2025-07-01:2025-09-30`,
                `${returnLogPrefix}:2025-10-01:2025-12-31`,
                `${returnLogPrefix}:2026-01-01:2026-03-31`
              ])
            })
          })

          describe('and the licence ends', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will create 1 return log ending on the licence end date and return the returnId', async () => {
                const results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('on the start date of the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-07-01')
              })

              it('will create 2 return logs, the second starting and ending on the licence end date and return their returnIds', async () => {
                const results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-04-01:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-07-01`
                ])
              })
            })
          })

          describe('and the return version ends during the return cycle and in the first quarter', () => {
            beforeEach(() => {
              returnRequirement.returnVersion.endDate = new Date('2025-05-01')
            })

            it('will create 1 return log ending on the return version end date and return the returnId', async () => {
              const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
            })
          })

          describe('and the return version starts during the return cycle and in the second quarter', () => {
            beforeEach(() => {
              returnRequirement.returnVersion.startDate = new Date('2025-07-27')
            })

            it('will create 3 return logs, the first starting on the return version start date and return their returnIds', async () => {
              const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([
                `${returnLogPrefix}:2025-07-27:2025-09-30`,
                `${returnLogPrefix}:2025-10-01:2025-12-31`,
                `${returnLogPrefix}:2026-01-01:2026-03-31`
              ])
            })
          })
        })
      })

      describe('and the return log to be created already exists', () => {
        let formattedStartDate
        let formattedEndDate

        beforeEach(async () => {
          returnCycle = ReturnCyclesFixture.winterCycle()
          returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()

          const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

          formattedStartDate = formatDateObjectToISO(returnCycle.startDate)
          formattedEndDate = formatDateObjectToISO(returnCycle.endDate)

          await ReturnLogHelper.add({
            returnId: `${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`,
            licenceRef: returnRequirement.returnVersion.licence.licenceRef,
            endDate: returnCycle.endDate,
            returnReference: returnRequirement.reference,
            startDate: returnCycle.startDate
          })
        })

        it('returns the existing return log returnId instead of creating a new one', async () => {
          const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

          const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

          expect(results).to.equal([`${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`])
        })
      })
    })
  })

  describe('when an error is thrown', () => {
    beforeEach(() => {
      returnCycle = ReturnCyclesFixture.summerCycle()
      returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()

      // NOTE: We stub the generate service to throw purely because it is easier to structure our tests on that basis.
      // But if the actual insert were to throw the expected behaviour would be the same.
      Sinon.stub(GenerateReturnLogService, 'go').throws()
    })

    it('handles the error', async () => {
      await CreateReturnLogsService.go(returnRequirement, returnCycle)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Return logs creation errored')
      expect(args[1].returnRequirement.id).to.equal(returnRequirement.id)
      expect(args[1].returnCycle.id).to.equal(returnCycle.id)
      expect(args[2]).to.be.an.error()
    })
  })
})
