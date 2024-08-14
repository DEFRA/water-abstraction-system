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

// Thing under test
const ProcessSupplementaryBillingFlagService = require('../../../app/services/licences/process-supplementary-billing-flag.service.js')

describe('Process Supplementary Billing Flag Service', () => {
  let region
  let chargeVersion
  let payload
  let licence
  let flagSupplementaryBillingServiceStub
  let notifierStub

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid payload', () => {
    beforeEach(async () => {
      flagSupplementaryBillingServiceStub = Sinon.stub(FlagSupplementaryBillingService, 'go').resolves()

      region = await RegionHelper.select()
    })

    describe('with a charge version id', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id })
        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, endDate: '2023-31-03' })

        payload = {
          chargeVersionId: chargeVersion.id
        }
      })

      describe('that has two-part tariff indicators', () => {
        beforeEach(async () => {
          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('marks the licence years needed supplementary billing', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)
          const testYears = [2023]
          const testLicence = {
            id: licence.id,
            regionId: region.id
          }

          expect(flagSupplementaryBillingServiceStub.called).to.be.true()
          expect(flagSupplementaryBillingServiceStub.calledWith(testLicence, testYears)).to.be.true()
        })
      })

      // need to do another test, pass in pre srco 2pt years should be empty

      describe('without two-part tariff indicators', () => {
        beforeEach(async () => {
          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })
        })

        it('does not mark the licence for supplementary billing', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

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
      expect(args[1]).to.equal(payload)
      expect(args[2]).to.be.an.error()
    })
  })
})
