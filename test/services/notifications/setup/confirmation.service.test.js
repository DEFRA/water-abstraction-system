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
const ConfirmationService = require('../../../../app/services/notifications/setup/confirmation.service.js')

describe('Notifications Setup - Confirmation service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { referenceCode: 'ADHC-1234', journey: 'ad-hoc' } })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ConfirmationService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: '/manage',
        forwardLink: '/notifications/report',
        pageTitle: 'Returns ad-hoc sent',
        referenceCode: 'ADHC-1234'
      })
    })
  })
})
