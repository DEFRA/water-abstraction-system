'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const ManualService = require('../../../app/services/address/manual.service.js')

describe('Address - Manual Service', () => {
  let session
  let sessionData

  describe('when called with no saved address', () => {
    beforeEach(async () => {
      sessionData = {
        address: {}
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ManualService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: `/system/address/${session.id}/postcode`,
        pageTitle: 'Enter the address',
        postcode: null
      })
    })
  })

  describe('when called with just the postcode saved', () => {
    beforeEach(async () => {
      sessionData = {
        address: {
          postcode: 'SW1A 1AA'
        }
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ManualService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: `/system/address/${session.id}/postcode`,
        pageTitle: 'Enter the address',
        postcode: 'SW1A 1AA'
      })
    })
  })

  describe('when called with the entire address saved', () => {
    beforeEach(async () => {
      sessionData = {
        address: {
          uprn: '123456789',
          addressLine1: '1 Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        }
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ManualService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        addressLine1: '1 Fake Farm',
        addressLine2: '1 Fake street',
        addressLine3: 'Fake Village',
        addressLine4: 'Fake City',
        backLink: `/system/address/${session.id}/select`,
        pageTitle: 'Enter the address',
        postcode: 'SW1A 1AA'
      })
    })
  })
})
