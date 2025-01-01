'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const DetermineBlockingAnnualService = require('../../../../app/services/bill-runs/setup/determine-blocking-annual.service.js')
const DetermineBlockingSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-supplementary.service.js')
const DetermineBlockingTwoPartAnnualService = require('../../../../app/services/bill-runs/setup/determine-blocking-two-part-annual.service.js')
const DetermineBlockingTwoPartSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-two-part-supplementary.service.js')

// Test helpers
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Thing under test
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')

describe('Bill Runs - Setup - Determine Blocking Bill Run service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()
  const currentFinancialEndYear = currentFinancialYear.endDate.getFullYear()
  const regionId = '9ff20191-f942-4a09-a177-860e37502d4a'

  let session

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is intending to create an annual bill run', () => {
      beforeEach(() => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        session = {
          type: 'annual',
          region: regionId,
          year: '2022',
          season: 'summer'
        }
      })

      describe('and no blocking bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingAnnualService, 'go').resolves({
            matches: [],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.current
          })
        })

        it('returns an empty "matches", "toFinancialYearEnding" is the current financial year end, and "trigger" is current', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.current
          })
        })
      })

      describe('and a blocking bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingAnnualService, 'go').resolves({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.neither
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is neither', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.neither
          })
        })
      })
    })

    describe('and the user is intending to create a two-part tariff annual bill run', () => {
      beforeEach(() => {
        session = {
          type: 'two_part_tariff',
          region: regionId,
          year: 2023,
          season: 'summer'
        }
      })

      describe('and no blocking bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartAnnualService, 'go').resolves({
            matches: [],
            toFinancialYearEnding: 2023,
            trigger: engineTriggers.old
          })
        })

        it('returns an empty "matches", "toFinancialYearEnding" is as selected, and "trigger" is old', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding: 2023,
            trigger: engineTriggers.old
          })
        })
      })

      describe('and a blocking bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartAnnualService, 'go').resolves({
            matches: [{ id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1' }],
            toFinancialYearEnding: 2023,
            trigger: engineTriggers.neither
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is as selected, and "trigger" is neither', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [{ id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1' }],
            toFinancialYearEnding: 2023,
            trigger: engineTriggers.neither
          })
        })
      })
    })

    describe('and the user is intending to create a supplementary bill run', () => {
      beforeEach(() => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        session = {
          type: 'supplementary',
          region: regionId,
          year: '2022',
          season: 'summer'
        }
      })

      describe('and no blocking bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingSupplementaryService, 'go').resolves({
            matches: [],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.both
          })
        })

        it('returns an empty "matches", "toFinancialYearEnding" is the current financial year end, and "trigger" is both', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.both
          })
        })
      })

      describe('and a blocking SROC bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingSupplementaryService, 'go').resolves({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.old
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is old', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.old
          })
        })
      })

      describe('and a blocking PRESROC bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingSupplementaryService, 'go').resolves({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.current
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is current', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.current
          })
        })
      })

      describe('and both a blocking SROC and PRESROC bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingSupplementaryService, 'go').resolves({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }, { id: 'fb837754-7a95-4b39-97d6-2a0694bd912c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.neither
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is neither', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [{ id: '5612815f-9f67-4ac1-b697-d9ab7789274c' }, { id: 'fb837754-7a95-4b39-97d6-2a0694bd912c' }],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.neither
          })
        })
      })
    })

    describe('and the user is intending to create a two-part tariff supplementary bill run', () => {
      beforeEach(() => {
        session = {
          type: 'two_part_supplementary',
          region: regionId,
          year: 2024
        }
      })

      describe('and no blocking bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartSupplementaryService, 'go').resolves({
            matches: [],
            toFinancialYearEnding: 2024,
            trigger: engineTriggers.current
          })
        })

        it('returns an empty "matches", "toFinancialYearEnding" is as selected, and "trigger" is current', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding: 2024,
            trigger: engineTriggers.current
          })
        })
      })

      describe('and a blocking bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartSupplementaryService, 'go').resolves({
            matches: [{ id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1' }],
            toFinancialYearEnding: 2024,
            trigger: engineTriggers.neither
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is as selected, and "trigger" is neither', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [{ id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1' }],
            toFinancialYearEnding: 2024,
            trigger: engineTriggers.neither
          })
        })
      })
    })
  })
})
