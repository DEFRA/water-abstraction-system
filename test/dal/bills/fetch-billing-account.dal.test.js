// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AddressHelper from 'water-abstraction-engine/test/helpers/address.helper.js'
import BillingAccountAddressHelper from 'water-abstraction-engine/test/helpers/billing-account-address.helper.js'
import BillingAccountHelper from 'water-abstraction-engine/test/helpers/billing-account.helper.js'
import CompanyHelper from 'water-abstraction-engine/test/helpers/company.helper.js'
import ContactHelper from 'water-abstraction-engine/test/helpers/contact.helper.js'

// Thing under test
import FetchBillingAccountDal from '../../../src/dal/bills/fetch-billing-account.dal.js'

describe('Bills - Fetch Billing Account dal', () => {
  let address
  let billingAccount
  let billingAccountAddress
  let company
  let contact

  beforeEach(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()
    contact = await ContactHelper.add()

    billingAccount = await BillingAccountHelper.add({ companyId: company.id })

    billingAccountAddress = await BillingAccountAddressHelper.add({
      addressId: address.id,
      billingAccountId: billingAccount.id,
      companyId: company.id,
      contactId: contact.id,
      endDate: null
    })
  })

  afterEach(async () => {
    await billingAccountAddress.$query().delete()
    await billingAccount.$query().delete()
    await address.$query().delete()
    await company.$query().delete()
    await contact.$query().delete()
  })

  describe('when a matching billing account exists', () => {
    it('returns the billing account and its contact details', async () => {
      const result = await FetchBillingAccountDal(billingAccount.id)

      expect(result).toEqual({
        accountNumber: billingAccount.accountNumber,
        billingAccountAddresses: [
          {
            address: {
              address1: address.address1,
              address2: address.address2,
              address3: address.address3,
              address4: address.address4,
              address5: null,
              address6: null,
              country: address.country,
              id: address.id,
              postcode: address.postcode
            },
            company: {
              id: company.id,
              name: company.name,
              type: company.type
            },
            contact: {
              contactType: contact.contactType,
              dataSource: contact.dataSource,
              department: null,
              firstName: contact.firstName,
              id: contact.id,
              initials: null,
              lastName: contact.lastName,
              middleInitials: null,
              salutation: null,
              suffix: null
            },
            id: billingAccountAddress.id
          }
        ],
        company: {
          id: company.id,
          name: company.name,
          type: company.type
        },
        id: billingAccount.id
      })
    })
  })
})
