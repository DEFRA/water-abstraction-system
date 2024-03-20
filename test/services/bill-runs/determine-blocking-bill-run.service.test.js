'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')

describe('Bill Runs Setup Determine Blocking Bill Run service', () => {
  let batchType
  let financialEndYear
  let regionId
  let season
  let toFinancialYearEnding

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const { endDate } = determineCurrentFinancialYear()
    toFinancialYearEnding = endDate.getFullYear()

    const region = await RegionHelper.add()
    regionId = region.id
  })

  describe('when the user is setting up an annual bill run', () => {
    beforeEach(() => {
      batchType = 'annual'
      financialEndYear = toFinancialYearEnding
    })

    describe('and there is a matching bill run', () => {
      beforeEach(async () => {
        await Promise.all([
          BillRunHelper.add({
            id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'annual', status: 'ready', toFinancialYearEnding, scheme: 'sroc'
          })
        ])
      })

      it('returns the matching bill run', async () => {
        const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

        expect(results).to.have.length(1)
        expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
      })
    })

    describe('and there is no matching bill run', () => {
      describe('but a live bill run exists for the same year', () => {
        beforeEach(async () => {
          await BillRunHelper.add({
            id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding, scheme: 'sroc'
          })
        })

        it('returns the live bill run', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })

      describe('but a live bill run exists for a different year', () => {
        beforeEach(async () => {
          await BillRunHelper.add({
            id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding: toFinancialYearEnding - 1, scheme: 'sroc'
          })
        })

        it('returns no matches', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.be.empty()
        })
      })

      describe('and no live bill runs', () => {
        it('returns no matches', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.be.empty()
        })
      })
    })
  })

  describe('when the user is setting up a two-part tariff bill run', () => {
    describe('for the current financial year', () => {
      beforeEach(() => {
        batchType = 'two_part_tariff'
        financialEndYear = toFinancialYearEnding
      })

      describe('and there is a matching bill run', () => {
        beforeEach(async () => {
          await Promise.all([
            BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding, scheme: 'sroc'
            })
          ])
        })

        it('returns the matching bill run', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })

      describe('and there is no matching bill run', () => {
        describe('but a live bill run exists for the same year', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding, scheme: 'sroc'
            })
          })

          it('returns the live bill run', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
          })
        })

        describe('and no live bill runs', () => {
          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.be.empty()
          })
        })
      })
    })

    describe('for a PRESROC year', () => {
      beforeEach(() => {
        batchType = 'two_part_tariff'
        financialEndYear = 2022
        season = 'summer'
      })

      describe('and there is a matching bill run', () => {
        beforeEach(async () => {
          await Promise.all([
            BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding: 2022, summer: true, scheme: 'alcs'
            })
          ])
        })

        it('returns the matching bill run', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })

      describe('and there is no matching bill run', () => {
        describe('but a live bill run exists for the same year', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding: 2022, scheme: 'alcs'
            })
          })

          it('returns the live bill run', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
          })
        })

        describe('but a live bill run exists for a different year', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'annual', status: 'ready', toFinancialYearEnding: toFinancialYearEnding - 1, scheme: 'sroc'
            })
          })

          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

            expect(results).to.be.empty()
          })
        })

        describe('and no live bill runs', () => {
          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

            expect(results).to.be.empty()
          })
        })
      })
    })
  })

  describe('when the user is setting up a supplementary bill run', () => {
    beforeEach(() => {
      batchType = 'supplementary'
      financialEndYear = toFinancialYearEnding
    })

    describe('and there is both an SROC and PRESROC matching bill run', () => {
      beforeEach(async () => {
        await Promise.all([
          BillRunHelper.add({
            id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding, scheme: 'sroc'
          }),
          BillRunHelper.add({
            id: 'b65bb671-8961-4d0c-93f4-d19e1998e778', regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding: 2022, scheme: 'alcs'
          })
        ])
      })

      it('returns multiple bill run matches', async () => {
        const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

        expect(results).to.have.length(2)
        expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        expect(results[1].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
      })
    })

    describe('and there is only an SROC matching bill run', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding, scheme: 'sroc'
        })
      })

      describe('and no live PRESROC bill runs', () => {
        it('returns just the single match', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })

      describe('and a live PRESROC bill run', () => {
        beforeEach(async () => {
          await BillRunHelper.add({
            id: 'b65bb671-8961-4d0c-93f4-d19e1998e778', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding: 2022, scheme: 'alcs'
          })
        })

        it('returns both the matched and live bill runs', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(2)
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
          expect(results[1].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
        })
      })
    })

    describe('and there is only a PRESROC matching bill run', () => {
      beforeEach(async () => {
        await BillRunHelper.add({
          id: 'b65bb671-8961-4d0c-93f4-d19e1998e778', regionId, batchType: 'supplementary', status: 'ready', toFinancialYearEnding: 2022, scheme: 'alcs'
        })
      })

      describe('and no live SROC bill runs', () => {
        it('returns just the single match', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
        })
      })

      describe('and a live SROC bill run', () => {
        beforeEach(async () => {
          await BillRunHelper.add({
            id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding, scheme: 'sroc'
          })
        })

        it('returns both the matched and live bill runs', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(2)
          expect(results[1].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
          expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
        })
      })
    })

    describe('and there is no matching bill run', () => {
      describe('but both a live SROC and PRESROC bill run exists', () => {
        beforeEach(async () => {
          await Promise.all([
            BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'annual', status: 'processing', toFinancialYearEnding, scheme: 'sroc'
            }),
            BillRunHelper.add({
              id: 'b65bb671-8961-4d0c-93f4-d19e1998e778', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding: 2022, scheme: 'alcs'
            })
          ])
        })
      })

      describe('but a live SROC bill run exists', () => {
        describe('for the same year', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'annual', status: 'processing', toFinancialYearEnding, scheme: 'sroc'
            })

            it('returns just the single match', async () => {
              const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

              expect(results).to.have.length(1)
              expect(results[0].id).to.equal('1021c5bc-673c-48fa-98dd-733b46c84f90')
            })
          })
        })

        describe('for a different year', () => {
          beforeEach(async () => {
            await BillRunHelper.add({
              id: '1021c5bc-673c-48fa-98dd-733b46c84f90', regionId, batchType: 'annual', status: 'processing', toFinancialYearEnding: toFinancialYearEnding - 1, scheme: 'sroc'
            })
          })

          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.be.empty()
          })
        })
      })

      describe('but a live PRESROC bill run exists', () => {
        beforeEach(async () => {
          await BillRunHelper.add({
            id: 'b65bb671-8961-4d0c-93f4-d19e1998e778', regionId, batchType: 'two_part_tariff', status: 'review', toFinancialYearEnding: 2022, scheme: 'alcs'
          })

          it('returns just the single match', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal('b65bb671-8961-4d0c-93f4-d19e1998e778')
          })
        })
      })

      describe('and no live bill runs', () => {
        it('returns no matches', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.be.empty()
        })
      })
    })
  })
})
