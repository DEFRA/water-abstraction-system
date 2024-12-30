'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const LicenceService = require('../../../../app/services/notifications/ad-hoc-returns/licence.service.js')

describe('Notifications Ad-hoc Returns - Licence service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { licenceRef: '01/111' } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceService.go(session.id)

      expect(result).to.equal({
        sessionId: session.id,
        licenceRef: '01/111'
      })
    })
  })
})
