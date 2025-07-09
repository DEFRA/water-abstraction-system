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
        backLink: `/system/address/${session.id}/postcode`,
        county: null,
        pageTitle: 'Enter the address',
        postcode: null,
        town: null
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
        backLink: `/system/address/${session.id}/postcode`,
        county: null,
        pageTitle: 'Enter the address',
        postcode: 'SW1A 1AA',
        town: null
      })
    })
  })

  describe('when called with the entire address saved', () => {
    beforeEach(async () => {
      sessionData = {
        address: {
          uprn: '123456789',
          addressLine1: '1 Fake appartment',
          addressLine2: '1 Fake street',
          town: 'Fake Town',
          county: 'Fake County',
          postcode: 'SW1A 1AA'
        }
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ManualService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        addressLine1: '1 Fake appartment',
        addressLine2: '1 Fake street',
        backLink: `/system/address/${session.id}/select`,
        county: 'Fake County',
        pageTitle: 'Enter the address',
        postcode: 'SW1A 1AA',
        town: 'Fake Town'
      })
    })
  })
})
