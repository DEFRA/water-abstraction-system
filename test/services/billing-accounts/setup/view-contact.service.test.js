// Test framework dependencies

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import * as CustomersFixture from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchCompanyContactsService from '../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewContactService from '../../../../app/services/billing-accounts/setup/view-contact.service.js'

describe('Billing Accounts - Setup - Contact Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const exampleContacts = CustomersFixture.companyContacts()
  const contact = exampleContacts[0].contact
  const companyContacts = {
    company: billingAccount.company,
    contacts: [contact]
  }

  let session
  let sessionData

  beforeEach(() => {
    vi.spyOn(FetchCompanyContactsService, 'default').mockResolvedValue(companyContacts)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the contact is for the existing account', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: billingAccount.company.id,
          billingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewContactService(session.id)

        expect(result).toEqual({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/fao`,
            text: 'Back'
          },
          contactSelected: null,
          items: [
            {
              id: contact.id,
              value: contact.id,
              text: contact.$name(),
              checked: false
            },
            {
              divider: 'or'
            },
            {
              id: 'new',
              value: 'new',
              text: 'Add a new contact',
              checked: false
            }
          ],
          pageTitle: `Set up a contact for ${session.billingAccount.company.name}`,
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
        })
      })
    })

    describe('and the contact is for a new account', () => {
      beforeEach(() => {
        sessionData = {
          accountSelected: 'another',
          billingAccount,
          existingAccount: billingAccount.company.id
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view', async () => {
        const result = await ViewContactService(session.id)

        expect(result).toEqual({
          backLink: {
            href: `/system/billing-accounts/setup/${session.id}/fao`,
            text: 'Back'
          },
          contactSelected: null,
          items: [
            {
              id: contact.id,
              value: contact.id,
              text: contact.$name(),
              checked: false
            },
            {
              divider: 'or'
            },
            {
              id: 'new',
              value: 'new',
              text: 'Add a new contact',
              checked: false
            }
          ],
          pageTitle: `Set up a contact for ${session.billingAccount.company.name}`,
          pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
        })
      })
    })
  })
})
