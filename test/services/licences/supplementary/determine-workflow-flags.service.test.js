// Test framework dependencies

// Test helpers
import * as BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import { determineCurrentFinancialYear } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import FetchLicenceService from '../../../../app/services/licences/supplementary/fetch-licence.service.js'

// Thing under test
import DetermineWorkflowFlagsService from '../../../../app/services/licences/supplementary/determine-workflow-flags.service.js'

describe('Determine Workflow Flags Service', () => {
  describe('when passed a workflowId', () => {
    const currentFinancialYear = determineCurrentFinancialYear()
    const workflowId = '1c995768-35fe-45c4-bb80-dc242052e94d'

    let licenceData

    afterEach(() => {
      vi.restoreAllMocks()
    })

    describe('for a licence that is already flagged', () => {
      beforeAll(() => {
        licenceData = {
          id: 'fee406be-d710-4c14-a4a4-9fd43dc9c5bc',
          region_id: '06661d63-a70e-4cc2-bb6f-7b2a7e9607cc',
          created_at: new Date('2024-01-01'),
          include_in_presroc_billing: 'yes',
          include_in_sroc_billing: true,
          ended: false,
          two_part_tariff_charge_versions: false,
          sroc_charge_versions: false
        }

        vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
        FetchLicenceService.mockResolvedValue(licenceData)
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineWorkflowFlagsService(workflowId)

        expect(result.licenceId).toEqual('fee406be-d710-4c14-a4a4-9fd43dc9c5bc')
        expect(result.regionId).toEqual('06661d63-a70e-4cc2-bb6f-7b2a7e9607cc')
        expect(result.startDate).toEqual(new Date('2024-01-01'))
        expect(result.endDate).toEqual(currentFinancialYear.endDate)
      })

      describe('and has no charge versions', () => {
        beforeAll(() => {
          vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
          FetchLicenceService.mockResolvedValue(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService(workflowId)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('and has sroc charge versions', () => {
        describe('and an annual bill run has not been sent while the licence was in workflow', () => {
          beforeAll(() => {
            licenceData.sroc_charge_versions = true
            vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
            FetchLicenceService.mockResolvedValue(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService(workflowId)

            expect(result.flagForPreSrocSupplementary).toEqual(true)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })

        describe('and an annual bill run has been sent while the licence was in workflow', () => {
          beforeAll(async () => {
            await BillRunHelper.add({
              regionId: '06661d63-a70e-4cc2-bb6f-7b2a7e9607cc',
              status: 'sent',
              batchType: 'annual'
            })

            vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
            FetchLicenceService.mockResolvedValue(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService(workflowId)

            expect(result.flagForPreSrocSupplementary).toEqual(true)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })
      })

      describe('and has two-part tariff charge versions', () => {
        beforeAll(() => {
          licenceData.two_part_tariff_charge_versions = true
          vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
          FetchLicenceService.mockResolvedValue(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService(workflowId)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
        })
      })
    })

    describe('for a licence that is not already flagged', () => {
      beforeAll(() => {
        licenceData = {
          id: 'fee406be-d710-4c14-a4a4-9fd43dc9c5bc',
          region_id: '27fc9c25-2031-454b-bdae-0aa4ce566eac',
          created_at: new Date('2024-01-01'),
          include_in_presroc_billing: 'no',
          include_in_sroc_billing: false,
          ended: false,
          two_part_tariff_charge_versions: false,
          sroc_charge_versions: false
        }

        vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
        FetchLicenceService.mockResolvedValue(licenceData)
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineWorkflowFlagsService(workflowId)

        expect(result.licenceId).toEqual('fee406be-d710-4c14-a4a4-9fd43dc9c5bc')
        expect(result.regionId).toEqual('27fc9c25-2031-454b-bdae-0aa4ce566eac')
        expect(result.startDate).toEqual(new Date('2024-01-01'))
        expect(result.endDate).toEqual(currentFinancialYear.endDate)
      })

      describe('and has no charge versions', () => {
        beforeAll(() => {
          vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
          FetchLicenceService.mockResolvedValue(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService(workflowId)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('and has sroc charge versions', () => {
        describe('and an annual bill run has not been sent while the licence was in workflow', () => {
          beforeAll(() => {
            licenceData.sroc_charge_versions = true
            vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
            FetchLicenceService.mockResolvedValue(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService(workflowId)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(false)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })

        describe('and an annual bill run has been sent while the licence was in workflow', () => {
          beforeAll(async () => {
            await BillRunHelper.add({
              regionId: '27fc9c25-2031-454b-bdae-0aa4ce566eac',
              status: 'sent',
              batchType: 'annual'
            })

            vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
            FetchLicenceService.mockResolvedValue(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService(workflowId)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })
      })

      describe('and has two-part tariff charge versions', () => {
        beforeAll(() => {
          licenceData.two_part_tariff_charge_versions = true
          vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
          FetchLicenceService.mockResolvedValue(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService(workflowId)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
        })
      })

      describe('for a licence that has ended', () => {
        beforeAll(() => {
          licenceData.ended = true
          vi.mock('../../../../app/services/licences/supplementary/fetch-licence.service.js')
          FetchLicenceService.mockResolvedValue(licenceData)
        })

        it('returns the unchanged flags', async () => {
          const result = await DetermineWorkflowFlagsService(workflowId)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })
  })
})
