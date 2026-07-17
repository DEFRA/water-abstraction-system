// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import * as DetermineBlockingBillRunService from '../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js'
import SessionModel from '../../../../app/models/session.model.js'

// Thing under test
import CheckService from '../../../../app/services/bill-runs/setup/check.service.js'

// NOTE: We have broken our normal pattern for tests of services that provide formatted page data. Because of the number
// of scenarios that need to be covered for this service, we've broken up the presenter logic. This means the tests for
// those don't provide an overview of those scenarios. To ensure we don't lose sight of them, we instead add them here.
//
// It does result in duplication of the presenter tests (to an degree), but this is considered acceptable.
describe('Bill Runs - Setup - Check service', () => {
  const region = { id: '292fe1c3-c9d4-47dd-a01b-0ac916497af5', displayName: 'Avalon' }
  const sessionId = '4bcb28c5-95ae-487c-8f13-ac71ec3c5ff6'

  let session

  beforeEach(async () => {
    session = { id: sessionId, region: region.id, regionName: region.displayName }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('for an annual bill run', () => {
      beforeEach(() => {
        session.type = 'annual'

        vi.spyOn(SessionModel, 'query').mockReturnValue({
          findById: vi.fn().mockResolvedValue(session)
        })
      })

      describe('and there is no existing blocking bill run', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
            matches: [],
            toFinancialYearEnding: 2025,
            trigger: engineTriggers.current
          })
        })

        it('returns the data needed to review and create the bill run', async () => {
          const result = await CheckService(session.id)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backLink: `/system/bill-runs/setup/${sessionId}/region`,
            billRunLink: null,
            billRunNumber: null,
            billRunStatus: null,
            billRunType: 'Annual',
            chargeScheme: 'Current',
            dateCreated: null,
            financialYearEnd: 2025,
            pageTitle: 'Check the bill run to be created',
            regionName: 'Avalon',
            sessionId,
            showCreateButton: true,
            warningMessage: null
          })
        })
      })

      describe('and there is an existing blocking bill run', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
            matches: [
              {
                id: 'c0608545-9870-4605-a407-5ff49f8a5182',
                batchType: 'annual',
                billRunNumber: 12345,
                createdAt: new Date('2024-05-01'),
                region,
                scheme: 'sroc',
                status: 'sent',
                summer: false,
                toFinancialYearEnding: 2025
              }
            ],
            toFinancialYearEnding: 2025,
            trigger: engineTriggers.neither
          })
        })

        it('returns the data needed to confirm why the bill run cannot be created', async () => {
          const result = await CheckService(session.id)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backLink: `/system/bill-runs/setup/${sessionId}/region`,
            billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
            billRunNumber: 12345,
            billRunStatus: 'sent',
            billRunType: 'Annual',
            chargeScheme: 'Current',
            dateCreated: '1 May 2024',
            financialYearEnd: 2025,
            pageTitle: 'This bill run already exists',
            regionName: 'Avalon',
            sessionId,
            showCreateButton: false,
            warningMessage: 'You can only have one Annual bill run per region in a financial year'
          })
        })
      })
    })

    describe('for a two-part tariff annual bill run', () => {
      beforeEach(() => {
        session.type = 'two_part_tariff'
      })

      describe('and an SROC year', () => {
        beforeEach(() => {
          session.year = '2024'

          vi.spyOn(SessionModel, 'query').mockReturnValue({
            findById: vi.fn().mockResolvedValue(session)
          })
        })

        describe('and there is no existing blocking bill run', () => {
          beforeEach(() => {
            vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
              matches: [],
              toFinancialYearEnding: Number(session.year),
              trigger: engineTriggers.current
            })
          })

          it('returns the data needed to review and create the bill run', async () => {
            const result = await CheckService(session.id)

            expect(result).toEqual({
              activeNavBar: 'bill-runs',
              backLink: `/system/bill-runs/setup/${sessionId}/year`,
              billRunLink: null,
              billRunNumber: null,
              billRunStatus: null,
              billRunType: 'Two-part tariff',
              chargeScheme: 'Current',
              dateCreated: null,
              financialYearEnd: 2024,
              pageTitle: 'Check the bill run to be created',
              regionName: 'Avalon',
              sessionId,
              showCreateButton: true,
              warningMessage: null
            })
          })
        })

        describe('and there is an existing blocking bill run', () => {
          beforeEach(() => {
            vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
              matches: [
                {
                  id: 'c0608545-9870-4605-a407-5ff49f8a5182',
                  batchType: 'two_part_tariff',
                  billRunNumber: 12345,
                  createdAt: new Date('2024-05-01'),
                  region,
                  scheme: 'sroc',
                  status: 'sent',
                  summer: false,
                  toFinancialYearEnding: Number(session.year)
                }
              ],
              toFinancialYearEnding: Number(session.year),
              trigger: engineTriggers.neither
            })
          })

          it('returns the data needed to confirm why the bill run cannot be created', async () => {
            const result = await CheckService(session.id)

            expect(result).toEqual({
              activeNavBar: 'bill-runs',
              backLink: `/system/bill-runs/setup/${sessionId}/year`,
              billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
              billRunNumber: 12345,
              billRunStatus: 'sent',
              billRunType: 'Two-part tariff',
              chargeScheme: 'Current',
              dateCreated: '1 May 2024',
              financialYearEnd: 2024,
              pageTitle: 'This bill run already exists',
              regionName: 'Avalon',
              sessionId,
              showCreateButton: false,
              warningMessage: 'You can only have one Two-part tariff bill run per region in a financial year'
            })
          })
        })
      })

      describe('and a PRESROC year', () => {
        beforeEach(() => {
          session.year = '2022'
          session.season = 'winter_all_year'

          vi.spyOn(SessionModel, 'query').mockReturnValue({
            findById: vi.fn().mockResolvedValue(session)
          })
        })

        describe('and there is no existing blocking bill run', () => {
          beforeEach(() => {
            vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
              matches: [],
              toFinancialYearEnding: 2022,
              trigger: engineTriggers.old
            })
          })

          it('returns the data needed to review and create the bill run', async () => {
            const result = await CheckService(session.id)

            expect(result).toEqual({
              activeNavBar: 'bill-runs',
              backLink: `/system/bill-runs/setup/${sessionId}/season`,
              billRunLink: null,
              billRunNumber: null,
              billRunStatus: null,
              billRunType: 'Two-part tariff winter and all year',
              chargeScheme: 'Old',
              dateCreated: null,
              financialYearEnd: 2022,
              pageTitle: 'Check the bill run to be created',
              regionName: 'Avalon',
              sessionId,
              showCreateButton: true,
              warningMessage: null
            })
          })
        })

        describe('and there is an existing blocking bill run', () => {
          beforeEach(() => {
            vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
              matches: [
                {
                  id: 'c0608545-9870-4605-a407-5ff49f8a5182',
                  batchType: 'two_part_tariff',
                  billRunNumber: 12345,
                  createdAt: new Date('2024-05-01'),
                  region,
                  scheme: 'alcs',
                  status: 'sent',
                  summer: false,
                  toFinancialYearEnding: Number(session.year)
                }
              ],
              toFinancialYearEnding: Number(session.year),
              trigger: engineTriggers.neither
            })
          })

          it('returns the data needed to confirm why the bill run cannot be created', async () => {
            const result = await CheckService(session.id)

            expect(result).toEqual({
              activeNavBar: 'bill-runs',
              backLink: `/system/bill-runs/setup/${sessionId}/season`,
              billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
              billRunNumber: 12345,
              billRunStatus: 'sent',
              billRunType: 'Two-part tariff winter and all year',
              chargeScheme: 'Old',
              dateCreated: '1 May 2024',
              financialYearEnd: 2022,
              pageTitle: 'This bill run already exists',
              regionName: 'Avalon',
              sessionId,
              showCreateButton: false,
              warningMessage:
                'You can only have one Two-part tariff winter and all year bill run per region in a financial year'
            })
          })
        })
      })
    })

    describe('for a supplementary bill run', () => {
      beforeEach(() => {
        session.type = 'supplementary'

        vi.spyOn(SessionModel, 'query').mockReturnValue({
          findById: vi.fn().mockResolvedValue(session)
        })
      })

      describe('and there are no existing blocking bill runs', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
            matches: [],
            toFinancialYearEnding: 2025,
            trigger: engineTriggers.both
          })
        })

        it('returns the data needed to review and create the bill run', async () => {
          const result = await CheckService(session.id)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backLink: `/system/bill-runs/setup/${sessionId}/region`,
            billRunLink: null,
            billRunNumber: null,
            billRunStatus: null,
            billRunType: 'Supplementary',
            chargeScheme: 'Both',
            dateCreated: null,
            financialYearEnd: 2025,
            pageTitle: 'Check the bill run to be created',
            regionName: 'Avalon',
            sessionId,
            showCreateButton: true,
            warningMessage: null
          })
        })
      })

      describe('and there are existing blocking bill runs for both schemes', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
            matches: [
              {
                id: 'c0608545-9870-4605-a407-5ff49f8a5182',
                batchType: 'supplementary',
                billRunNumber: 12345,
                createdAt: new Date('2024-05-01'),
                region,
                scheme: 'sroc',
                status: 'ready',
                toFinancialYearEnding: 2025
              },
              {
                id: '553886a6-0235-454b-a9ef-06ffc501c861',
                batchType: 'supplementary',
                billRunNumber: 12344,
                createdAt: new Date('2024-05-01'),
                region,
                scheme: 'alcs',
                status: 'ready',
                toFinancialYearEnding: 2022
              }
            ],
            toFinancialYearEnding: 2025,
            trigger: engineTriggers.neither
          })
        })

        it('returns the data needed to confirm why the bill runs cannot be created', async () => {
          const result = await CheckService(session.id)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backLink: `/system/bill-runs/setup/${sessionId}/region`,
            billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
            billRunNumber: 12345,
            billRunStatus: 'ready',
            billRunType: 'Supplementary',
            chargeScheme: 'Current',
            dateCreated: '1 May 2024',
            financialYearEnd: 2025,
            pageTitle: 'This bill run is blocked',
            regionName: 'Avalon',
            sessionId,
            showCreateButton: false,
            warningMessage: 'You need to confirm or cancel the existing bill run before you can create a new one'
          })
        })
      })

      describe('and there is an existing blocking PRESROC bill run', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
            matches: [
              {
                id: 'c0608545-9870-4605-a407-5ff49f8a5182',
                batchType: 'supplementary',
                billRunNumber: 12345,
                createdAt: new Date('2024-05-01'),
                region,
                scheme: 'alcs',
                status: 'ready',
                toFinancialYearEnding: 2022
              }
            ],
            toFinancialYearEnding: 2025,
            trigger: engineTriggers.current
          })
        })

        it('returns the data needed to review and create the "current" SROC bill run', async () => {
          const result = await CheckService(session.id)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backLink: `/system/bill-runs/setup/${sessionId}/region`,
            billRunLink: null,
            billRunNumber: null,
            billRunStatus: null,
            billRunType: 'Supplementary',
            chargeScheme: 'Current',
            dateCreated: null,
            financialYearEnd: 2025,
            pageTitle: 'Check the bill run to be created',
            regionName: 'Avalon',
            sessionId,
            showCreateButton: true,
            warningMessage: null
          })
        })
      })

      describe('and there is an existing blocking SROC bill run', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
            matches: [
              {
                id: 'c0608545-9870-4605-a407-5ff49f8a5182',
                batchType: 'supplementary',
                billRunNumber: 12345,
                createdAt: new Date('2024-05-01'),
                region,
                scheme: 'sroc',
                status: 'ready',
                toFinancialYearEnding: 2025
              }
            ],
            toFinancialYearEnding: 2022,
            trigger: engineTriggers.old
          })
        })

        it('returns the data needed to review and create the "old" PRESROC bill run', async () => {
          const result = await CheckService(session.id)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backLink: `/system/bill-runs/setup/${sessionId}/region`,
            billRunLink: null,
            billRunNumber: null,
            billRunStatus: null,
            billRunType: 'Supplementary',
            chargeScheme: 'Old',
            dateCreated: null,
            financialYearEnd: 2022,
            pageTitle: 'Check the bill run to be created',
            regionName: 'Avalon',
            sessionId,
            showCreateButton: true,
            warningMessage: null
          })
        })
      })

      // NOTE: These would never happen in a 'real' environment
      describe('Non-production scenarios (do not exist in production)', () => {
        describe('when there are no matches to block the bill runs', () => {
          // In production all regions have 'sent' annual bill runs so a result would always be found to get a financial
          // year from
          describe('but the financial year could not be determined (no annual bill runs for the region)', () => {
            beforeEach(() => {
              vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
                matches: [],
                toFinancialYearEnding: 0,
                trigger: engineTriggers.neither
              })
            })

            it('returns the data needed to confirm why the bill run cannot be created', async () => {
              const result = await CheckService(session.id)

              expect(result).toEqual({
                activeNavBar: 'bill-runs',
                backLink: `/system/bill-runs/setup/${sessionId}/region`,
                billRunLink: null,
                billRunNumber: null,
                billRunStatus: null,
                billRunType: 'Supplementary',
                chargeScheme: 'Current',
                dateCreated: null,
                financialYearEnd: null,
                pageTitle: 'This bill run is blocked',
                regionName: 'Avalon',
                sessionId,
                showCreateButton: false,
                warningMessage:
                  'You cannot create a supplementary bill run for this region until you have created an annual bill run'
              })
            })
          })

          // In production all regions have 'sent' annual bill runs for the SROC years. At worst it could be that this
          // years SROC annual has not been run, so last year's is the latest. But never only PRESROC.
          describe('but the financial year determined as 2022 (last annual for the region was for FY 2022)', () => {
            beforeEach(() => {
              vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue({
                matches: [],
                toFinancialYearEnding: 2022,
                trigger: engineTriggers.old
              })
            })

            it('returns the data needed to review and create the "old" PRESROC bill run', async () => {
              const result = await CheckService(session.id)

              expect(result).toEqual({
                activeNavBar: 'bill-runs',
                backLink: `/system/bill-runs/setup/${sessionId}/region`,
                billRunLink: null,
                billRunNumber: null,
                billRunStatus: null,
                billRunType: 'Supplementary',
                chargeScheme: 'Old',
                dateCreated: null,
                financialYearEnd: 2022,
                pageTitle: 'Check the bill run to be created',
                regionName: 'Avalon',
                sessionId,
                showCreateButton: true,
                warningMessage: null
              })
            })
          })
        })
      })
    })
  })
})
