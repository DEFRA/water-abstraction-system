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
const FetchExistingAddressesService = require('../../../../app/services/billing-accounts/setup/fetch-existing-addresses.service.js')

// Thing under test
const SubmitExistingAddressService = require('../../../../app/services/billing-accounts/setup/submit-existing-address.service.js')

describe('Billing Accounts - Setup - Submit Existing Address Service', () => {
  const addresses = _addresses()
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
    Sinon.restore()
  })

  describe('when the user picks an existing address', () => {
    beforeEach(async () => {
      payload = {
        addressSelected: addresses[0].address.id
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressSelected: payload.addressSelected
        },
        { skip: ['billingAccount'] }
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
          addressSelected: addresses[0].address.id,
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
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
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
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
          { skip: ['billingAccount'] }
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
      payload = {
        addressSelected: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAddressService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          addressJourney: _newAddressSessionData(session).addressJourney,
          addressSelected: 'new'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/address/${session.id}/postcode`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          addressJourney: _newAddressSessionData(session).addressJourney,
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
            addressJourney: sessionData.addressJourney,
            addressSelected: 'new'
          },
          { skip: ['addressJourney', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/address/${session.id}/postcode`
        })
      })
    })

    describe('when the user selects a new address after already having chosen an existing address', () => {
      beforeEach(async () => {
        sessionData = _commonSessionData(session)

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitExistingAddressService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            ..._commonSessionData(sessionData),
            addressJourney: _newAddressSessionData(session).addressJourney,
            addressSelected: payload.addressSelected
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitExistingAddressService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/address/${session.id}/postcode`
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}

      Sinon.stub(FetchExistingAddressesService, 'go').returns(addresses)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAddressService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#addressSelected',
            text: `Select an existing address for ${session.billingAccount.company.name}`
          }
        ],
        addressSelected: { text: `Select an existing address for ${session.billingAccount.company.name}` }
      })
    })
  })
})

function _addresses() {
  return [
    {
      address: {
        id: generateUUID(),
        address1: 'ENVIRONMENT AGENCY',
        address2: 'HORIZON HOUSE',
        address3: 'DEANERY ROAD',
        address4: 'BRISTOL',
        address5: 'BRISTOLSHIRE',
        address6: null,
        postcode: 'BS1 5AH'
      }
    }
  ]
}

function _commonExpectedValues() {
  return {
    accountSelected: 'existing',
    addressJourney: null,
    contactName: null,
    contactSelected: null,
    fao: null
  }
}

function _newAddressExpectedValues() {
  return {
    ..._commonExpectedValues(),
    addressSelected: 'new'
  }
}

function _newAddressSessionData(session) {
  return {
    ..._commonSessionData(session),
    addressSelected: 'new',
    addressJourney: {
      address: {},
      backLink: {
        href: `/system/billing-accounts/setup/${session.id}/existing-address`,
        text: 'Back'
      },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    }
  }
}

function _commonSessionData() {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  return {
    accountSelected: 'existing',
    billingAccount,
    contactName: 'Contact Name',
    contactSelected: 'new',
    fao: 'yes'
  }
}
