'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/supplementary/fetch-billing-accounts.service.js')

// Thing under test
const PreGenerateBillingDataService = require('../../../../app/services/bill-runs/supplementary/pre-generate-billing-data.service.js')

describe('Pre-generate billing data service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const billRunId = '027b69aa-b0f7-46d0-86ce-ab577932fc5b'

  const billingAccounts = [
    {
      id: '235bae72-01f7-4a21-b8a3-d2b5fb2eff91',
      accountNumber: 'T12345678A'
    },
    {
      id: '1d407b9c-457a-487d-bfe1-a54b72ef0bb5',
      accountNumber: 'T87654321A'
    }
  ]

  const licences = [
    { id: 'caf6d22b-f235-4f82-9867-b98c884432b6', licenceRef: 'AT/CURR/MONTHLY/01' },
    { id: 'e35636a1-9115-4e69-830d-48eb80738838', licenceRef: 'AT/CURR/MONTHLY/02' }
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
          billingPeriod)

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
