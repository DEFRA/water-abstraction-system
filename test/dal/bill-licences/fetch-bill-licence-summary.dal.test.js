// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from 'water-abstraction-engine/test/helpers/bill.helper.js'
import BillLicenceHelper from 'water-abstraction-engine/test/helpers/bill-licence.helper.js'
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import BillingAccountAddressHelper from 'water-abstraction-engine/test/helpers/billing-account-address.helper.js'
import BillingAccountHelper from 'water-abstraction-engine/test/helpers/billing-account.helper.js'
import CompanyHelper from 'water-abstraction-engine/test/helpers/company.helper.js'
import ContactHelper from 'water-abstraction-engine/test/helpers/contact.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import TransactionHelper from 'water-abstraction-engine/test/helpers/transaction.helper.js'
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import FetchBillLicenceSummaryDal from '../../../src/dal/bill-licences/fetch-bill-licence-summary.dal.js'

describe('Bill Licences - Fetch Bill Licence Summary dal', () => {
  let agentCompany
  let bill
  let billingAccount
  let billingAccountAddress
  let billLicence
  let billRun
  let company
  let contact
  let licenceRef
  let region
  let transaction

  beforeEach(async () => {
    region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)
    licenceRef = generateLicenceRef()

    company = await CompanyHelper.add()
    billingAccount = await BillingAccountHelper.add({ companyId: company.id })
    agentCompany = await CompanyHelper.add({ name: 'Agent Company Ltd' })
    contact = await ContactHelper.add()

    billingAccountAddress = await BillingAccountAddressHelper.add({
      billingAccountId: billingAccount.id,
      companyId: agentCompany.id,
      contactId: contact.id,
      endDate: null
    })

    billRun = await BillRunHelper.add({
      billRunNumber: 1075,
      createdAt: new Date('2023-05-01'),
      regionId: region.id,
      status: 'ready'
    })

    bill = await BillHelper.add({
      accountNumber: billingAccount.accountNumber,
      billingAccountId: billingAccount.id,
      billRunId: billRun.id
    })

    billLicence = await BillLicenceHelper.add({ billId: bill.id, licenceRef })
    transaction = await TransactionHelper.add({ billLicenceId: billLicence.id, netAmount: 1000.1 })
  })

  afterEach(async () => {
    await transaction.$query().delete()
    await billLicence.$query().delete()
    await bill.$query().delete()
    await billRun.$query().delete()
    await billingAccountAddress.$query().delete()
    await billingAccount.$query().delete()
    await contact.$query().delete()
    await agentCompany.$query().delete()
    await company.$query().delete()
  })

  describe('when a bill licence with a matching ID exists', () => {
    it('will fetch the data used in the remove bill licence page', async () => {
      const result = await FetchBillLicenceSummaryDal(billLicence.id)

      expect(result).toEqual({
        bill: {
          accountNumber: billingAccount.accountNumber,
          billingAccount: {
            accountNumber: billingAccount.accountNumber,
            billingAccountAddresses: [
              {
                company: {
                  id: agentCompany.id,
                  name: 'Agent Company Ltd',
                  type: 'organisation'
                },
                contact: {
                  contactType: 'person',
                  dataSource: 'wrls',
                  department: null,
                  firstName: 'Amara',
                  id: contact.id,
                  initials: null,
                  lastName: 'Gupta',
                  middleInitials: null,
                  salutation: null,
                  suffix: null
                },
                id: billingAccountAddress.id
              }
            ],
            company: {
              id: company.id,
              name: 'Example Trading Ltd',
              type: 'organisation'
            },
            id: billingAccount.id
          },
          billRun: {
            batchType: 'supplementary',
            billRunNumber: 1075,
            createdAt: new Date('2023-05-01'),
            id: billRun.id,
            region: {
              displayName: 'Test Region',
              id: region.id
            },
            scheme: 'sroc',
            source: 'wrls',
            status: 'ready',
            toFinancialYearEnding: 2023
          },
          id: bill.id
        },
        id: billLicence.id,
        licenceId: billLicence.licenceId,
        licenceRef,
        transactions: [
          {
            credit: false,
            id: transaction.id,
            netAmount: 1000.1
          }
        ]
      })
    })
  })

  describe('when a bill licence with a matching ID does not exist', () => {
    it('returns no result', async () => {
      const result = await FetchBillLicenceSummaryDal(generateUUID())

      expect(result).toBeUndefined()
    })
  })
})
