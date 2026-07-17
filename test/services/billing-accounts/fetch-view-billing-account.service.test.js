// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AddressHelper from '../../support/helpers/address.helper.js'
import BillHelper from '../../support/helpers/bill.helper.js'
import BillRunHelper from '../../support/helpers/bill-run.helper.js'
import BillingAccountAddressHelper from '../../support/helpers/billing-account-address.helper.js'
import BillingAccountHelper from '../../support/helpers/billing-account.helper.js'
import CompanyHelper from '../../support/helpers/company.helper.js'
import ContactHelper from '../../support/helpers/contact.helper.js'

// Thing under test
import FetchViewBillingAccountService from '../../../app/services/billing-accounts/fetch-view-billing-account.service.js'

describe('Billing Accounts - Fetch View Billing Account service', () => {
  let address
  let bill1
  let billingAccount
  let billingAccountAddress
  let billingAccountId
  let billRun1
  let billRun2
  let billRun3
  let contact
  let sendToCompany
  let primaryCompany

  describe('when a matching billing account exists', () => {
    beforeEach(async () => {
      address = await AddressHelper.add()
      contact = await ContactHelper.add()
      primaryCompany = await CompanyHelper.add()
      sendToCompany = await CompanyHelper.add({ name: 'Send It Here' })

      billingAccount = await BillingAccountHelper.add({ companyId: primaryCompany.id })
      billingAccountId = billingAccount.id

      billingAccountAddress = await BillingAccountAddressHelper.add({
        addressId: address.id,
        billingAccountId,
        companyId: sendToCompany.id,
        contactId: contact.id
      })

      billRun1 = await BillRunHelper.add({
        status: 'sent'
      })

      billRun2 = await BillRunHelper.add({
        status: 'ready'
      })

      billRun3 = await BillRunHelper.add({
        status: 'error'
      })

      bill1 = await BillHelper.add({
        billingAccountId,
        billRunId: billRun1.id
      })

      await BillHelper.add({
        billingAccountId,
        billRunId: billRun2.id
      })

      await BillHelper.add({
        billingAccountId,
        billRunId: billRun3.id
      })
    })

    it('returns the matching billingAccount with related address, company, and bills with a bill run status of "sent"', async () => {
      const result = await FetchViewBillingAccountService(billingAccountId)

      expect(result).toEqual({
        billingAccount: {
          id: billingAccountId,
          accountNumber: billingAccount.accountNumber,
          createdAt: billingAccount.createdAt,
          lastTransactionFile: null,
          lastTransactionFileCreatedAt: billingAccount.lastTransactionFileCreatedAt,
          billingAccountAddresses: [
            {
              id: billingAccountAddress.id,
              address: {
                id: address.id,
                address1: 'ENVIRONMENT AGENCY',
                address2: 'HORIZON HOUSE',
                address3: 'DEANERY ROAD',
                address4: 'BRISTOL',
                address5: null,
                address6: null,
                postcode: 'BS1 5AH',
                country: 'United Kingdom'
              },
              company: {
                id: sendToCompany.id,
                name: 'Send It Here',
                type: 'organisation'
              },
              contact: {
                contactType: contact.contactType,
                dataSource: 'wrls',
                department: contact.department,
                firstName: contact.firstName,
                id: contact.id,
                initials: null,
                lastName: contact.lastName,
                middleInitials: null,
                salutation: null,
                suffix: null
              }
            }
          ],
          company: {
            id: primaryCompany.id,
            name: 'Example Trading Ltd',
            type: 'organisation'
          }
        },
        bills: [
          {
            id: bill1.id,
            createdAt: bill1.createdAt,
            credit: bill1.credit,
            invoiceNumber: bill1.invoiceNumber,
            netAmount: bill1.netAmount,
            financialYearEnding: bill1.financialYearEnding,
            billRun: {
              id: billRun1.id,
              batchType: billRun1.batchType,
              billRunNumber: billRun1.billRunNumber,
              scheme: billRun1.scheme,
              source: billRun1.source,
              status: billRun1.status,
              summer: billRun1.summer
            }
          }
        ],
        totalNumber: 1
      })
    })
  })
})
