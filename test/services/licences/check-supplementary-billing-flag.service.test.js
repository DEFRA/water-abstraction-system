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
const SupplementaryBillingYearsService = require('../../../app/services/licences/supplementary-billing-years.service.js')

// Thing under test
const CheckSupplementaryBillingFlagService = require('../../../app/services/licences/check-supplementary-billing-flag.service.js')

describe('Check Supplementary Billing Flag Service', () => {
  let region
  let chargeVersion
  let payload
  let licence
  let supplementaryBillingYearsServiceStub
  let flagSupplementaryBillingServiceStub

  beforeEach(async () => {
    supplementaryBillingYearsServiceStub = Sinon.stub(SupplementaryBillingYearsService, 'go').resolves([2023])
    flagSupplementaryBillingServiceStub = Sinon.stub(FlagSupplementaryBillingService, 'go').resolves()

    region = await RegionHelper.select()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid payload', () => {
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

        it('passes the charge versions start and end date to the "SupplementaryBillingYearsService"', async () => {
          await CheckSupplementaryBillingFlagService.go(payload)

          const startDate = chargeVersion.startDate
          const endDate = chargeVersion.endDate

          expect(supplementaryBillingYearsServiceStub.calledWith(startDate, endDate)).to.be.true()
        })

        it('it calls the "SupplementaryBillingYearsService" and "FlagSupplementaryBillingService"', async () => {
          await CheckSupplementaryBillingFlagService.go(payload)

          expect(supplementaryBillingYearsServiceStub.called).to.be.true()
          expect(flagSupplementaryBillingServiceStub.called).to.be.true()
        })
      })

      describe('without two-part tariff indicators', () => {
        beforeEach(async () => {
          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })
        })

        it('does not call the "SupplementaryBillingYearsService" and "FlagSupplementaryBillingService"', async () => {
          await CheckSupplementaryBillingFlagService.go(payload)

          expect(supplementaryBillingYearsServiceStub.called).to.be.false()
          expect(flagSupplementaryBillingServiceStub.called).to.be.false()
        })
      })
    })
  })
})
