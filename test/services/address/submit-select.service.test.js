// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../support/stubs/session.stub.js'
import { generateUUID } from '../../support/generators.js'
import http2 from 'node:http2'

// Things we need to stub
import * as FetchSessionDal from '../../../app/dal/fetch-session.dal.js'
import * as LookupPostcodeRequest from '../../../app/requests/address-facade/lookup-postcode.request.js'
import * as LookupUPRNRequest from '../../../app/requests/address-facade/lookup-uprn.request.js'

// Thing under test
import SubmitSelectService from '../../../app/services/address/submit-select.service.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Address - Submit Select Service', () => {
  const match = {
    uprn: 340116,
    address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    organisation: 'ENVIRONMENT AGENCY',
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    locality: 'VILLAGE GREEN',
    city: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom'
  }

  let lookupPostcodeRequestStub
  let lookupUPRNRequestStub
  let payload
  let session
  let sessionData
  let sessionId

  beforeEach(() => {
    sessionId = generateUUID()

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

    lookupPostcodeRequestStub = vi.spyOn(LookupPostcodeRequest, 'send').mockImplementation(() => {})
    lookupUPRNRequestStub = vi.spyOn(LookupUPRNRequest, 'send').mockImplementation(() => {})

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the selected address has an "organisation"', () => {
        beforeEach(() => {
          payload = { addresses: '340116' }

          lookupUPRNRequestStub.mockResolvedValue({
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

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          expect(session.addressJourney.address).toEqual({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE DEANERY ROAD',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
          expect(session.addressJourney.backUrl).toEqual(`/system/address/${session.id}/select`)
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the selected address does not have an "organisation"', () => {
        beforeEach(() => {
          payload = {
            addresses: '340116'
          }

          const noOrganisation = {
            ...match,
            organisation: null
          }

          lookupUPRNRequestStub.mockResolvedValue({
            succeeded: true,
            response: {
              statusCode: HTTP_STATUS_OK,
              body: {
                results: [noOrganisation]
              }
            },
            matches: [noOrganisation]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          expect(session.addressJourney.address).toEqual({
            uprn: 340116,
            addressLine1: 'HORIZON HOUSE DEANERY ROAD',
            addressLine2: null,
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
          expect(session.addressJourney.backUrl).toEqual(`/system/address/${session.id}/select`)
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the selected address does not have a "premises"', () => {
        beforeEach(() => {
          payload = {
            addresses: '340116'
          }

          const noPremises = {
            ...match,
            premises: null
          }

          lookupUPRNRequestStub.mockResolvedValue({
            succeeded: true,
            response: {
              statusCode: HTTP_STATUS_OK,
              body: {
                results: [noPremises]
              }
            },
            matches: [noPremises]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          expect(session.addressJourney.address).toEqual({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'DEANERY ROAD',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
          expect(session.addressJourney.backUrl).toEqual(`/system/address/${session.id}/select`)
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the selected address does not have a "premises"', () => {
        beforeEach(() => {
          payload = {
            addresses: '340116'
          }

          const noPremises = {
            ...match,
            street_address: null
          }

          lookupUPRNRequestStub.mockResolvedValue({
            succeeded: true,
            response: {
              statusCode: HTTP_STATUS_OK,
              body: {
                results: [noPremises]
              }
            },
            matches: [noPremises]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          expect(session.addressJourney.address).toEqual({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
          expect(session.addressJourney.backUrl).toEqual(`/system/address/${session.id}/select`)
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('and the selected address does not have a "locality"', () => {
        beforeEach(() => {
          payload = {
            addresses: '340116'
          }

          const noPremises = {
            ...match,
            locality: null
          }

          lookupUPRNRequestStub.mockResolvedValue({
            succeeded: true,
            response: {
              statusCode: HTTP_STATUS_OK,
              body: {
                results: [noPremises]
              }
            },
            matches: [noPremises]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          expect(session.addressJourney.address).toEqual({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE DEANERY ROAD',
            addressLine3: null,
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
          expect(session.addressJourney.backUrl).toEqual(`/system/address/${session.id}/select`)
          expect(session.$update).toHaveBeenCalled()
        })
      })

      describe('but the UPRN lookup fails', () => {
        beforeEach(() => {
          payload = { addresses: '340116' }

          lookupUPRNRequestStub.mockResolvedValue({
            succeeded: false,
            response: {
              statusCode: HTTP_STATUS_NOT_FOUND,
              body: {
                facade_status_code: HTTP_STATUS_NOT_FOUND,
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

        it('returns page data that causes a redirect to the manual page', async () => {
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({
            redirect: `/system/address/${sessionId}/manual`
          })
        })
      })

      describe('but the UPRN lookup _now_ returns no matches', () => {
        beforeEach(() => {
          lookupUPRNRequestStub.mockResolvedValue({
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
          const result = await SubmitSelectService(sessionId, payload)

          expect(result).toEqual({
            redirect: `/system/address/${sessionId}/manual`
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected an address', () => {
        beforeEach(() => {
          payload = {
            addresses: 'select'
          }
        })

        describe('and the postcode lookup succeeds', () => {
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

          it('returns page data needed to re-render the view including the validation error', async () => {
            const result = await SubmitSelectService(sessionId, payload)

            expect(result).toEqual({
              error: {
                addresses: { text: 'Select an address' },
                errorList: [
                  {
                    href: '#addresses',
                    text: 'Select an address'
                  }
                ]
              },
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

        describe('but the postcode lookup fails', () => {
          beforeEach(() => {
            lookupPostcodeRequestStub.mockResolvedValue({
              succeeded: false,
              response: {
                statusCode: HTTP_STATUS_NOT_FOUND,
                body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
              },
              matches: []
            })
          })

          it('returns page data that causes a redirect to the manual page', async () => {
            const result = await SubmitSelectService(sessionId, payload)

            expect(result).toEqual({
              redirect: `/system/address/${sessionId}/manual`
            })
          })
        })

        describe('but the postcode lookup _now_ returns no matches', () => {
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
            const result = await SubmitSelectService(sessionId, payload)

            expect(result).toEqual({
              redirect: `/system/address/${sessionId}/manual`
            })
          })
        })
      })
    })
  })
})
