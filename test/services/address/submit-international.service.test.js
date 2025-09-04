'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { countries } = require('../../../app/lib/static-lookups.lib.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitInternationalService = require('../../../app/services/address/submit-international.service.js')

describe('Address - Submit International Service', () => {
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
      beforeEach(async () => {
        payload = {
          addressLine1: 'Falsches Unternehmen',
          addressLine2: '1 Fake-Straße',
          addressLine3: 'Falsches Dorf',
          addressLine4: 'Falsche Stadt',
          country: 'Germany',
          postcode: '80802'
        }
      })

      it('saves the submitted address and returns the specified redirect URL', async () => {
        const result = await SubmitInternationalService.go(sessionId, payload)

        expect(result).to.equal({ redirect: `/system/notices/setup/${sessionId}/add-recipient` })

        const refreshedSession = await session.$query()

        expect(refreshedSession.addressJourney.address).to.equal({
          addressLine1: 'Falsches Unternehmen',
          addressLine2: '1 Fake-Straße',
          addressLine3: 'Falsches Dorf',
          addressLine4: 'Falsche Stadt',
          country: 'Germany',
          postcode: '80802'
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitInternationalService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              addressLine1: 'Enter address line 1',
              country: 'Select a country',
              errorList: [
                {
                  href: '#addressLine1',
                  text: 'Enter address line 1'
                },
                {
                  href: '#country',
                  text: 'Select a country'
                }
              ]
            },
            activeNavBar: 'manage',
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            backLink: {
              href: `/system/address/${sessionId}/postcode`,
              text: 'Back'
            },
            country: _countries(),
            pageTitle: 'Enter the international address',
            postcode: null
          })
        })
      })

      describe('because the user did not select a country', () => {
        beforeEach(() => {
          payload = { addressLine1: 'Falsches Unternehmen' }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitInternationalService.go(sessionId, payload)

          expect(result).to.equal({
            error: {
              country: 'Select a country',
              errorList: [
                {
                  href: '#country',
                  text: 'Select a country'
                }
              ]
            },
            activeNavBar: 'manage',
            addressLine1: 'Falsches Unternehmen',
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            backLink: {
              href: `/system/address/${sessionId}/postcode`,
              text: 'Back'
            },
            country: _countries(),
            pageTitle: 'Enter the international address',
            postcode: null
          })
        })
      })
    })
  })
})

function _countries(savedCountry) {
  const displayCountries = countries.map((country) => {
    return {
      value: country,
      selected: savedCountry === country,
      text: country
    }
  })

  displayCountries.unshift({
    value: 'select',
    selected: savedCountry !== 'select',
    text: 'Select a country'
  })

  return displayCountries
}
