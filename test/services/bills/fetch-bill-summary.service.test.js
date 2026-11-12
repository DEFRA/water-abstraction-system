// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from 'water-abstraction-engine/test/helpers/bill.helper.js'
import BillingAccountAddressHelper from 'water-abstraction-engine/test/helpers/billing-account-address.helper.js'
import BillingAccountHelper from 'water-abstraction-engine/test/helpers/billing-account.helper.js'
import BillLicenceHelper from 'water-abstraction-engine/test/helpers/bill-licence.helper.js'
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import CompanyHelper from 'water-abstraction-engine/test/helpers/company.helper.js'
import ContactHelper from 'water-abstraction-engine/test/helpers/contact.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'

// Thing under test
import FetchBillSummaryService from '../../../src/services/bills/fetch-bill-summary.service.js'

describe('Fetch Bill Summary service', () => {
  const billLicences = []

  let agentCompanyId
  let bill
  let billRunId
  let billingAccount
  let billingAccountAddressId
  let billingAccountId
  let companyId
  let contactId
  let region

  beforeEach(async () => {
    const company = await CompanyHelper.add()

    companyId = company.id

    billingAccount = await BillingAccountHelper.add({ companyId })

    billingAccountId = billingAccount.id

    const agentCompany = await CompanyHelper.add({ name: 'Agent Company Ltd' })

    agentCompanyId = agentCompany.id

    const contact = await ContactHelper.add()

    contactId = contact.id

    const billingAccountAddress = await BillingAccountAddressHelper.add({
      billingAccountId,
      companyId: agentCompanyId,
      contactId,
      endDate: null
    })

    billingAccountAddressId = billingAccountAddress.id

    region = RegionHelper.select()

    const billRun = await BillRunHelper.add({
      billRunNumber: 1075,
      createdAt: new Date('2023-05-01'),
      regionId: region.id,
      status: 'ready'
    })

    billRunId = billRun.id

    bill = await BillHelper.add({
      accountNumber: billingAccount.accountNumber,
      billingAccountId,
      billRunId,
      netAmount: 1045
    })

    const billId = bill.id

    for (let i = 0; i < 2; i++) {
      const billLicence = await BillLicenceHelper.add({ billId, licenceRef: `01/0${i + 1}/26/9400` })

      billLicences.push(billLicence)
    }
  })

  describe('when a bill with a matching ID exists', () => {
    it('will fetch the data used in the remove bill page', async () => {
      const result = await FetchBillSummaryService(bill.id)

      expect(result).toEqual({
        billingAccount: {
          accountNumber: billingAccount.accountNumber,
          billingAccountAddresses: [
            {
              address: null,
              company: {
                id: agentCompanyId,
                name: 'Agent Company Ltd',
                type: 'organisation'
              },
              contact: {
                contactType: 'person',
                dataSource: 'wrls',
                department: null,
                firstName: 'Amara',
                id: contactId,
                initials: null,
                lastName: 'Gupta',
                middleInitials: null,
                salutation: null,
                suffix: null
              },
              id: billingAccountAddressId
            }
          ],
          company: {
            id: companyId,
            name: 'Example Trading Ltd',
            type: 'organisation'
          },
          id: billingAccountId
        },
        billLicences: [
          { id: billLicences[0].id, licenceRef: billLicences[0].licenceRef },
          { id: billLicences[1].id, licenceRef: billLicences[1].licenceRef }
        ],
        billRun: {
          batchType: 'supplementary',
          billRunNumber: 1075,
          createdAt: new Date('2023-05-01'),
          id: billRunId,
          region: {
            displayName: region.displayName,
            id: region.id
          },
          scheme: 'sroc',
          source: 'wrls',
          status: 'ready',
          toFinancialYearEnding: 2023
        },
        id: bill.id,
        netAmount: 1045
      })
    })
  })

  describe('when a bill licence with a matching ID does not exist', () => {
    it('returns no result', async () => {
      const result = await FetchBillSummaryService('93112100-152b-4860-abea-2adee11dcd69')

      expect(result).toBeUndefined()
    })
  })
})
