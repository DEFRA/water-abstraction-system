// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillRunChargeVersionYearHelper from '../../../support/helpers/bill-run-charge-version-year.helper.js'
import BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import ChargeVersionHelper from '../../../support/helpers/charge-version.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import LicenceVersionHelper from '../../../support/helpers/licence-version.helper.js'
import WorkflowHelper from '../../../support/helpers/workflow.helper.js'

// Thing under test
import FetchLicenceUpdatesService from '../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js'

describe('Jobs - Licence Updates - Fetch Licence Updates service', () => {
  let licence
  let licenceVersion

  beforeEach(async () => {
    licence = await LicenceHelper.add()
  })

  describe('when there are matching licence version records', () => {
    beforeEach(async () => {
      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })
    })

    describe('and the licence is new (it has no charge versions)', () => {
      it('returns the expected result', async () => {
        const results = await FetchLicenceUpdatesService()

        const result = results.find((l) => {
          return l.id === licenceVersion.id
        })

        expect(result.id).to.be.toEqual(licenceVersion.id)
        expect(result.licenceId).to.be.toEqual(licence.id)
        expect(result.chargeVersionExists).to.be.toEqual(false)
      })
    })

    describe('and the licence has been updated (it has an existing charge version)', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns the expected result', async () => {
        const results = await FetchLicenceUpdatesService()

        const result = results.find((l) => {
          return l.id === licenceVersion.id
        })

        expect(result.id).to.be.toEqual(licenceVersion.id)
        expect(result.licenceId).to.be.toEqual(licence.id)
        expect(result.chargeVersionExists).to.be.toEqual(true)
      })
    })
  })

  describe('when there are no matching licence version records', () => {
    describe('because they were all created more than 2 months ago', () => {
      beforeEach(async () => {
        licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id, createdAt: _threeMonthsAgo() })
      })

      it('returns no results', async () => {
        const data = await FetchLicenceUpdatesService()

        const results = data.filter((l) => {
          return l.licenceId === licence.id
        })

        expect(results).toHaveLength(0)
      })
    })

    describe('because they are already linked to a workflow records', () => {
      beforeEach(async () => {
        licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })
        await WorkflowHelper.add({ licenceId: licence.id, licenceVersionId: licenceVersion.id, status: 'review' })
      })

      it('returns no results', async () => {
        const data = await FetchLicenceUpdatesService()

        const results = data.filter((l) => {
          return l.licenceId === licence.id
        })

        expect(results).toHaveLength(0)
      })
    })

    describe('because they are linked to in-progress PRESROC bill runs', () => {
      beforeEach(async () => {
        licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

        const chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          scheme: 'alcs'
        })
        const billRun = await BillRunHelper.add({ scheme: 'alcs' })

        await BillRunChargeVersionYearHelper.add({ billRunId: billRun.id, chargeVersionId: chargeVersion.id })
      })

      it('returns no results', async () => {
        const data = await FetchLicenceUpdatesService()

        const results = data.filter((l) => {
          return l.licenceId === licence.id
        })

        expect(results).toHaveLength(0)
      })
    })

    describe('because they have a status of "draft"', () => {
      beforeEach(async () => {
        licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id, status: 'draft' })
      })

      it('returns no results', async () => {
        const data = await FetchLicenceUpdatesService()

        const results = data.filter((l) => {
          return l.licenceId === licence.id
        })

        expect(results).toHaveLength(0)
      })
    })
  })
})

function _threeMonthsAgo() {
  const today = new Date()

  today.setMonth(today.getMonth() - 3)

  return today.toISOString()
}
