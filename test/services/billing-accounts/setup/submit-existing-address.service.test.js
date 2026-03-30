'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things to stub
const FetchCompanyAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-company-addresses.service.js')

// Thing under test
const SubmitExistingAddressService = require('../../../../app/services/billing-accounts/setup/submit-existing-address.service.js')

describe('Billing Accounts - Setup - Submit Existing Address Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: _addresses()
  }

  let payload
  let session
  let sessionData

  beforeEach(async () => {
    Sinon.stub(FetchCompanyAddressesService, 'go').returns(companyAddresses)
  })

  afterEach(async () => {
    await session.$query().delete()
    Sinon.restore()
  })

  describe('when the user picks an existing address', () => {
    beforeEach(async () => {
      sessionData = {
        accountSelected: billingAccount.company.id,
        billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })

      payload = {
        addressSelected: companyAddresses.addresses[0].id
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: payload.addressSelected
        },
        { skip: ['accountSelected', 'billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          addressSelected: companyAddresses.addresses[0].id,
          billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressSelected: payload.addressSelected
          },
          { skip: ['accountSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          addressSelected: companyAddresses.addresses[0].id,
          billingAccount,
          checkPageVisited: true
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressSelected: payload.addressSelected,
            checkPageVisited: true
          },
          { skip: ['accountSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user selects an existing address after already having set up a new address', () => {
      beforeEach(async () => {
        sessionData = _newAddressSessionData(session)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._newAddressExpectedValues(session),
            addressSelected: payload.addressSelected
          },
          { skip: ['accountSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })
  })

  describe('when the user picks to set up a new address', () => {
    beforeEach(async () => {
      sessionData = {
        accountSelected: 'another',
        existingAccount: billingAccount.company.id,
        billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })

      payload = {
        addressSelected: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: 'new'
        },
        { skip: ['accountSelected', 'billingAccount', 'existingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          addressSelected: 'new',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressSelected: 'new'
          },
          { skip: ['accountSelected', 'billingAccount', 'existingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })

    describe('and the user has returned to the page from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          addressSelected: 'new',
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressSelected: 'new',
            checkPageVisited: true
          },
          { skip: ['accountSelected', 'billingAccount', 'existingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('when the user selects a new address after already having chosen an existing address', () => {
      beforeEach(async () => {
        sessionData = _commonSessionData(session.billingAccount)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._commonSessionData(session.billingAccount),
            addressSelected: payload.addressSelected
          },
          { skip: ['accountSelected', 'billingAccount', 'existingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      sessionData = {
        accountSelected: 'another',
        existingAccount: billingAccount.company.id,
        billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })

      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#addressSelected',
            text: `Select an existing address for ${companyAddresses.company.name}`
          }
        ],
        addressSelected: { text: `Select an existing address for ${companyAddresses.company.name}` }
      })
    })
  })
})

function _addresses() {
  return [
    {
      id: generateUUID(),
      address1: 'ENVIRONMENT AGENCY',
      address2: 'HORIZON HOUSE',
      address3: 'DEANERY ROAD',
      address4: 'BRISTOL',
      address5: 'BRISTOLSHIRE',
      address6: null,
      postcode: 'BS1 5AH'
    }
  ]
}

function _commonExpectedValues(session) {
  return {
    accountSelected: session.billingAccount.company.id,
    addressJourney: null,
    billingAccount: session.billingAccount,
    checkPageVisited: false,
    contactName: null,
    contactSelected: null,
    fao: null
  }
}

function _newAddressExpectedValues(session) {
  return {
    ..._commonExpectedValues(session),
    accountSelected: 'another',
    addressSelected: 'new',
    existingAccount: session.billingAccount.company.id
  }
}

function _newAddressSessionData(session) {
  return {
    ..._commonSessionData(session.billingAccount),
    accountSelected: 'another',
    addressSelected: 'new',
    existingAccount: session.billingAccount.company.id
  }
}

function _commonSessionData(billingAccount) {
  return {
    accountSelected: billingAccount.company.id,
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    fao: 'yes'
  }
}
