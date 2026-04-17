'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCyclesFixture = require('../../support/fixtures/return-cycles.fixture.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnRequirementsFixture = require('../../support/fixtures/return-requirements.fixture.js')
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')

// Thing under test
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')

describe('Return Logs - Create Return Logs service', () => {
  let results
  let returnCycle
  let returnRequirement

  afterEach(async () => {
    await ReturnLogModel.query()
      .delete()
      .whereIn('returnId', results || [])
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

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-10-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-11-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2024-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2025-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-10-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-10-31:2025-10-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-11-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2024-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2025-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-10-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-10-31:2025-10-31`])
              })
            })
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-10-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-11-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2024-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2025-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-10-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-10-31:2025-10-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-11-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-11-01:2024-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2025-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-10-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-10-31:2025-10-31`])
              })
            })
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

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-10-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2026-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-11-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2025-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2026-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-05-01:2026-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2026-10-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-10-31:2026-10-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2026-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-11-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2025-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2026-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-05-01:2026-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2026-10-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-10-31:2026-10-31`])
              })
            })
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-10-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2026-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-11-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2025-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2026-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-05-01:2026-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2026-10-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-10-31:2026-10-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2026-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2026-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-11-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-11-01:2025-11-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2026-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-05-01:2026-10-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2026-10-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-10-31:2026-10-31`])
              })
            })
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
          results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

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

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2025-03-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-04-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2024-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-05-01:2025-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-03-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-03-31:2025-03-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-04-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2024-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-05-01:2025-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-03-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-03-31:2025-03-31`])
              })
            })
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2025-03-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-04-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2024-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-05-01:2025-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-03-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-03-31:2025-03-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-04-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2024-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-05-01:2025-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-03-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-03-31:2025-03-31`])
              })
            })
          })
        })

        describe('and the return requirement is "quarterly"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
          })

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create just one return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2025-03-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('ends on the start date of the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2024-07-01')
              })

              it('will create just 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-07-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2024-05-01')
              })

              it('will create just 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-05-01:2025-03-31`])
              })
            })

            describe('starts on the end date of the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2024-06-30')
              })

              it('will create just 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-06-30:2025-03-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-05-01`])
              })
            })

            describe('ends during the return cycle and in the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-07-27')
              })

              it('will create just 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-07-27`])
              })
            })

            describe('ends during the return cycle and on the start date of the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2024-07-01')
              })

              it('will create just 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-04-01:2024-07-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2024-05-01')
              })

              it('will create just 1 return log, starting on the return version start date and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-05-01:2025-03-31`])
              })
            })

            describe('starts on the end date of the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2024-06-30')
              })

              it('will create just 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2024-06-30:2025-03-31`])
              })
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

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2026-03-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-04-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2026-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2026-03-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-03-31:2026-03-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-04-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2026-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2026-03-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-03-31:2026-03-31`])
              })
            })
          })
        })

        describe('and the return requirement is "winter"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()
          })

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create a return log from the requirement and return the returnId', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2026-03-31`])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-04-01')
              })

              it('will create 1 return log, starting and ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2026-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2026-03-31')
              })

              it('will create 1 return log, starting and ending on the licence start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-03-31:2026-03-31`])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-04-01')
              })

              it('will create 1 return log, starting and ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-04-01`])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-05-01')
              })

              it('will create 1 return log, starting on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-05-01:2026-03-31`])
              })
            })

            describe('starts on the end date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2026-03-31')
              })

              it('will create 1 return log, starting and ending on the return version start date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2026-03-31:2026-03-31`])
              })
            })
          })
        })

        describe('and the return requirement is "quarterly"', () => {
          beforeEach(() => {
            returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
          })

          describe('and neither the licence nor the return version start or end during the return cycle', () => {
            it('will create 4 return logs from the requirement and return their returnIds', async () => {
              results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

              const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

              expect(results).to.equal([
                `${returnLogPrefix}:2025-04-01:2025-06-30`,
                `${returnLogPrefix}:2025-07-01:2025-09-30`,
                `${returnLogPrefix}:2025-10-01:2025-12-31`,
                `${returnLogPrefix}:2026-01-01:2026-03-31`
              ])
            })
          })

          describe('and the licence', () => {
            beforeEach(() => {
              // NOTE: We ensure the return version end date is null to test the licence end date condition
              returnRequirement.returnVersion.endDate = null
            })

            describe('ends during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the licence end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('ends on the start date of the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2025-07-01')
              })

              it('will create 2 return logs, the second starting and ending on the licence end date, and return their returnIds', async () => {
                results = await CreateReturnLogsService.go(
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

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.expiredDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(
                  returnRequirement,
                  returnCycle,
                  returnRequirement.returnVersion.licence.expiredDate
                )

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-05-01')
              })

              it('will create 4 return logs, the first starting on the licence start date, and return the returnIds', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-05-01:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-09-30`,
                  `${returnLogPrefix}:2025-10-01:2025-12-31`,
                  `${returnLogPrefix}:2026-01-01:2026-03-31`
                ])
              })
            })

            describe('starts on the end date of the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.licence.startDate = new Date('2025-06-30')
              })

              it('will create 4 return logs, the first starting and ending on the licence start date, and return their returnIds', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-06-30:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-09-30`,
                  `${returnLogPrefix}:2025-10-01:2025-12-31`,
                  `${returnLogPrefix}:2026-01-01:2026-03-31`
                ])
              })
            })
          })

          describe('and the return version', () => {
            describe('ends during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-05-01')
              })

              it('will create 1 return log, ending on the return version end date, and return the returnId', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([`${returnLogPrefix}:2025-04-01:2025-05-01`])
              })
            })

            describe('ends during the return cycle and in the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-07-27')
              })

              it('will create 2 return logs, the second ending on the return version end date and return their returnIds', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-04-01:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-07-27`
                ])
              })
            })

            describe('ends during the return cycle and on the start date of the second quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2025-07-01')
              })

              it('will create 2 return logs, the second starting and ending on the return version end date and return their returnIds', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-04-01:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-07-01`
                ])
              })
            })

            describe('ends before the start date of the return cycle', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.endDate = new Date('2023-05-01')
              })

              it('will return an empty array', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                expect(results).to.be.empty()
              })
            })

            describe('starts during the return cycle and in the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-05-01')
              })

              it('will create 4 return logs, the first starting on the return version start date, and return the returnIds', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-05-01:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-09-30`,
                  `${returnLogPrefix}:2025-10-01:2025-12-31`,
                  `${returnLogPrefix}:2026-01-01:2026-03-31`
                ])
              })
            })

            describe('starts on the end date of the first quarter', () => {
              beforeEach(() => {
                returnRequirement.returnVersion.startDate = new Date('2025-06-30')
              })

              it('will create 4 return logs, the first starting and ending on the return version start date, and return their returnIds', async () => {
                results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

                const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

                expect(results).to.equal([
                  `${returnLogPrefix}:2025-06-30:2025-06-30`,
                  `${returnLogPrefix}:2025-07-01:2025-09-30`,
                  `${returnLogPrefix}:2025-10-01:2025-12-31`,
                  `${returnLogPrefix}:2026-01-01:2026-03-31`
                ])
              })
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
          results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

          const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

          expect(results).to.equal([`${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`])
        })
      })
    })
  })
})
