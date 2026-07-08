// Test framework dependencies

// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'
import { generateAccountNumber } from '../../../support/helpers/billing-account.helper.js'
import { generateLicenceRef } from '../../../support/helpers/licence.helper.js'

// Things we need to stub
import * as FetchBillingAccountsService from '../../../../app/services/bill-runs/supplementary/fetch-billing-accounts.service.js'

// Thing under test
import PreGenerateBillingDataService from '../../../../app/services/bill-runs/supplementary/pre-generate-billing-data.service.js'

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
    vi.restoreAllMocks()
  })

  describe('when the service is called', () => {
    beforeEach(async () => {
      chargeVersions = [
        { billingAccountId: billingAccounts[0].id, licence: licences[0] },
        { billingAccountId: billingAccounts[1].id, licence: licences[0] },
        { billingAccountId: billingAccounts[1].id, licence: licences[1] },
        { billingAccountId: billingAccounts[1].id, licence: licences[1] }
      ]

      vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue(billingAccounts)
    })

    describe('returns an object with a bills property', () => {
      it('has one key per billing account', async () => {
        const { bills: result } = await PreGenerateBillingDataService(chargeVersions, billRunId, billingPeriod)

        const keys = Object.keys(result)

        expect(keys).toHaveLength(2)
      })

      it('is keyed with the billing account id', async () => {
        const { bills: result } = await PreGenerateBillingDataService(chargeVersions, billRunId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          expect(key).toEqual(value.billingAccountId)
        })
      })

      it('has the correct data for each key', async () => {
        const { bills: result } = await PreGenerateBillingDataService(chargeVersions, billRunId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          const matchingBillingAccount = billingAccounts.find((billingAccount) => {
            return key === billingAccount.id
          })

          expect(value.accountNumber).toEqual(matchingBillingAccount.accountNumber)
        })
      })
    })

    describe('returns an object with a billLicences property', () => {
      it('has one key per combination of bill id and licence id', async () => {
        const { billLicences: result } = await PreGenerateBillingDataService(chargeVersions, billRunId, billingPeriod)

        const keys = Object.entries(result)

        expect(keys).toHaveLength(3)
      })

      it('is keyed with the bill id and licence id', async () => {
        const { billLicences: result } = await PreGenerateBillingDataService(chargeVersions, billRunId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          expect(key).toEqual(`${value.billId}-${value.licenceId}`)
        })
      })

      it('has the correct data for each key', async () => {
        const { billLicences: result } = await PreGenerateBillingDataService(chargeVersions, billRunId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          const matchingLicence = licences.find((licence) => {
            return key === `${value.billId}-${licence.id}`
          })

          expect(value.licenceRef).toEqual(matchingLicence.licenceRef)
        })
      })
    })
  })
})
