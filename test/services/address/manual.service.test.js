'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const SessionModel = require('../../../app/models/session.model.js')

// Thing under test
const ManualService = require('../../../app/services/address/manual.service.js')

describe('Address - Manual Service', () => {
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  beforeEach(async () => {
    Sinon.stub(SessionModel, 'query').returns({
      findById: Sinon.stub().resolves({
        id: sessionId,
        addressJourney: {
          activeNavBar: 'manage',
          address: { postcode: 'SW1A 1AA' },
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
        }
      })
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ManualService.go(sessionId)

      expect(result).to.equal({
        activeNavBar: 'manage',
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: {
          href: `/system/address/${sessionId}/postcode`,
          text: 'Back'
        },
        pageTitle: 'Enter the address',
        postcode: 'SW1A 1AA'
      })
    })
  })
})
