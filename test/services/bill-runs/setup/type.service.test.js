'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

// Thing under test
const TypeService = require('../../../../app/services/bill-runs/setup/type.service.js')

describe('Bill Runs - Setup - Type service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { type: 'annual' } })

    // We set the `enableTwoPartTariffSupplementary` feature flag to `false` to ensure our tests are consistent
    Sinon.replace(FeatureFlagsConfig, 'enableTwoPartTariffSupplementary', false)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await TypeService.go(session.id)

      expect(result).to.equal({
        enableTwoPartTariffSupplementary: false,
        pageTitle: 'Select the bill run type',
        sessionId: session.id,
        selectedType: 'annual'
      })
    })
  })
})
