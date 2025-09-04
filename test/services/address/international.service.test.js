'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { countryLookup } = require('../../../app/presenters/address/base-address.presenter.js')

// Things we need to stub
const SessionModel = require('../../../app/models/session.model.js')

// Thing under test
const InternationalService = require('../../../app/services/address/international.service.js')

describe('Address - International Service', () => {
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  beforeEach(async () => {
    Sinon.stub(SessionModel, 'query').returns({
      findById: Sinon.stub().resolves({
        id: sessionId,
        addressJourney: {
          activeNavBar: 'manage',
          address: {},
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
      const result = await InternationalService.go(sessionId)

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
        country: countryLookup(),
        pageTitle: 'Enter the international address',
        postcode: null
      })
    })
  })
})
