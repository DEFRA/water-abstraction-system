// Test framework dependencies

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import * as CustomersFixture from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchCompanyContactsService from '../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitContactService from '../../../../app/services/billing-accounts/setup/submit-contact.service.js'

describe('Billing Accounts - Setup - Contact Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const billingAccountAddress = billingAccount.billingAccountAddresses[0].address
  const exampleContacts = CustomersFixture.companyContacts()
  const contact = exampleContacts[0].contact
  const companyContacts = {
    company: billingAccount.company,
    contacts: [contact]
  }
  let payload
  let session
  let sessionData

  beforeEach(() => {
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the user picks to set up a "new" contact with an existing address', () => {
    beforeEach(() => {
      payload = {
        contactSelected: 'new'
      }

      sessionData = {
        addressSelected: billingAccountAddress.id,
        billingAccount
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('saves the submitted value', async () => {
      await SubmitContactService(session.id, payload)

      expect(session).toMatchObject({
        addressSelected: billingAccountAddress.id,
        contactSelected: payload.contactSelected
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/contact-name`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: billingAccountAddress.id,
          billingAccount,
          contactSelected: 'new'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactService(session.id, payload)

        expect(session).toMatchObject({
          addressSelected: billingAccountAddress.id,
          contactSelected: payload.contactSelected
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/contact-name`
        })
      })
    })

    describe('and the user has returned to the page from the check and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          addressSelected: billingAccountAddress.id,
          billingAccount,
          checkPageVisited: true,
          contactSelected: 'new'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactService(session.id, payload)

        expect(session).toMatchObject({
          addressSelected: billingAccountAddress.id,
          checkPageVisited: true,
          contactSelected: payload.contactSelected
        })
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })
  })

  describe('when the user picks an existing contact with a new address', () => {
    beforeEach(() => {
      payload = {
        contactSelected: contact.id
      }

      sessionData = {
        addressSelected: 'new',
        billingAccount
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('saves the submitted value', async () => {
      await SubmitContactService(session.id, payload)

      expect(session).toMatchObject({
        addressJourney: _addressJourney(session),
        addressSelected: 'new',
        contactSelected: payload.contactSelected
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/address/${session.id}/postcode`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        payload = {
          contactSelected: contact.id
        }

        sessionData = {
          addressJourney: _addressJourney(session),
          addressSelected: 'new',
          billingAccount,
          contactSelected: contact.id
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: sessionData.addressJourney,
          addressSelected: 'new',
          contactSelected: payload.contactSelected
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/address/${session.id}/postcode`
        })
      })
    })

    describe('and the user has returned from the check page and made the same choice', () => {
      beforeEach(() => {
        payload = {
          contactSelected: contact.id
        }

        sessionData = {
          addressJourney: _addressJourney(session),
          addressSelected: 'new',
          billingAccount,
          checkPageVisited: true,
          contactSelected: contact.id
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: sessionData.addressJourney,
          addressSelected: 'new',
          checkPageVisited: true,
          contactSelected: payload.contactSelected
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/address/${session.id}/postcode`
        })
      })
    })

    describe('and the user had previously completed the "new" journey', () => {
      beforeEach(() => {
        payload = {
          contactSelected: contact.id
        }

        sessionData = {
          addressJourney: _addressJourney(session),
          addressSelected: 'new',
          billingAccount,
          contactSelected: 'new',
          contactName: 'Contact Name'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: _addressJourney(session),
          addressSelected: 'new',
          checkPageVisited: false,
          contactSelected: payload.contactSelected,
          contactName: null
        })
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/address/${session.id}/postcode`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      describe('and the user had chosen the current customer', () => {
        beforeEach(() => {
          payload = {}

          sessionData = {
            accountSelected: billingAccount.company.id,
            billingAccount,
            contactSelected: 'new',
            contactName: 'Contact Name'
          }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          vi.spyOn(FetchCompanyContactsService, 'default').mockResolvedValue(companyContacts)
        })

        it('returns page data for the view, with errors', async () => {
          const result = await SubmitContactService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#contactSelected',
                text: 'Select a contact'
              }
            ],
            contactSelected: {
              text: 'Select a contact'
            }
          })
        })
      })

      describe('and the user had chosen another customer', () => {
        beforeEach(() => {
          payload = {}

          sessionData = {
            accountSelected: 'another',
            billingAccount,
            contactSelected: 'new',
            contactName: 'Contact Name',
            existingAccount: billingAccount.company.id
          }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          vi.spyOn(FetchCompanyContactsService, 'default').mockResolvedValue(companyContacts)
        })

        it('returns page data for the view, with errors', async () => {
          const result = await SubmitContactService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#contactSelected',
                text: 'Select a contact'
              }
            ],
            contactSelected: {
              text: 'Select a contact'
            }
          })
        })
      })
    })
  })
})

function _addressJourney(session) {
  return {
    address: {},
    backLink: { href: `/system/billing-accounts/setup/${session.id}/contact`, text: 'Back' },
    pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
    redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
  }
}
