// Test framework dependencies

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAccountTypeService from '../../../../app/services/billing-accounts/setup/submit-account-type.service.js'

describe('Billing Accounts - Setup - Account Type Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with "company" selected', () => {
    beforeEach(() => {
      payload = { accountType: 'company' }
    })

    it('saves the submitted value', async () => {
      await SubmitAccountTypeService(session.id, payload)

      expect(session).toMatchObject({
        accountType: 'company',
        individualName: null
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountTypeService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/company-search`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          accountType: 'company',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          accountType: 'company',
          individualName: null
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/company-search`
        })
      })
    })

    describe('and the user has returned to the page after visiting the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          accountType: 'company',
          checkPageVisited: true,
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          accountType: 'company',
          checkPageVisited: true,
          individualName: null
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "individual" journey', () => {
      beforeEach(() => {
        sessionData = _individualSessionData(session)

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          ..._commonExpectedValues(),
          accountType: 'company',
          individualName: null
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/company-search`
        })
      })
    })
  })

  describe('when called with "individual" selected and a search term entered', () => {
    beforeEach(async () => {
      payload = { accountType: 'individual', individualName: 'John Doe' }
    })

    it('saves the submitted value', async () => {
      await SubmitAccountTypeService(session.id, payload)

      expect(session).toMatchObject({
        accountType: 'individual',
        individualName: 'John Doe'
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountTypeService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          accountType: 'individual',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          individualName: 'John Doe'
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          accountType: 'individual',
          individualName: 'John Doe'
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          accountType: 'individual',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true,
          individualName: 'John Doe'
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          accountType: 'individual',
          checkPageVisited: true,
          individualName: 'John Doe'
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "company" journey', () => {
      beforeEach(() => {
        sessionData = _companySessionData(session)

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          ..._commonExpectedValues(),
          accountType: 'individual',
          companiesHouseNumber: null,
          companySearch: null,
          individualName: 'John Doe'
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page, chosen "individual" but changed the search term', () => {
      beforeEach(async () => {
        payload = { accountType: 'individual', individualName: 'Jane Doe' }
        sessionData = {
          ..._commonSessionData(session),
          accountType: 'individual',
          individualName: 'John Doe'
        }

        session = SessionModelStub(sessionData)

        FetchSessionDal.mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountTypeService(session.id, payload)

        expect(session).toMatchObject({
          ..._commonExpectedValues(),
          accountType: 'individual',
          companiesHouseNumber: null,
          companySearch: null,
          individualName: 'Jane Doe'
        })
        expect(session.$update.called).toBe(true)
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#accountType',
              text: 'Select the account type'
            }
          ],
          accountType: { text: 'Select the account type' }
        })
      })
    })

    describe('because the user selected "individual" but did not enter a search input', () => {
      beforeEach(() => {
        payload = {
          accountType: 'individual'
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountTypeService(session.id, payload)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#individualName',
              text: 'Enter the full name of the individual.'
            }
          ],
          individualName: { text: 'Enter the full name of the individual.' }
        })
      })
    })
  })
})

function _commonExpectedValues() {
  return {
    accountSelected: 'another',
    addressJourney: null,
    addressSelected: null,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    existingAccount: 'new',
    fao: null,
    searchInput: 'Existing Customer Name'
  }
}

function _commonSessionData(session) {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  return {
    accountSelected: 'another',
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/billing-accounts/setup/${session.id}/existing-address`,
        text: 'Back'
      },
      pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    },
    addressSelected: 'new',
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    existingAccount: 'new',
    fao: 'yes',
    searchInput: 'Existing Customer Name'
  }
}

function _companySessionData(session) {
  return {
    ..._commonSessionData(session),
    accountType: 'company',
    companiesHouseNumber: '12345678',
    companySearch: 'Company Name'
  }
}

function _individualSessionData(session) {
  return {
    ..._commonSessionData(session),
    accountType: 'individual',
    individualName: 'John Doe'
  }
}
