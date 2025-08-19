'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { countries } = require('../../../app/lib/static-lookups.lib.js')

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitInternationalService = require('../../../app/services/address/submit-international.service.js')

describe('Address - International Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {
      address: {}
    }

    session = await SessionHelper.add({ data: sessionData })

    session.address.redirectUrl = `/system/notices/setup/${session.id}/check`

    await session.$update()
  })

  describe('when called', () => {
    beforeEach(async () => {
      payload = {
        addressLine1: '1 Fake Farm',
        addressLine2: '1 Fake street',
        addressLine3: 'Fake Village',
        addressLine4: 'Fake City',
        country: 'Ireland',
        postcode: 'SW1A 1AA'
      }
    })

    it('with a full payload it saves the submitted values', async () => {
      await SubmitInternationalService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {
          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2,
          addressLine3: payload.addressLine3,
          addressLine4: payload.addressLine4,
          country: payload.country,
          postcode: payload.postcode,
          redirectUrl: session.address.redirectUrl
        }
      })
    })

    it('with a min payload saves the submitted values', async () => {
      const minPayload = {
        addressLine1: '1 Fake Farm',
        country: 'Ireland'
      }

      await SubmitInternationalService.go(session.id, minPayload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {
          addressLine1: payload.addressLine1,
          addressLine2: null,
          addressLine3: null,
          addressLine4: null,
          country: payload.country,
          postcode: null,
          redirectUrl: session.address.redirectUrl
        }
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitInternationalService.go(session.id, payload)

      expect(result).to.equal({
        redirect: `/system/notices/setup/${session.id}/check`
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitInternationalService.go(session.id, payload)

      expect(result).to.equal({
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: `/system/address/${session.id}/postcode`,
        country: _countries(),
        error: {
          addressLine1: 'Enter address line 1',
          errorList: [
            {
              href: '#addressLine1',
              text: 'Enter address line 1'
            },
            {
              href: '#country',
              text: 'Select a country'
            }
          ],
          country: 'Select a country'
        },
        pageTitle: 'Enter the international address',
        postcode: null
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
