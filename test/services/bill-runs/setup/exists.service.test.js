'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/determine-blocking-bill-run.service.js')
const DetermineFinancialYearEndService = require('../../../../app/services/bill-runs/setup/determine-financial-year-end.service.js')

// Thing under test
const ExistsService = require('../../../../app/services/bill-runs/setup/exists.service.js')

describe('Bill Runs Setup Exists service', () => {
  let currentFinancialEndYear
  let setupSession
  let region

  beforeEach(async () => {
    region = RegionHelper.select()

    const { endDate } = determineCurrentFinancialYear()

    currentFinancialEndYear = endDate.getFullYear()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is intending to create a two-part tariff bill run', () => {
      beforeEach(() => {
        setupSession = {
          type: 'two_part_tariff',
          region: region.id,
          year: '2022',
          season: 'summer'
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(2022)
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it('returns an empty "matches", "toFinancialYearEnding" is as selected, and "trigger" is old', async () => {
          const result = await ExistsService.go(setupSession)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding: 2022,
            trigger: engineTriggers.old
          })
        })
      })

      describe('and a matching bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1',
              batchType: 'two_part_tariff',
              billRunNumber: 12345,
              createdAt: new Date('2022-05-01'),
              region,
              scheme: 'alcs',
              status: 'sent',
              summer: true,
              toFinancialYearEnding: 2022
            }
          ])
        })

        it('returns "matches" set, "toFinancialYearEnding" is as selected, and "trigger" is neither', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('dfbbc7ac-b15b-483a-afcf-a7c01ac377d1')
          expect(toFinancialYearEnding).to.equal(2022)
          expect(trigger).to.equal(engineTriggers.neither)
        })
      })
    })

    describe('and the user is intending to create an annual bill run', () => {
      beforeEach(() => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        setupSession = {
          type: 'annual',
          region,
          year: '2022',
          season: 'summer'
        }

        Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(currentFinancialEndYear)
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it('returns an empty "matches", "toFinancialYearEnding" is the current financial year end, and "trigger" is current', async () => {
          const result = await ExistsService.go(setupSession)

          expect(result).to.equal({
            matches: [],
            toFinancialYearEnding: currentFinancialEndYear,
            trigger: engineTriggers.current
          })
        })
      })

      describe('and a matching bill run exists', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: '5612815f-9f67-4ac1-b697-d9ab7789274c',
              batchType: 'annual',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region,
              scheme: 'sroc',
              status: 'sent',
              summer: false,
              toFinancialYearEnding: 2024
            }
          ])
        })

        it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is neither', async () => {
          const result = await ExistsService.go(setupSession)

          const { matches, toFinancialYearEnding, trigger } = result

          expect(matches[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
          expect(trigger).to.equal(engineTriggers.neither)
        })
      })
    })

    describe('and the user is intending to create a supplementary bill run', () => {
      beforeEach(() => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        setupSession = {
          type: 'supplementary',
          region: region.id,
          year: '2022',
          season: 'summer'
        }
      })

      describe('and an annual bill run exists for the same region', () => {
        beforeEach(() => {
          Sinon.stub(DetermineFinancialYearEndService, 'go').resolves(currentFinancialEndYear)
        })

        describe('and no matching bill runs exist', () => {
          beforeEach(() => {
            Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
          })

          it('returns an empty "matches", "toFinancialYearEnding" is the current financial year end, and "trigger" is both', async () => {
            const result = await ExistsService.go(setupSession)

            expect(result).to.equal({
              matches: [],
              toFinancialYearEnding: currentFinancialEndYear,
              trigger: engineTriggers.both
            })
          })
        })

        describe('and one matching bill run exists', () => {
          describe('and it is the SROC "scheme"', () => {
            beforeEach(() => {
              Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
                {
                  id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
                  batchType: 'supplementary',
                  billRunNumber: 12345,
                  createdAt: new Date('2023-05-01'),
                  region,
                  scheme: 'sroc',
                  status: 'ready',
                  summer: false,
                  toFinancialYearEnding: 2024
                }
              ])
            })

            it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is old', async () => {
              const result = await ExistsService.go(setupSession)

              const { matches, toFinancialYearEnding, trigger } = result

              expect(matches[0].id).to.equal('7b8a518b-ee0c-4c12-acfe-3b99f99d4c53')
              expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
              expect(trigger).to.equal(engineTriggers.old)
            })
          })

          describe('and it is the ALCS "scheme"', () => {
            beforeEach(() => {
              Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
                {
                  id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
                  batchType: 'supplementary',
                  billRunNumber: 12345,
                  createdAt: new Date('2021-05-01'),
                  region,
                  scheme: 'alcs',
                  status: 'ready',
                  summer: false,
                  toFinancialYearEnding: 2022
                }
              ])
            })

            it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is current', async () => {
              const result = await ExistsService.go(setupSession)

              const { matches, toFinancialYearEnding, trigger } = result

              expect(matches[0].id).to.equal('7b8a518b-ee0c-4c12-acfe-3b99f99d4c53')
              expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
              expect(trigger).to.equal(engineTriggers.current)
            })
          })
        })

        describe('and two matching bill runs exist', () => {
          beforeEach(() => {
            Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
              {
                id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
                batchType: 'supplementary',
                billRunNumber: 12345,
                createdAt: new Date('2023-05-01'),
                region,
                scheme: 'sroc',
                status: 'ready',
                summer: false,
                toFinancialYearEnding: 2024
              },
              {
                id: '5be625b3-a954-465d-8ab8-cde1b2f052ce',
                batchType: 'supplementary',
                billRunNumber: 12345,
                createdAt: new Date('2023-05-01'),
                region,
                scheme: 'presroc',
                status: 'ready',
                summer: false,
                toFinancialYearEnding: 2024
              }
            ])
          })

          it('returns "matches" set, "toFinancialYearEnding" is the current financial year end, and "trigger" is neither', async () => {
            const result = await ExistsService.go(setupSession)

            const { matches, toFinancialYearEnding, trigger } = result

            expect(['7b8a518b-ee0c-4c12-acfe-3b99f99d4c53', '5be625b3-a954-465d-8ab8-cde1b2f052ce']).includes(
              matches[0].id
            )
            expect(['7b8a518b-ee0c-4c12-acfe-3b99f99d4c53', '5be625b3-a954-465d-8ab8-cde1b2f052ce']).includes(
              matches[1].id
            )
            expect(toFinancialYearEnding).to.equal(currentFinancialEndYear)
            expect(trigger).to.equal(engineTriggers.neither)
          })
        })
      })

      // NOTE: This covers code we've added to stop the team getting pinged every time someone attempts to create a
      // supplementary bill run in a non-prod environment where at least one annual hasn't been generated for the region
      describe('and no annual bill run has ever been generated for the region (non-prod edge case for supplementary)', () => {
        beforeEach(() => {
          Sinon.stub(DetermineFinancialYearEndService, 'go').rejects()
        })

        it('returns an empty "matches", "toFinancialYearEnding" is 0, and "trigger" is neither', async () => {
          const result = await ExistsService.go(setupSession)

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
