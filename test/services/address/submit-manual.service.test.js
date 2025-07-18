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

    it('saves the submitted value', async () => {
      await SubmitManualService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {
          addressLine1: '1 Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        }
      })
    })

    it('saves the submitted value', async () => {
      const minPayload = {
        addressLine1: '1 Fake Farm',
        postcode: 'SW1A 1AA'
      }

      await SubmitManualService.go(session.id, minPayload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {
          addressLine1: '1 Fake Farm',
          addressLine2: null,
          addressLine3: null,
          addressLine4: null,
          postcode: 'SW1A 1AA'
        }
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitManualService.go(session.id, payload)

      expect(result).to.equal({})
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
