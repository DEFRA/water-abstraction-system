'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitPostcodeService = require('../../../app/services/address/submit-postcode.service.js')

describe('Address - Submit Postcode Service', () => {
  let payload
  let session
  let sessionData

  describe('when called with a valid payload', () => {
    beforeEach(async () => {
      payload = {
        postcode: 'SW1A 1AA'
      }
      sessionData = {
        address: {}
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitPostcodeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.address.postcode).to.equal(payload.postcode)
    })

    it('continues on the journey', async () => {
      const result = await SubmitPostcodeService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when called with a previously saved address', () => {
    describe('and with a valid payload', () => {
      beforeEach(async () => {
        payload = {
          postcode: 'SW1A 1AA'
        }
        sessionData = {
          address: {
            addressLine1: '1 Fake Farm',
            addressLine2: '1 Fake street',
            addressLine3: 'Fake Village',
            addressLine4: 'Fake City',
            postcode: 'SW1A 1AA'
          }
        }

        session = await SessionHelper.add({ data: sessionData })

        session.address.redirectUrl = `/system/notices/setup/${session.id}/check`

        await session.$update()
      })

      it('resets the address object to postcode plus redirectUrl', async () => {
        await SubmitPostcodeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.address).to.equal({
          postcode: payload.postcode,
          redirectUrl: session.address.redirectUrl
        })
      })

      it('continues on the journey', async () => {
        const result = await SubmitPostcodeService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })
  })

  describe('when called with a invalid payload', () => {
    describe('when there is no value provided', () => {
      beforeEach(async () => {
        payload = {}
        sessionData = {
          address: {
            backLink: {
              href: `/system/notices/setup/123/contact-type`
            }
          },
          contactName: 'Fake Person'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns the page data with an appropriate error', async () => {
        const result = await SubmitPostcodeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
          backLink: `/system/notices/setup/123/contact-type`,
          internationalLink: `/system/address/${session.id}/international`,
          error: { text: 'Enter a UK postcode' },
          pageTitle: 'Enter a UK postcode',
          postcode: null
        })
      })
    })

    describe('when there is an invalid value provided', () => {
      beforeEach(async () => {
        payload = { postcode: 'notapostcode' }
        sessionData = {
          address: {
            backLink: {
              href: `/system/notices/setup/123/contact-type`
            }
          },
          contactName: 'Fake Person'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns the page data with an appropriate error', async () => {
        const result = await SubmitPostcodeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
          backLink: `/system/notices/setup/123/contact-type`,
          error: { text: 'Enter a valid UK postcode' },
          internationalLink: `/system/address/${session.id}/international`,
          pageTitle: 'Enter a UK postcode',
          postcode: 'notapostcode'
        })
      })
    })
  })
})
