'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const { determineCurrentFinancialYear } = require('../../../app/lib/general.lib.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLiveBillRunsService = require('../../../app/services/bill-runs/fetch-live-bill-runs.service.js')
const FetchMatchingBillRunService = require('../../../app/services/bill-runs/fetch-matching-bill-run.service.js')

// Thing under test
const DetermineBlockingBillRunService = require('../../../app/services/bill-runs/determine-blocking-bill-run.service.js')

describe('Determine Blocking Bill Run service', () => {
  let batchType
  let billRunId
  let financialEndYear
  let regionId
  let season
  let toFinancialYearEnding

  beforeEach(async () => {
    const { endDate } = determineCurrentFinancialYear()

    toFinancialYearEnding = endDate.getFullYear()

    regionId = generateUUID()
    billRunId = generateUUID()
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when the user is setting up an annual bill run', () => {
    beforeEach(() => {
      batchType = 'annual'
      financialEndYear = toFinancialYearEnding
    })

    describe('and there is a matching bill run', () => {
      beforeEach(async () => {
        Sinon.stub(FetchMatchingBillRunService, 'go').resolves([
          { id: billRunId, regionId, batchType, toFinancialYearEnding }
        ])
      })

      it('returns the matching bill run', async () => {
        const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

        expect(results).to.have.length(1)
        expect(results[0].id).to.equal(billRunId)
      })
    })

    describe('and there is no matching bill run', () => {
      beforeEach(async () => {
        Sinon.stub(FetchMatchingBillRunService, 'go').resolves([])
      })

      describe('but a live bill run exists for the same year', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
            { id: billRunId, regionId, batchType: 'two_part_tariff', toFinancialYearEnding }
          ])
        })

        it('returns the live bill run', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)

          expect(results[0].id).to.equal(billRunId)
        })
      })

      describe('but a live bill run exists for a different year', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
        })

        it('returns no matches', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.be.empty()
        })
      })

      describe('and no live bill runs', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
        })

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
          Sinon.stub(FetchMatchingBillRunService, 'go').resolves([
            { id: billRunId, regionId, batchType, toFinancialYearEnding }
          ])
        })

        it('returns the matching bill run', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRunId)
        })
      })

      describe('and there is no matching bill run', () => {
        describe('but a live bill run exists for the same year', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
              { id: billRunId, regionId, batchType: 'supplementary', toFinancialYearEnding }
            ])
          })

          it('returns the live bill run', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal(billRunId)
          })
        })

        describe('and no live bill runs', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
          })

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
          Sinon.stub(FetchMatchingBillRunService, 'go').resolves([
            { id: billRunId, regionId, batchType, toFinancialYearEnding: 2022 }
          ])
        })

        it('returns the matching bill run', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRunId)
        })
      })

      describe('and there is no matching bill run', () => {
        describe('but a live bill run exists for the same year', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
              { id: billRunId, regionId, batchType: 'supplementary', toFinancialYearEnding: 2022 }
            ])
          })

          it('returns the live bill run', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal(billRunId)
          })
        })

        describe('but a live bill run exists for a different year', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
          })

          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

            expect(results).to.be.empty()
          })
        })

        describe('and no live bill runs', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
          })

          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear, season)

            expect(results).to.be.empty()
          })
        })
      })
    })
  })

  describe('when the user is setting up a supplementary bill run', () => {
    const presrocBillRunId = generateUUID()

    beforeEach(() => {
      batchType = 'supplementary'
      financialEndYear = toFinancialYearEnding
    })

    describe('and there is both an SROC and PRESROC matching bill run', () => {
      beforeEach(async () => {
        Sinon.stub(FetchMatchingBillRunService, 'go').resolves([
          { id: billRunId, regionId, batchType, toFinancialYearEnding },
          { id: presrocBillRunId, regionId, batchType, toFinancialYearEnding: 2022 }
        ])
      })

      it('returns multiple bill run matches', async () => {
        const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

        expect(results).to.have.length(2)
        expect(results[0].id).to.equal(billRunId)
        expect(results[1].id).to.equal(presrocBillRunId)
      })
    })

    describe('and there is only an SROC matching bill run', () => {
      beforeEach(async () => {
        Sinon.stub(FetchMatchingBillRunService, 'go').resolves([
          { id: billRunId, regionId, batchType, toFinancialYearEnding }
        ])
      })

      describe('and no live PRESROC bill runs', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
        })

        it('returns just the single match', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(billRunId)
        })
      })

      describe('and a live PRESROC bill run', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
            { id: billRunId, regionId, batchType, toFinancialYearEnding },
            { id: presrocBillRunId, regionId, batchType: 'two_part_tariff', toFinancialYearEnding: 2022 }
          ])
        })

        it('returns both the matched and live bill runs', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(2)
          expect(results[0].id).to.equal(billRunId)
          expect(results[1].id).to.equal(presrocBillRunId)
        })
      })
    })

    describe('and there is only a PRESROC matching bill run', () => {
      beforeEach(async () => {
        Sinon.stub(FetchMatchingBillRunService, 'go').resolves([
          { id: presrocBillRunId, regionId, batchType, toFinancialYearEnding: 2022 }
        ])
      })

      describe('and no live SROC bill runs', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
        })

        it('returns just the single match', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(presrocBillRunId)
        })
      })

      describe('and a live SROC bill run', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
            { id: billRunId, regionId, batchType: 'two_part_tariff', toFinancialYearEnding },
            { id: presrocBillRunId, regionId, batchType, toFinancialYearEnding: 2022 }
          ])
        })

        it('returns both the matched and live bill runs', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(2)
          expect(results[0].id).to.equal(billRunId)
          expect(results[1].id).to.equal(presrocBillRunId)
        })
      })
    })

    describe('and there is no matching bill run', () => {
      beforeEach(async () => {
        Sinon.stub(FetchMatchingBillRunService, 'go').resolves([])
      })

      describe('but both a live SROC and PRESROC bill run exists', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
            { id: billRunId, regionId, batchType: 'two_part_tariff', toFinancialYearEnding },
            { id: presrocBillRunId, regionId, batchType: 'two_part_tariff', toFinancialYearEnding: 2022 }
          ])
        })

        it('returns both live bill runs', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(2)
          expect(results[0].id).to.equal(billRunId)
          expect(results[1].id).to.equal(presrocBillRunId)
        })
      })

      describe('but a live SROC bill run exists', () => {
        describe('for the same year', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
              { id: billRunId, regionId, batchType: 'annual', toFinancialYearEnding }
            ])
          })

          it('returns just the single match', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.have.length(1)
            expect(results[0].id).to.equal(billRunId)
          })
        })

        describe('for a different year', () => {
          beforeEach(async () => {
            Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
          })

          it('returns no matches', async () => {
            const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

            expect(results).to.be.empty()
          })
        })
      })

      describe('but a live PRESROC bill run exists', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([
            { id: presrocBillRunId, regionId, batchType: 'two_part_tariff', toFinancialYearEnding: 2022 }
          ])
        })

        it('returns just the single match', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.have.length(1)
          expect(results[0].id).to.equal(presrocBillRunId)
        })
      })

      describe('and no live bill runs', () => {
        beforeEach(async () => {
          Sinon.stub(FetchLiveBillRunsService, 'go').resolves([])
        })

        it('returns no matches', async () => {
          const results = await DetermineBlockingBillRunService.go(regionId, batchType, financialEndYear)

          expect(results).to.be.empty()
        })
      })
    })
  })
})
