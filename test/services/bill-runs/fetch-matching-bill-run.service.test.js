'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchMatchingBillRunService = require('../../../app/services/bill-runs/fetch-matching-bill-run.service.js')

describe('Fetch Matching Bill Run service', () => {
  let matchingBillRunId
  let regionId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const region = RegionHelper.select()

    regionId = region.id
  })

  describe('when called', () => {
    describe('with a matching region', () => {
      describe('and the batch type is "annual"', () => {
        describe('and a bill run for the same financial year exists', () => {
          beforeEach(async () => {
            const billRun = await BillRunHelper.add({ regionId, batchType: 'annual', status: 'sent', toFinancialYearEnding: 2024 })

            matchingBillRunId = billRun.id
          })

          it('returns the matching bill run', async () => {
            const results = await FetchMatchingBillRunService.go(regionId, 'annual', 2024)

            expect(results[0].id).to.equal(matchingBillRunId)
          })
        })
      })

      describe('and the batch type is "supplementary"', () => {
        describe('and two bill runs for the same financial year exist', () => {
          const matchingBillRunIds = []

          beforeEach(async () => {
            const billRuns = await Promise.all([
              BillRunHelper.add({
                regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding: 2024, scheme: 'alcs'
              }),
              BillRunHelper.add({
                regionId, batchType: 'supplementary', status: 'queued', toFinancialYearEnding: 2024, scheme: 'sroc'
              })
            ])

            matchingBillRunIds.push(billRuns[0].id)
            matchingBillRunIds.push(billRuns[1].id)
          })

          it('returns the matching bill runs', async () => {
            const results = await FetchMatchingBillRunService.go(regionId, 'supplementary', 2024)

            expect(matchingBillRunIds).includes(results[0].id)
            expect(matchingBillRunIds).includes(results[1].id)
          })
        })
      })

      describe('and the batch type is "two_part_tariff"', () => {
        describe('and the financial year is in the SROC period', () => {
          describe('and a bill run for the same financial year exists', () => {
            beforeEach(async () => {
              const billRun = await BillRunHelper.add({
                regionId, batchType: 'two_part_tariff', status: 'sent', toFinancialYearEnding: 2023
              })

              matchingBillRunId = billRun.id
            })

            it('returns the matching bill run', async () => {
              const results = await FetchMatchingBillRunService.go(regionId, 'two_part_tariff', 2023)

              expect(results[0].id).to.equal(matchingBillRunId)
            })
          })
        })

        describe('and the financial year is in the PRESROC period', () => {
          let matchingSummerBillRunId
          let matchingWinterBillRunId

          beforeEach(async () => {
            let billRun = await BillRunHelper.add({
              regionId, batchType: 'two_part_tariff', status: 'sent', toFinancialYearEnding: 2022, summer: true
            })

            matchingSummerBillRunId = billRun.id

            billRun = await BillRunHelper.add({
              regionId, batchType: 'two_part_tariff', status: 'sent', toFinancialYearEnding: 2022, summer: false
            })
            matchingWinterBillRunId = billRun.id
          })

          describe('and "summer" is set to true', () => {
            describe('and a bill run for the same financial year exists', () => {
              it('returns the matching bill run', async () => {
                const results = await FetchMatchingBillRunService.go(regionId, 'two_part_tariff', 2022, true)

                expect(results[0].id).to.equal(matchingSummerBillRunId)
              })
            })
          })

          describe('and "summer" is set to false', () => {
            describe('and a bill run for the same financial year exists', () => {
              it('returns the matching bill run', async () => {
                const results = await FetchMatchingBillRunService.go(regionId, 'two_part_tariff', 2022, false)

                expect(results[0].id).to.equal(matchingWinterBillRunId)
              })
            })
          })
        })
      })
    })

    describe('and no bill runs match', () => {
      describe('because they do not match the options passed in', () => {
        beforeEach(async () => {
          await BillRunHelper.add({ regionId, batchType: 'annual', status: 'sent', toFinancialYearEnding: 2024 })
        })

        it('returns an empty array', async () => {
          const results = await FetchMatchingBillRunService.go('f1562f43-2548-4ea1-ac89-b8ec2c687996', 'annual', 2024)

          expect(results).to.be.empty()
        })
      })

      describe('because they have a status of "cancel", "empty", or "error"', () => {
        beforeEach(async () => {
          await Promise.all([
            BillRunHelper.add({ regionId, batchType: 'supplementary', status: 'cancel', toFinancialYearEnding: 2024 }),
            BillRunHelper.add({ regionId, batchType: 'supplementary', status: 'empty', toFinancialYearEnding: 2024 }),
            BillRunHelper.add({ regionId, batchType: 'supplementary', status: 'error', toFinancialYearEnding: 2024 })
          ])
        })

        it('returns an empty array', async () => {
          const results = FetchMatchingBillRunService.go(regionId, 'annual', 2024)

          expect(results).to.be.empty()
        })
      })
    })
  })
})
