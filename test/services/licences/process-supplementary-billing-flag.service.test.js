'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const FlagSupplementaryBillingService = require('../../../app/services/licences/flag-supplementary-billing.service.js')
const DetermineSupplementaryBillingYearsService = require('../../../app/services/licences/determine-supplementary-billing-years.service.js')

// Thing under test
const ProcessSupplementaryBillingFlagService = require('../../../app/services/licences/process-supplementary-billing-flag.service.js')

describe('Process Supplementary Billing Flag Service', () => {
  let region
  let chargeVersion
  let payload
  let licence
  let determineSupplementaryBillingYearsServiceStub
  let flagSupplementaryBillingServiceStub
  let notifierStub

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid payload', () => {
    beforeEach(async () => {
      determineSupplementaryBillingYearsServiceStub = Sinon.stub(DetermineSupplementaryBillingYearsService, 'go').resolves([2023])
      flagSupplementaryBillingServiceStub = Sinon.stub(FlagSupplementaryBillingService, 'go').resolves()

      region = await RegionHelper.select()
    })

    describe('with a charge version id', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })
        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })

        payload = {
          chargeVersionId: chargeVersion.id
        }
      })

      describe('that has two-part tariff indicators', () => {
        beforeEach(async () => {
          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('passes the charge versions start and end date to the "DetermineSupplementaryBillingYearsService"', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          const startDate = chargeVersion.startDate
          const endDate = chargeVersion.endDate

          expect(determineSupplementaryBillingYearsServiceStub.calledWith(startDate, endDate)).to.be.true()
        })

        it('it calls the "DetermineSupplementaryBillingYearsService" and "FlagSupplementaryBillingService"', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(determineSupplementaryBillingYearsServiceStub.called).to.be.true()
          expect(flagSupplementaryBillingServiceStub.called).to.be.true()
        })
      })

      describe('without two-part tariff indicators', () => {
        beforeEach(async () => {
          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })
        })

        it('does not call the "DetermineSupplementaryBillingYearsService" and "FlagSupplementaryBillingService"', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(determineSupplementaryBillingYearsServiceStub.called).to.be.false()
          expect(flagSupplementaryBillingServiceStub.called).to.be.false()
        })
      })
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
      // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
      // test we recreate the condition by setting it directly with our own stub
      notifierStub = { omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub

      // To make the service fail, we have passed it a charge version that doesn't exist in the db
      payload = {
        chargeVersionId: '5db0060a-69ae-4312-a363-9cb580d19d92'
      }
    })

    it('handles the error', async () => {
      await ProcessSupplementaryBillingFlagService.go(payload)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Supplementary Billing Flag failed')
      expect(args[1]).to.be.an.error()
    })
  })
})
