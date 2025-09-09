'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const LookupPostcodeRequest = require('../../../app/requests/address-facade/lookup-postcode.request.js')
const SessionModel = require('../../../app/models/session.model.js')

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
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  let lookupPostcodeRequestStub

  beforeEach(async () => {
    Sinon.stub(SessionModel, 'query').returns({
      findById: Sinon.stub().resolves({
        id: sessionId,
        addressJourney: {
          activeNavBar: 'manage',
          address: { postcode: 'BS1 5AH' },
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
        }
      })
    })

    lookupPostcodeRequestStub = Sinon.stub(LookupPostcodeRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the postcode lookup returns a match', () => {
      beforeEach(() => {
        lookupPostcodeRequestStub.resolves({
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
        const result = await SelectService.go(sessionId)

        expect(result).to.equal({
          activeNavBar: 'manage',
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
          backLink: {
            href: `/system/address/${sessionId}/postcode`,
            text: 'Back'
          },
          pageTitle: 'Select the address',
          pageTitleCaption: null,
          postcode: 'BS1 5AH',
          sessionId
        })
      })
    })

    describe('and the postcode lookup returns no matches', () => {
      beforeEach(async () => {
        lookupPostcodeRequestStub.resolves({
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
        const result = await SelectService.go(sessionId)

        expect(result).to.equal({ redirect: true })
      })
    })

    describe('and the postcode lookup fails', () => {
      beforeEach(async () => {
        lookupPostcodeRequestStub.resolves({
          succeeded: false,
          response: {
            statusCode: 500,
            body: { statusCode: 500, error: 'Computer says no', message: 'Computer says no' }
          },
          matches: []
        })
      })

      it('returns page data that causes a redirect to the manual page', async () => {
        const result = await SelectService.go(sessionId)

        expect(result).to.equal({ redirect: true })
      })
    })
  })
})
