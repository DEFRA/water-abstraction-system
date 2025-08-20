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
const LookupUPRNRequest = require('../../../app/requests/address-facade/lookup-uprn.request.js')

// Thing under test
const SubmitSelectService = require('../../../app/services/address/submit-select.service.js')

describe('Address - Submit Select Service', () => {
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

  const matchWithoutOrganisation = {
    uprn: 340116,
    address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    organisation: null,
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    locality: 'VILLAGE GREEN',
    city: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom'
  }

  let getByPostcodeStub
  let getByUPRNStub
  let payload
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        address: {
          postcode: 'BS1 5AH',
          redirectUrl: '/system/notices/setup/0793ca8d-9a30-4ce6-92d8-6149b44a1b1d/add-recipient'
        }
      }
    })

    getByPostcodeStub = Sinon.stub(LookupPostcodeRequest, 'send')
    getByUPRNStub = Sinon.stub(LookupUPRNRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when an address has been selected with an organisation', () => {
    beforeEach(async () => {
      payload = {
        addresses: '340116'
      }

      getByUPRNStub.resolves({
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

    it('saves the submitted value', async () => {
      await SubmitSelectService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data.address).to.equal({
        uprn: 340116,
        addressLine1: 'ENVIRONMENT AGENCY',
        addressLine2: 'HORIZON HOUSE DEANERY ROAD',
        addressLine3: null,
        addressLine4: 'BRISTOL',
        postcode: 'BS1 5AH',
        redirectUrl: '/system/notices/setup/0793ca8d-9a30-4ce6-92d8-6149b44a1b1d/add-recipient'
      })
    })

    it('continues on the journey', async () => {
      const result = await SubmitSelectService.go(session.id, payload)

      expect(result).to.equal({
        redirect: '/system/notices/setup/0793ca8d-9a30-4ce6-92d8-6149b44a1b1d/add-recipient'
      })
    })
  })

  describe('when an address has been selected without an organisation', () => {
    beforeEach(async () => {
      payload = {
        addresses: '340116'
      }

      getByUPRNStub.resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            results: [matchWithoutOrganisation]
          }
        },
        matches: [matchWithoutOrganisation]
      })
    })

    it('saves the submitted value', async () => {
      await SubmitSelectService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data.address).to.equal({
        uprn: 340116,
        addressLine1: 'HORIZON HOUSE DEANERY ROAD',
        addressLine2: null,
        addressLine3: 'VILLAGE GREEN',
        addressLine4: 'BRISTOL',
        postcode: 'BS1 5AH',
        redirectUrl: '/system/notices/setup/0793ca8d-9a30-4ce6-92d8-6149b44a1b1d/add-recipient'
      })
    })

    it('continues on the journey', async () => {
      const result = await SubmitSelectService.go(session.id, payload)

      expect(result).to.equal({
        redirect: '/system/notices/setup/0793ca8d-9a30-4ce6-92d8-6149b44a1b1d/add-recipient'
      })
    })
  })

  describe('when an address has not been selected', () => {
    beforeEach(async () => {
      payload = {
        addresses: 'select'
      }

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

    it('renders the page with an error', async () => {
      const result = await SubmitSelectService.go(session.id, payload)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        error: {
          text: 'Select an address'
        },
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

  describe('when called with a invalid UPRN', () => {
    beforeEach(async () => {
      payload = {
        addresses: 'invalid'
      }

      getByUPRNStub.resolves({
        succeeded: false,
        response: {
          statusCode: 404,
          body: {
            facade_status_code: 404,
            facade_error_message: 'HTTP 404 Not Found',
            facade_error_code: 'address_service_error_11',
            supplier_was_called: null,
            supplier_status_code: null,
            supplier_response: null
          }
        },
        matches: []
      })
    })

    describe('and the postcode lookup succeeds and finds a match', () => {
      beforeEach(() => {
        getByPostcodeStub.resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: {
              results: []
            }
          },
          matches: [match]
        })
      })

      it('returns the page data with an error', async () => {
        const result = await SubmitSelectService.go(session.id, payload)

        expect(result).to.equal({
          backLink: `/system/address/${session.id}/postcode`,
          error: {
            text: 'Address not found'
          },
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

    describe('and the postcode lookup succeeds but has no matches', () => {
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
        const result = await SubmitSelectService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `/system/address/${session.id}/manual`
        })
      })
    })

    describe('but the postcode lookup fails', () => {
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

      it('returns page data that causes a redirect to the manual page', async () => {
        const result = await SubmitSelectService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `/system/address/${session.id}/manual`
        })
      })
    })
  })
})
