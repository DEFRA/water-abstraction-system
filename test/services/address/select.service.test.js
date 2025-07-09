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
const LookupPostcodeRequest = require('../../../app/requests/address-facade/lookup-postcode.request.js')

// Thing under test
const SelectService = require('../../../app/services/address/select.service.js')

describe('Address - Select service', () => {
  const match = {
    uprn: 340116,
    address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    organisation: 'ENVIRONMENT AGENCY',
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    locality: null,
    city: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom'
  }

  let getByPostcodeStub
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { address: { postcode: 'BS1 5AH' } } })

    getByPostcodeStub = Sinon.stub(LookupPostcodeRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a postcode that returns one result', () => {
    beforeEach(async () => {
      getByPostcodeStub.resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            results: [match]
          }
        },
        matches: [match]
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
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
            value: 340116
          }
        ],
        pageTitle: 'Select the address',
        postcode: 'BS1 5AH',
        sessionId: session.id
      })
    })
  })

  describe('when called with a postcode that returns multiple results', () => {
    beforeEach(async () => {
      getByPostcodeStub.resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            results: [match]
          }
        },
        matches: [match, { ...match, uprn: 12345, address: 'DEFRA, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH' }]
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
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
            value: 340116
          },
          {
            text: 'DEFRA, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
            value: 12345
          }
        ],
        pageTitle: 'Select the address',
        postcode: 'BS1 5AH',
        sessionId: session.id
      })
    })
  })

  describe('when called with a postcode that returns no results', () => {
    beforeEach(async () => {
      getByPostcodeStub.resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            results: []
          }
        },
        matches: []
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
      getByPostcodeStub.resolves({
        succeeded: false,
        response: {
          statusCode: 404,
          body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
        },
        matches: []
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
