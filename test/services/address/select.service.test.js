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
const LookupPostcodeRequest = require('../../../app/requests/address-lookup/lookup-postcode.request.js')

// Thing under test
const SelectService = require('../../../app/services/address/select.service.js')

describe('Address - Select Service', () => {
  let getByPostcodeStub
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

  describe('when called with a postcode that returns one result', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(LookupPostcodeRequest, 'send')
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

    it('returns page data for the view', async () => {
      const result = await SelectService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        addresses: [
          {
            value: 'select',
            selected: true,
            text: `1 address found`
          },
          {
            text: 'address 1',
            value: '123456789'
          }
        ],
        pageTitle: 'Select the address',
        postcode: 'SW1A 1AA',
        sessionId: session.id
      })
    })
  })

  describe('when called with a postcode that returns multiple results', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(LookupPostcodeRequest, 'send')
      getByPostcodeStub.resolves({
        succeeded: true,
        results: [
          {
            address: 'address 1',
            postcode: 'SW1A 1AA',
            uprn: '123456789'
          },
          {
            address: 'address 2',
            postcode: 'SW1A 1AA',
            uprn: '123456780'
          }
        ]
      })
    })

    it('returns page data for the view', async () => {
      const result = await SelectService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        addresses: [
          {
            value: 'select',
            selected: true,
            text: `2 addresses found`
          },
          {
            text: 'address 1',
            value: '123456789'
          },
          {
            text: 'address 2',
            value: '123456780'
          }
        ],
        pageTitle: 'Select the address',
        postcode: 'SW1A 1AA',
        sessionId: session.id
      })
    })
  })

  describe('when called with a postcode that returns no results', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(LookupPostcodeRequest, 'send')
      getByPostcodeStub.resolves({
        succeeded: true,
        results: []
      })
    })

    it('returns page data that causes a redirect to the manual page', async () => {
      const result = await SelectService.go(session.id)

      expect(result).to.equal({
        redirect: true
      })
    })
  })

  describe('when called with a postcode but the request to the look up service fails', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: sessionData })
      getByPostcodeStub = Sinon.stub(LookupPostcodeRequest, 'send')
      getByPostcodeStub.resolves({
        succeeded: false
      })
    })

    it('returns page data to that causes a redirect to the manual page', async () => {
      const result = await SelectService.go(session.id)

      expect(result).to.equal({
        redirect: true
      })
    })
  })
})
