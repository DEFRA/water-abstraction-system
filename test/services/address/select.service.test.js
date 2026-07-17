// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Test helpers
import SessionModelStub from '../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../app/dal/fetch-session.dal.js'
import * as LookupPostcodeRequest from '../../../app/requests/address-facade/lookup-postcode.request.js'

// Thing under test
import SelectService from '../../../app/services/address/select.service.js'

const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants

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
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
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
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: {
              results: [match]
            }
          },
          matches: [match]
        })
      })

      it('returns page data for the view', async () => {
        const result = await SelectService(sessionId)

        expect(result).toEqual({
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
      beforeEach(() => {
        lookupPostcodeRequestStub.mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: {
              results: []
            }
          },
          matches: []
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
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
            body: {
              statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
              error: 'Computer says no',
              message: 'Computer says no'
            }
          },
          matches: []
        })
      })

      it('returns page data that causes a redirect to the manual page', async () => {
        const result = await SelectService(sessionId)

        expect(result).toEqual({ redirect: true })
      })
    })
  })
})
