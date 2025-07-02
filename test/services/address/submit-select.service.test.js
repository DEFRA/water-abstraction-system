'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things to stub
const AddressLookupRequest = require('../../../app/requests/address-lookup.request.js')

// Thing under test
const SubmitSelectService = require('../../../app/services/address/submit-select.service.js')

describe('Address - Submit Select Service', () => {
  let getByPostcodeStub
  let getByUPRNStub
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      address: {
        postcode: 'SW1A 1AA'
      }
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid UPRN', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(AddressLookupRequest, 'getByPostcode')
      getByUPRNStub = Sinon.stub(AddressLookupRequest, 'getByUPRN')
      payload = {
        addresses: '123456789'
      }
      getByUPRNStub.resolves({
        succeeded: true,
        results: [
          {
            uprn: '123456789',
            organisation: 'organisation',
            premises: 'premises',
            street_address: 'street_address',
            locality: 'locality',
            city: 'city',
            postcode: 'postcode',
            country: 'country'
          }
        ]
      })
    })

    it('saves the submitted value', async () => {
      await SubmitSelectService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.address).to.equal({
        uprn: '123456789',
        addressLine1: 'organisation',
        addressLine2: 'premises',
        addressLine3: 'street_address',
        addressLine4: 'locality',
        town: 'city',
        postcode: 'postcode',
        country: 'country'
      })
    })

    it('continues on the journey', async () => {
      const result = await SubmitSelectService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when called with a invalid UPRN', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(AddressLookupRequest, 'getByPostcode')
      getByUPRNStub = Sinon.stub(AddressLookupRequest, 'getByUPRN')
      payload = {
        addresses: '123456789'
      }
      getByUPRNStub.resolves({
        succeeded: false,
        results: []
      })
      getByPostcodeStub.resolves({
        succeeded: true,
        results: [
          {
            address: 'address 1',
            postcode: 'SW1A 1AA',
            uprn: '123456789'
          }
        ]
      })
    })

    it('renders the page with an error', async () => {
      const result = await SubmitSelectService.go(session.id, payload)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        error: {
          text: 'Address not found'
        },
        addresses: [
          {
            text: 'address 1',
            value: '123456789'
          },
          {
            value: 'select',
            selected: true,
            text: `1 address found`
          }
        ],
        pageTitle: 'Select the address',
        postcode: 'SW1A 1AA',
        sessionId: session.id
      })
    })
  })

  describe('when an address has not been selected', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(AddressLookupRequest, 'getByPostcode')
      getByUPRNStub = Sinon.stub(AddressLookupRequest, 'getByUPRN')
      payload = {
        addresses: 'select'
      }
      getByPostcodeStub.resolves({
        succeeded: true,
        results: [
          {
            address: 'address 1',
            postcode: 'SW1A 1AA',
            uprn: '123456789'
          }
        ]
      })
    })

    it('renders the page with an error', async () => {
      const result = await SubmitSelectService.go(session.id, payload)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        error: {
          text: 'Select an address'
        },
        addresses: [
          {
            text: 'address 1',
            value: '123456789'
          },
          {
            value: 'select',
            selected: true,
            text: `1 address found`
          }
        ],
        pageTitle: 'Select the address',
        postcode: 'SW1A 1AA',
        sessionId: session.id
      })
    })
  })
})
