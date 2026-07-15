// Test helpers
import AddressHelper from '../../support/helpers/address.helper.js'
import CompanyHelper from '../../support/helpers/company.helper.js'
import BillingAccountHelper from '../../support/helpers/billing-account.helper.js'
import BillingAccountAddressHelper from '../../support/helpers/billing-account-address.helper.js'

// Thing under test
import FetchCompanyDal from '../../../app/dal/companies/fetch-billing-accounts.dal.js'

describe('Companies - Fetch Billing Accounts dal', () => {
  let address
  let company
  let billingAccount
  let billingAccountAddress

  beforeAll(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()

    billingAccount = await BillingAccountHelper.add({
      companyId: company.id
    })

    billingAccountAddress = await BillingAccountAddressHelper.add({
      billingAccountId: billingAccount.id,
      addressId: address.id
    })

    // Additional Billing Account
    await BillingAccountHelper.add()
  })

  it('returns the billing accounts for the company', async () => {
    const result = await FetchCompanyDal(company.id)

    expect(result).toEqual({
      billingAccounts: [
        {
          accountNumber: billingAccount.accountNumber,
          billingAccountAddresses: [
            {
              address: {
                address1: 'ENVIRONMENT AGENCY',
                address2: 'HORIZON HOUSE',
                address3: 'DEANERY ROAD',
                address4: 'BRISTOL',
                address5: null,
                address6: null,
                country: 'United Kingdom',
                id: address.id,
                postcode: 'BS1 5AH'
              },
              company: null,
              contact: null,
              id: billingAccountAddress.id
            }
          ],
          company: {
            id: company.id,
            name: 'Example Trading Ltd',
            type: 'organisation'
          },
          id: billingAccount.id
        }
      ],
      totalNumber: 1
    })
  })
})
