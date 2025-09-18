'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
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
    locality: 'VILLAGE GREEN',
    city: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom'
  }

  let lookupPostcodeRequestStub
  let lookupUPRNRequestStub
  let payload
  let session
  let sessionId

  beforeEach(async () => {
    sessionId = generateUUID()

    session = await SessionHelper.add({
      id: sessionId,
      data: {
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
    })

    lookupPostcodeRequestStub = Sinon.stub(LookupPostcodeRequest, 'send')
    lookupUPRNRequestStub = Sinon.stub(LookupUPRNRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the selected address has an "organisation"', () => {
        beforeEach(async () => {
          payload = { addresses: '340116' }

          lookupUPRNRequestStub.resolves({
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

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          const refreshedSession = await session.$query()

          expect(refreshedSession.addressJourney.address).to.equal({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE DEANERY ROAD',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
        })
      })

      describe('and the selected address does not have an "organisation"', () => {
        beforeEach(async () => {
          payload = {
            addresses: '340116'
          }

          const noOrganisation = {
            ...match,
            organisation: null
          }

          lookupUPRNRequestStub.resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                results: [noOrganisation]
              }
            },
            matches: [noOrganisation]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          const refreshedSession = await session.$query()

          expect(refreshedSession.addressJourney.address).to.equal({
            uprn: 340116,
            addressLine1: 'HORIZON HOUSE DEANERY ROAD',
            addressLine2: null,
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
        })
      })

      describe('and the selected address does not have a "premises"', () => {
        beforeEach(async () => {
          payload = {
            addresses: '340116'
          }

          const noPremises = {
            ...match,
            premises: null
          }

          lookupUPRNRequestStub.resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                results: [noPremises]
              }
            },
            matches: [noPremises]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          const refreshedSession = await session.$query()

          expect(refreshedSession.addressJourney.address).to.equal({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'DEANERY ROAD',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
        })
      })

      describe('and the selected address does not have a "premises"', () => {
        beforeEach(async () => {
          payload = {
            addresses: '340116'
          }

          const noPremises = {
            ...match,
            street_address: null
          }

          lookupUPRNRequestStub.resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                results: [noPremises]
              }
            },
            matches: [noPremises]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          const refreshedSession = await session.$query()

          expect(refreshedSession.addressJourney.address).to.equal({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
        })
      })

      describe('and the selected address does not have a "locality"', () => {
        beforeEach(async () => {
          payload = {
            addresses: '340116'
          }

          const noPremises = {
            ...match,
            locality: null
          }

          lookupUPRNRequestStub.resolves({
            succeeded: true,
            response: {
              statusCode: 200,
              body: {
                results: [noPremises]
              }
            },
            matches: [noPremises]
          })
        })

        it('maps then saves the selected address and returns the specified redirect URL', async () => {
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

          const refreshedSession = await session.$query()

          expect(refreshedSession.addressJourney.address).to.equal({
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE DEANERY ROAD',
            addressLine3: null,
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          })
        })
      })

      describe('but the UPRN lookup fails', () => {
        beforeEach(() => {
          payload = { addresses: '340116' }

          lookupUPRNRequestStub.resolves({
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

        it('returns page data that causes a redirect to the manual page', async () => {
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({
            redirect: `/system/address/${sessionId}/manual`
          })
        })
      })

      describe('but the UPRN lookup _now_ returns no matches', () => {
        beforeEach(() => {
          lookupUPRNRequestStub.resolves({
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
          const result = await SubmitSelectService.go(sessionId, payload)

          expect(result).to.equal({
            redirect: `/system/address/${sessionId}/manual`
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected an address', () => {
        beforeEach(async () => {
          payload = {
            addresses: 'select'
          }
        })

        describe('and the postcode lookup succeeds', () => {
          beforeEach(async () => {
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

          it('returns page data needed to re-render the view including the validation error', async () => {
            const result = await SubmitSelectService.go(sessionId, payload)

            expect(result).to.equal({
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
            lookupPostcodeRequestStub.resolves({
              succeeded: false,
              response: {
                statusCode: 404,
                body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
              },
              matches: []
            })
          })

          it('returns page data that causes a redirect to the manual page', async () => {
            const result = await SubmitSelectService.go(sessionId, payload)

            expect(result).to.equal({
              redirect: `/system/address/${sessionId}/manual`
            })
          })
        })

        describe('but the postcode lookup _now_ returns no matches', () => {
          beforeEach(() => {
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
            const result = await SubmitSelectService.go(sessionId, payload)

            expect(result).to.equal({
              redirect: `/system/address/${sessionId}/manual`
            })
          })
        })
      })
    })
  })
})
