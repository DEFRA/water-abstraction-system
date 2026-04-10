'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitAccountService = require('../../../../app/services/billing-accounts/setup/submit-account.service.js')

describe('Billing Accounts - Setup - Submit Account Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  let fetchSessionStub
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the user picks the "customer" option', () => {
    beforeEach(async () => {
      payload = {
        accountSelected: billingAccount.company.id
      }
    })

    it('saves the submitted value', async () => {
      await SubmitAccountService.go(session.id, payload)

      expect(session).to.equal(
        {
          accountSelected: billingAccount.company.id,
          searchInput: null
        },
        { skip: ['billingAccount', 'id'] }
      )

      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountService.go(session.id, payload)

      expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/existing-address`)
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          accountSelected: billingAccount.company.id,
          billingAccount
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitAccountService.go(session.id, payload)

        expect(session).to.equal(
          {
            accountSelected: billingAccount.company.id,
            searchInput: null
          },
          { skip: ['billingAccount', 'id'] }
        )

        expect(session.$update.called).to.be.true()
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/existing-address`)
      })
    })

    describe('and the user had previously completed the "another" journey', () => {
      beforeEach(async () => {
        sessionData = _anotherSessionData(session)

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value and deletes the other previously saved data', async () => {
        await SubmitAccountService.go(session.id, payload)

        expect(session).to.equal(
          {
            ..._anotherExpectedValues(session),
            accountSelected: billingAccount.company.id,
            searchInput: null
          },
          { skip: ['billingAccount', 'id'] }
        )
        expect(session.$update.called).to.be.true()
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/existing-address`)
      })
    })
  })

  describe('when the user picks the "another" option', () => {
    beforeEach(async () => {
      payload = {
        accountSelected: 'another',
        searchInput: 'Customer Name'
      }
    })

    it('saves the submitted values', async () => {
      await SubmitAccountService.go(session.id, payload)

      expect(session).to.equal(
        {
          accountSelected: 'another',
          searchInput: 'Customer Name'
        },
        { skip: ['billingAccount', 'id'] }
      )
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountService.go(session.id, payload)

      expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/existing-account`)
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          accountSelected: 'another',
          billingAccount,
          searchInput: 'Customer Name'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted values', async () => {
        await SubmitAccountService.go(session.id, payload)

        expect(session).to.equal(
          {
            accountSelected: 'another',
            searchInput: 'Customer Name'
          },
          { skip: ['billingAccount', 'id'] }
        )
        expect(session.$update.called).to.be.true()
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/existing-account`)
      })
    })

    describe('and the user had previously completed the "customer" journey', () => {
      beforeEach(async () => {
        sessionData = _customerSessionData(session)

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value and deletes the other previously saved data', async () => {
        await SubmitAccountService.go(session.id, payload)

        expect(session).to.equal(
          {
            ..._customerExpectedValues(session),
            accountSelected: 'another',
            searchInput: 'Customer Name'
          },
          { skip: ['billingAccount', 'id'] }
        )
        expect(session.$update.called).to.be.true()
      })

      it('continues the journey', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/existing-account`)
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#accountSelected',
              text: 'Select who should the bills go to'
            }
          ],
          accountSelected: { text: 'Select who should the bills go to' }
        })
      })
    })

    describe('because the user selected "another" but did not enter a search input', () => {
      beforeEach(async () => {
        payload = {
          accountSelected: 'another'
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#searchInput',
              text: 'Enter the name of an organisation or individual.'
            }
          ],
          searchInput: { text: 'Enter the name of an organisation or individual.' }
        })
      })
    })

    describe('because the user selected "another" but entered an invalid search input', () => {
      beforeEach(async () => {
        payload = {
          accountSelected: 'another',
          searchInput: 'a'.repeat(101)
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#searchInput',
              text: 'Search query must be 100 characters or less'
            }
          ],
          searchInput: { text: 'Search query must be 100 characters or less' }
        })
      })
    })
  })
})

function _commonExpectedValues(session) {
  return {
    addressJourney: null,
    billingAccount: session.billingAccount,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    fao: null,
    searchInput: null
  }
}

function _customerExpectedValues(session) {
  return {
    ..._commonExpectedValues(session),
    addressSelected: null
  }
}

function _anotherExpectedValues(session) {
  return {
    ..._commonExpectedValues(session),
    accountType: null,
    companiesHouseNumber: null,
    companySearch: null,
    existingAccount: null,
    searchIndividualInput: null
  }
}

function _anotherSessionData(session) {
  return {
    ..._commonSessionData(session),
    accountSelected: 'another',
    accountType: 'company',
    companiesHouseNumber: '12345678',
    companySearch: 'Company Name',
    existingAccount: 'new',
    searchIndividualInput: 'Contact Name',
    searchInput: 'Customer Name'
  }
}

function _customerSessionData(session) {
  return {
    ..._commonSessionData(session),
    accountSelected: session.billingAccount.company.id,
    addressSelected: 'new'
  }
}

function _commonSessionData(session) {
  return {
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/billing-accounts/setup/${session.id}/existing-address`,
        text: 'Back'
      },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    },
    billingAccount: session.billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    fao: 'yes'
  }
}
