// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

import { generateUUID } from '../../../support/generators.js'

// Things we need to stub
import * as FetchExistingCompaniesService from '../../../../app/services/billing-accounts/setup/fetch-existing-companies.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitExistingAccountService from '../../../../app/services/billing-accounts/setup/submit-existing-account.service.js'

describe('Billing Accounts - Setup - Submit Existing Account service', () => {
  const companies = _companies()
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = {}
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the user picks an existing account', () => {
    beforeEach(() => {
      payload = {
        existingAccount: companies[0].id
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService(session.id, payload)

      expect(session).toMatchObject({
        existingAccount: payload.existingAccount
      })
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          existingAccount: payload.existingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService(session.id, payload)

        expect(session).toMatchObject({
          existingAccount: payload.existingAccount
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true,
          existingAccount: payload.existingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService(session.id, payload)

        expect(session).toMatchObject({
          checkPageVisited: true,
          existingAccount: payload.existingAccount
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "new" journey', () => {
      beforeEach(() => {
        sessionData = _newAccountSessionData(session)

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value and deletes the previously saved data', async () => {
        await SubmitExistingAccountService(session.id, payload)

        expect(session).toMatchObject({
          ..._newAccountExpectedValues(),
          existingAccount: companies[0].id
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
        })
      })
    })
  })

  describe('when the user picks a new account', () => {
    beforeEach(() => {
      payload = {
        existingAccount: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService(session.id, payload)

      expect(session).toMatchObject({
        existingAccount: 'new'
      })
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService(session.id, payload)

      expect(result).toEqual({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/account-type`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          existingAccount: payload.existingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService(session.id, payload)

        expect(session).toMatchObject({
          existingAccount: payload.existingAccount
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/account-type`
        })
      })
    })

    describe('and the user had previously completed the existing account journey', () => {
      beforeEach(() => {
        sessionData = _existingAccountSessionData(session)

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAccountService(session.id, payload)

        expect(session).toMatchObject({
          ..._commonExpectedValues(),
          existingAccount: 'new'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAccountService(session.id, payload)

        expect(result).toEqual({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/account-type`
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
      vi.spyOn(FetchExistingCompaniesService, 'default').mockReturnValue(companies)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAccountService(session.id, payload)

      expect(result.error).toEqual({
        errorList: [
          {
            href: '#existingAccount',
            text: `Select does this account already exist?`
          }
        ],
        existingAccount: { text: `Select does this account already exist?` }
      })
    })
  })
})

function _companies() {
  return [
    {
      exact: true,
      id: generateUUID(),
      name: 'Company Name Ltd'
    }
  ]
}

function _commonExpectedValues() {
  return {
    accountSelected: 'another',
    addressSelected: null,
    addressJourney: null,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    fao: null,
    searchInput: 'Customer Name'
  }
}

function _newAccountExpectedValues() {
  return {
    ..._commonExpectedValues(),
    accountType: null,
    addressSelected: null,
    companiesHouseNumber: null,
    companySearch: null,
    existingAccount: null,
    individualName: null
  }
}

function _newAccountSessionData(session) {
  return {
    ..._commonSessionData(session),
    accountType: 'company',
    companiesHouseNumber: '12345678',
    companySearch: 'Company Name',
    existingAccount: 'new',
    individualName: 'Contact Name'
  }
}

function _existingAccountSessionData(session) {
  return {
    ..._commonSessionData(session),
    existingAccount: 'customer'
  }
}

function _commonSessionData(session) {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  return {
    accountSelected: 'another',
    addressSelected: 'new',
    addressJourney: {
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/existing-account`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    },
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    fao: 'yes',
    searchInput: 'Customer Name'
  }
}
