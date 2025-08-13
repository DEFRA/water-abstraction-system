'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitManualService = require('../../../app/services/address/submit-manual.service.js')

describe('Address - Submit Manual Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
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
        postcode: 'SW1A 1AA'
      }
    })

    it('with a full payload it saves the submitted values', async () => {
      await SubmitManualService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {
          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2,
          addressLine3: payload.addressLine3,
          addressLine4: payload.addressLine4,
          postcode: payload.postcode,
          redirectUrl: session.address.redirectUrl
        }
      })
    })

    it('with a min payload saves the submitted values', async () => {
      const minPayload = {
        addressLine1: '1 Fake Farm',
        postcode: 'SW1A 1AA'
      }

      await SubmitManualService.go(session.id, minPayload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {
          addressLine1: payload.addressLine1,
          addressLine2: null,
          addressLine3: null,
          addressLine4: null,
          postcode: payload.postcode,
          redirectUrl: session.address.redirectUrl
        }
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitManualService.go(session.id, payload)

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
      const result = await SubmitManualService.go(session.id, payload)

      expect(result).to.equal({
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: `/system/address/${session.id}/postcode`,
        error: {
          addressLine1: 'Enter address line 1',
          errorList: [
            {
              href: '#addressLine1',
              text: 'Enter address line 1'
            },
            {
              href: '#postcode',
              text: 'Enter a UK postcode'
            }
          ],
          postcode: 'Enter a UK postcode'
        },
        pageTitle: 'Enter the address',
        postcode: null
      })
    })
  })
})
