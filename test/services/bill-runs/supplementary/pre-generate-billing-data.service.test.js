'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateAccountNumber } = require('../../../support/helpers/billing-account.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/supplementary/fetch-billing-accounts.service.js')

// Thing under test
const PreGenerateBillingDataService = require('../../../../app/services/bill-runs/supplementary/pre-generate-billing-data.service.js')

describe('Bill Runs - Supplementary - Pre-generate Billing Data service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const billRunId = generateUUID()

  const billingAccounts = [
    {
      id: generateUUID(),
      accountNumber: generateAccountNumber()
    },
    {
      id: generateUUID(),
      accountNumber: generateAccountNumber()
    }
  ]

  const licences = [
    { id: generateUUID(), licenceRef: generateLicenceRef() },
    { id: generateUUID(), licenceRef: generateLicenceRef() }
  ]

  let chargeVersions

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(async () => {
      chargeVersions = [
        { billingAccountId: billingAccounts[0].id, licence: licences[0] },
        { billingAccountId: billingAccounts[1].id, licence: licences[0] },
        { billingAccountId: billingAccounts[1].id, licence: licences[1] },
        { billingAccountId: billingAccounts[1].id, licence: licences[1] }
      ]

      Sinon.stub(FetchBillingAccountsService, 'go').resolves(billingAccounts)
    })

    describe('returns an object with a bills property', () => {
      it('has one key per billing account', async () => {
        const { bills: result } = await PreGenerateBillingDataService.go(chargeVersions, billRunId, billingPeriod)

        const keys = Object.keys(result)

        expect(keys).to.have.length(2)
      })

      it('is keyed with the billing account id', async () => {
        const { bills: result } = await PreGenerateBillingDataService.go(chargeVersions, billRunId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          expect(key).to.equal(value.billingAccountId)
        })
      })

      it('has the correct data for each key', async () => {
        const { bills: result } = await PreGenerateBillingDataService.go(chargeVersions, billRunId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          const matchingBillingAccount = billingAccounts.find((billingAccount) => {
            return key === billingAccount.id
          })

          expect(value.accountNumber).to.equal(matchingBillingAccount.accountNumber)
        })
      })
    })

    describe('returns an object with a billLicences property', () => {
      it('has one key per combination of bill id and licence id', async () => {
        const { billLicences: result } = await PreGenerateBillingDataService.go(
          chargeVersions,
          billRunId,
          billingPeriod
        )

        const keys = Object.entries(result)

        expect(keys).to.have.length(3)
      })

      it('is keyed with the bill id and licence id', async () => {
        const { billLicences: result } = await PreGenerateBillingDataService.go(
          chargeVersions,
          billRunId,
          billingPeriod
        )

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          expect(key).to.equal(`${value.billId}-${value.licenceId}`)
        })
      })

      it('has the correct data for each key', async () => {
        const { billLicences: result } = await PreGenerateBillingDataService.go(
          chargeVersions,
          billRunId,
          billingPeriod
        )

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          const matchingLicence = licences.find((licence) => {
            return key === `${value.billId}-${licence.id}`
          })

          expect(value.licenceRef).to.equal(matchingLicence.licenceRef)
        })
      })
    })
  })
})
