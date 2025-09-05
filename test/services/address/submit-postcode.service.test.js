'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitPostcodeService = require('../../../app/services/address/submit-postcode.service.js')

describe('Address - Submit Postcode Service', () => {
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
          address: {},
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
        }
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { postcode: 'SW1A 1AA' }
      })

      it('saves the submitted postcode and returns an empty object (tells controller to redirect to next page)', async () => {
        const result = await SubmitPostcodeService.go(sessionId, payload)

        expect(result).to.equal({})

        const refreshedSession = await session.$query()

        expect(refreshedSession.addressJourney.address.postcode).to.equal('SW1A 1AA')
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitPostcodeService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              errorList: [
                {
                  href: '#postcode',
                  text: 'Enter a UK postcode'
                }
              ],
              postcode: { text: 'Enter a UK postcode' }
            },
            activeNavBar: 'manage',
            backLink: {
              href: `/system/notices/setup/${sessionId}/contact-type`,
              text: 'Back'
            },
            internationalLink: `/system/address/${sessionId}/international`,
            pageTitle: 'Enter a UK postcode',
            postcode: null
          })
        })
      })

      describe('because the user entered an invalid postcode', () => {
        beforeEach(() => {
          payload = { postcode: 'foo' }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitPostcodeService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              errorList: [
                {
                  href: '#postcode',
                  text: 'Enter a valid UK postcode'
                }
              ],
              postcode: { text: 'Enter a valid UK postcode' }
            },
            activeNavBar: 'manage',
            backLink: {
              href: `/system/notices/setup/${sessionId}/contact-type`,
              text: 'Back'
            },
            internationalLink: `/system/address/${sessionId}/international`,
            pageTitle: 'Enter a UK postcode',
            postcode: 'foo'
          })
        })
      })
    })
  })
})
