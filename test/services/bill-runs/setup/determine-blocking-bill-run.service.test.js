'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const DetermineBlockingAnnualService = require('../../../../app/services/bill-runs/setup/determine-blocking-annual.service.js')
const DetermineBlockingSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-supplementary.service.js')
const DetermineBlockingTwoPartAnnualService = require('../../../../app/services/bill-runs/setup/determine-blocking-two-part-annual.service.js')
const DetermineBlockingTwoPartSupplementaryService = require('../../../../app/services/bill-runs/setup/determine-blocking-two-part-supplementary.service.js')
const DetermineFinancialYearEndService = require('../../../../app/services/bill-runs/setup/determine-financial-year-end.service.js')

// Thing under test
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')

describe('Bill Runs Setup Determine Blocking Bill Run service', () => {
  const regionId = '9ff20191-f942-4a09-a177-860e37502d4a'
  const currentFinancialEndYear = 2025

  let toFinancialYearEnding = 2025
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

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(currentFinancialEndYear)
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

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
          expect(trigger).to.equal(engineTriggers.neither)
        })
      })
    })

    describe('and the user is intending to create a two-part tariff annual bill run', () => {
      beforeEach(() => {
        toFinancialYearEnding = 2022

        session = {
          type: 'two_part_tariff',
          region: regionId,
          year: toFinancialYearEnding,
          season: 'summer'
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(toFinancialYearEnding)
      })

      describe('and no blocking bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartAnnualService, 'go').resolves({
            matches: [],
            toFinancialYearEnding,
            trigger: engineTriggers.old
          })
        })

        it('returns an empty "matches", "toFinancialYearEnding" is as selected, and "trigger" is old', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding,
            trigger: engineTriggers.old
          })
        })
      })

      describe('and a blocking bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartAnnualService, 'go').resolves({
            matches: [{ id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1' }],
            toFinancialYearEnding,
            trigger: engineTriggers.neither
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is as selected, and "trigger" is neither', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('dfbbc7ac-b15b-483a-afcf-a7c01ac377d1')
          expect(toFinancialYearEnding).to.equal(2022)
          expect(trigger).to.equal(engineTriggers.neither)
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

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(currentFinancialEndYear)
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

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
          expect(trigger).to.equal(engineTriggers.old)
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

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
          expect(trigger).to.equal(engineTriggers.current)
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

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(matches[1].id).to.equal('fb837754-7a95-4b39-97d6-2a0694bd912c')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
          expect(trigger).to.equal(engineTriggers.neither)
        })
      })
    })

    describe('and the user is intending to create a two-part tariff supplementary bill run', () => {
      beforeEach(() => {
        toFinancialYearEnding = 2024

        session = {
          type: 'two_part_supplementary',
          region: regionId,
          year: toFinancialYearEnding
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(toFinancialYearEnding)
      })

      describe('and no blocking bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartSupplementaryService, 'go').resolves({
            matches: [],
            toFinancialYearEnding,
            trigger: engineTriggers.current
          })
        })

        it('returns an empty "matches", "toFinancialYearEnding" is as selected, and "trigger" is current', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding,
            trigger: engineTriggers.current
          })
        })
      })

      describe('and a blocking bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingTwoPartSupplementaryService, 'go').resolves({
            matches: [{ id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1' }],
            toFinancialYearEnding,
            trigger: engineTriggers.neither
          })
        })

        it('returns "matches" set, "toFinancialYearEnding" is as selected, and "trigger" is neither', async () => {
          const result = await DetermineBlockingBillRunService.go(session)

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('dfbbc7ac-b15b-483a-afcf-a7c01ac377d1')
          expect(toFinancialYearEnding).to.equal(2024)
          expect(trigger).to.equal(engineTriggers.neither)
        })
      })
    })

    // NOTE: This covers code we've added to stop the team getting pinged every time someone attempts to create a
    // supplementary bill run in a non-prod environment where at least one annual hasn't been generated for the region
    describe('(non-prod edge case for supplementary)', () => {
      describe('and the user is intending to create a supplementary bill run', () => {
        describe('and no annual bill run has ever been generated for the region (non-prod edge case for supplementary)', () => {
          beforeEach(() => {
            Sinon.stub(DetermineFinancialYearEndService, 'go').rejects()
          })

          it('returns an empty "matches", "toFinancialYearEnding" is 0, and "trigger" is neither', async () => {
            const result = await DetermineBlockingBillRunService.go(session)

            expect(result).to.equal({
              matches: [],
              toFinancialYearEnding: 0,
              trigger: engineTriggers.neither
            })
          })
        })
      })
    })
  })
})
