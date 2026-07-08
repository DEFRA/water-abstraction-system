// Test helpers
import * as BillHelper from '../../support/helpers/bill.helper.js'
import * as BillLicenceHelper from '../../support/helpers/bill-licence.helper.js'
import * as BillRunHelper from '../../support/helpers/bill-run.helper.js'
import * as BillingAccountAddressHelper from '../../support/helpers/billing-account-address.helper.js'
import * as BillingAccountHelper from '../../support/helpers/billing-account.helper.js'
import * as CompanyHelper from '../../support/helpers/company.helper.js'
import * as ContactHelper from '../../support/helpers/contact.helper.js'
import * as RegionHelper from '../../support/helpers/region.helper.js'

// Thing under test
import FetchBillSummaryService from '../../../app/services/bills/fetch-bill-summary.service.js'

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
      status: 'ready',
      regionId: region.id
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
        id: bill.id,
        netAmount: 1045,
        billingAccount: {
          id: billingAccountId,
          accountNumber: billingAccount.accountNumber,
          company: {
            id: companyId,
            name: 'Example Trading Ltd',
            type: 'organisation'
          },
          billingAccountAddresses: [
            {
              id: billingAccountAddressId,
              address: null,
              company: {
                id: agentCompanyId,
                name: 'Agent Company Ltd',
                type: 'organisation'
              },
              contact: {
                id: contactId,
                contactType: 'person',
                dataSource: 'wrls',
                department: null,
                firstName: 'Amara',
                initials: null,
                lastName: 'Gupta',
                middleInitials: null,
                salutation: null,
                suffix: null
              }
            }
          ]
        },
        billLicences: [
          { id: billLicences[0].id, licenceRef: billLicences[0].licenceRef },
          { id: billLicences[1].id, licenceRef: billLicences[1].licenceRef }
        ],
        billRun: {
          id: billRunId,
          batchType: 'supplementary',
          billRunNumber: 1075,
          createdAt: new Date('2023-05-01'),
          scheme: 'sroc',
          source: 'wrls',
          status: 'ready',
          toFinancialYearEnding: 2023,
          region: {
            id: region.id,
            displayName: region.displayName
          }
        }
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
