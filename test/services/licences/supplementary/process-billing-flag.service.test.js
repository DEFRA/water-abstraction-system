'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearModel = require('../../../../app/models/licence-supplementary-year.model.js')

// Things we need to stub
const DetermineChargeVersionYearsService = require('../../../../app/services/licences/supplementary/determine-charge-version-years.service.js')
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')

// Thing under test
const ProcessSupplementaryBillingFlagService = require('../../../../app/services/licences/supplementary/process-billing-flag.service.js')

describe('Process Billing Flag Service', () => {
  let chargeVersion
  let licence
  let notifierStub
  let payload

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid payload', () => {
    describe('with a charge version id', () => {
      beforeEach(async () => {
        // region = RegionHelper.select()
        licence = await LicenceHelper.add()
        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, endDate: '2023-03-31' })

        payload = {
          chargeVersionId: chargeVersion.id
        }
      })

      describe('that should be flagged for supplementary billing', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineChargeVersionYearsService, 'go').resolves({
            licence: {
              id: licence.id,
              regionId: licence.regionId
            },
            startDate: chargeVersion.startDate,
            endDate: chargeVersion.endDate,
            twoPartTariff: true,
            flagForBilling: true
          })

          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('flags the licence for supplementary billing', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          const result = await _fetchLicenceSupplementaryYears(licence.id)

          expect(result[0].licenceId).to.equal(licence.id)
          expect(result[0].twoPartTariff).to.equal(true)
          expect(result[0].billRunId).to.equal(null)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineChargeVersionYearsService, 'go').resolves({
            licence: {
              id: licence.id,
              regionId: licence.regionId
            },
            startDate: chargeVersion.startDate,
            endDate: chargeVersion.endDate,
            twoPartTariff: false,
            flagForBilling: false
          })
        })

        it('does not flag the licence for supplementary billing', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          const result = await _fetchLicenceSupplementaryYears(licence.id)

          expect(result).to.equal([])
        })
      })
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      // To make the service fail, we have passed it a charge version that doesn't exist in the db
      payload = {
        chargeVersionId: '5db0060a-69ae-4312-a363-9cb580d19d92'
      }
    })

    it('handles the error', async () => {
      await ProcessSupplementaryBillingFlagService.go(payload)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Supplementary Billing Flag failed')
      expect(args[1]).to.equal(payload)
      expect(args[2]).to.be.an.error()
    })
  })
})

async function _fetchLicenceSupplementaryYears (licenceId) {
  return LicenceSupplementaryYearModel.query()
    .select([
      'id',
      'licenceId',
      'twoPartTariff',
      'billRunId'])
    .where('licenceId', licenceId)
}
