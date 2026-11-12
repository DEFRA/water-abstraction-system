// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as LookupPostcodeRequest from '../../../src/requests/address-facade/lookup-postcode.request.js'

// Thing under test
import SelectService from '../../../src/services/address/select.service.js'

const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants

describe('Address - Select service', () => {
  const match = {
    address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    city: 'BRISTOL',
    country: 'United Kingdom',
    locality: null,
    organisation: 'ENVIRONMENT AGENCY',
    postcode: 'BS1 5AH',
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    uprn: 340116
  }
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  let lookupPostcodeRequestStub
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      addressJourney: {
        activeNavBar: 'manage',
        address: { postcode: 'BS1 5AH' },
        backLink: {
          href: `/system/notices/setup/${sessionId}/contact-type`,
          text: 'Back'
        },
        redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
      },
      id: sessionId
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    lookupPostcodeRequestStub = vi.spyOn(LookupPostcodeRequest, 'default').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the postcode lookup returns a match', () => {
      beforeEach(() => {
        lookupPostcodeRequestStub.mockResolvedValue({
          matches: [match],
          response: {
            body: {
              results: [match]
            },
            statusCode: HTTP_STATUS_OK
          },
          succeeded: true
        })
      })

      it('returns page data for the view', async () => {
        const result = await SelectService(sessionId)

        expect(result).toEqual({
          activeNavBar: 'manage',
          addresses: [
            {
              selected: true,
              text: `1 address found`,
              value: 'select'
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
      beforeEach(() => {
        lookupPostcodeRequestStub.mockResolvedValue({
          matches: [],
          response: {
            body: {
              results: []
            },
            statusCode: HTTP_STATUS_OK
          },
          succeeded: true
        })
      })

      it('returns page data that causes a redirect to the manual page', async () => {
        const result = await SelectService(sessionId)

        expect(result).toEqual({ redirect: true })
      })
    })

    describe('and the postcode lookup fails', () => {
      beforeEach(() => {
        lookupPostcodeRequestStub.mockResolvedValue({
          matches: [],
          response: {
            body: {
              error: 'Computer says no',
              message: 'Computer says no',
              statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR
            },
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR
          },
          succeeded: false
        })
      })

      it('returns page data that causes a redirect to the manual page', async () => {
        const result = await SelectService(sessionId)

        expect(result).toEqual({ redirect: true })
      })
    })
  })
})
