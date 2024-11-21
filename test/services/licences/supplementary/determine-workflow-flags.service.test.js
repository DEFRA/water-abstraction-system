'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLicenceService = require('../../../../app/services/licences/supplementary/fetch-licence.service.js')

// Thing under test
const DetermineWorkflowFlagsService = require('../../../../app/services/licences/supplementary/determine-workflow-flags.service.js')

describe('Determine Workflow Flags Service', () => {
  describe('when passed a workflowId', () => {
    const currentFinancialYear = determineCurrentFinancialYear()
    const workflowId = '1c995768-35fe-45c4-bb80-dc242052e94d'

    let licenceData

    afterEach(() => {
      Sinon.restore()
    })

    describe('for a licence that is already flagged', () => {
      before(() => {
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

        Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineWorkflowFlagsService.go(workflowId)

        expect(result.licenceId).to.equal('fee406be-d710-4c14-a4a4-9fd43dc9c5bc')
        expect(result.regionId).to.equal('06661d63-a70e-4cc2-bb6f-7b2a7e9607cc')
        expect(result.startDate).to.equal(new Date('2024-01-01'))
        expect(result.endDate).to.equal(currentFinancialYear.endDate)
      })

      describe('and has no charge versions', () => {
        before(() => {
          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService.go(workflowId)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('and has sroc charge versions', () => {
        describe('and an annual bill run has not been sent while the licence was in workflow', () => {
          before(() => {
            licenceData.sroc_charge_versions = true
            Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService.go(workflowId)

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })

        describe('and an annual bill run has been sent while the licence was in workflow', () => {
          before(async () => {
            await BillRunHelper.add({
              regionId: '06661d63-a70e-4cc2-bb6f-7b2a7e9607cc',
              status: 'sent',
              batchType: 'annual'
            })

            Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService.go(workflowId)

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })
      })

      describe('and has two-part tariff charge versions', () => {
        before(() => {
          licenceData.two_part_tariff_charge_versions = true
          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService.go(workflowId)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
        })
      })
    })

    describe('for a licence that is not already flagged', () => {
      before(() => {
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

        Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineWorkflowFlagsService.go(workflowId)

        expect(result.licenceId).to.equal('fee406be-d710-4c14-a4a4-9fd43dc9c5bc')
        expect(result.regionId).to.equal('27fc9c25-2031-454b-bdae-0aa4ce566eac')
        expect(result.startDate).to.equal(new Date('2024-01-01'))
        expect(result.endDate).to.equal(currentFinancialYear.endDate)
      })

      describe('and has no charge versions', () => {
        before(() => {
          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService.go(workflowId)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('and has sroc charge versions', () => {
        describe('and an annual bill run has not been sent while the licence was in workflow', () => {
          before(() => {
            licenceData.sroc_charge_versions = true
            Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService.go(workflowId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(false)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })

        describe('and an annual bill run has been sent while the licence was in workflow', () => {
          before(async () => {
            await BillRunHelper.add({
              regionId: '27fc9c25-2031-454b-bdae-0aa4ce566eac',
              status: 'sent',
              batchType: 'annual'
            })

            Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
          })

          it('returns the correct flags', async () => {
            const result = await DetermineWorkflowFlagsService.go(workflowId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })
      })

      describe('and has two-part tariff charge versions', () => {
        before(() => {
          licenceData.two_part_tariff_charge_versions = true
          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineWorkflowFlagsService.go(workflowId)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
        })
      })

      describe('for a licence that has ended', () => {
        before(() => {
          licenceData.ended = true
          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('returns the unchanged flags', async () => {
          const result = await DetermineWorkflowFlagsService.go(workflowId)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })
  })
})
