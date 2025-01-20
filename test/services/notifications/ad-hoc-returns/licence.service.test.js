'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
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

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        sessionId: session.id,
        licenceRef: '01/111',
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
