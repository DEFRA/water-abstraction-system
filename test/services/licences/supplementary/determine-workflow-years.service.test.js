'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')

// Things we need to stub
const FetchLicenceService = require('../../../../app/services/licences/supplementary/fetch-licence.service.js')

// Thing under test
const DetermineWorkflowYearsService = require('../../../../app/services/licences/supplementary/determine-workflow-years.service.js')

describe('Determine Workflow Years Service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()
  const workflowId = '1c995768-35fe-45c4-bb80-dc242052e94d'

  let licence
  let licenceData

  before(async () => {
    licence = await LicenceHelper.add()
    licenceData = {
      include_in_sroc_billing: false,
      id: licence.id,
      region_id: licence.regionId,
      sroc_charge_versions: false,
      two_part_tariff_charge_versions: false,
      created_at: new Date('2024-04-01')
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when passed a workflowId', () => {
    describe('that relates to a licence with no sroc charge versions', () => {
      beforeEach(async () => {
        Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
      })

      it('returns flagForBilling and twoPartTariff as false', async () => {
        const result = await DetermineWorkflowYearsService.go(workflowId)

        expect(result.twoPartTariff).to.equal(false)
        expect(result.flagForBilling).to.equal(false)
      })

      it('does not flag the licence for sroc supplementary billing', async () => {
        await DetermineWorkflowYearsService.go(workflowId)

        const result = await LicenceModel.query().findById(licence.id)

        expect(result.includeInSrocBilling).to.equal(false)
      })
    })

    describe('that relates to a licence with sroc charge versions', () => {
      describe('but has no two-part tariff indicators', () => {
        beforeEach(async () => {
          licenceData.sroc_charge_versions = true

          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('flags the licence for sroc supplementary billing', async () => {
          await DetermineWorkflowYearsService.go(workflowId)

          const result = await LicenceModel.query().findById(licence.id)

          expect(result.includeInSrocBilling).to.equal(true)
        })

        it('returns the licence data', async () => {
          const result = await DetermineWorkflowYearsService.go(workflowId)

          expect(result.licence.id).to.equal(licence.id)
          expect(result.licence.regionId).to.equal(licence.regionId)
          expect(result.startDate).to.equal(new Date('2024-04-01'))
          expect(result.endDate).to.equal(currentFinancialYear.endDate)
        })

        it('returns the flagForBilling and twoPartTariff as false', async () => {
          const result = await DetermineWorkflowYearsService.go(workflowId)

          expect(result.twoPartTariff).to.equal(false)
          expect(result.flagForBilling).to.equal(false)
        })
      })
    })

    describe('that relates to a licence with sroc two-part tariff charge versions', () => {
      describe('and the licence is already flagged for sroc supplementary billing', () => {
        before(async () => {
          licenceData.two_part_tariff_charge_versions = true
          licenceData.include_in_sroc_billing = true

          Sinon.stub(FetchLicenceService, 'go').resolves(licenceData)
        })

        it('returns flagForBilling and twoPartTariff as true', async () => {
          const result = await DetermineWorkflowYearsService.go(workflowId)

          expect(result.twoPartTariff).to.equal(true)
          expect(result.flagForBilling).to.equal(true)
        })
      })
    })
  })
})
