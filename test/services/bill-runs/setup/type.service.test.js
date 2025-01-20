'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Test helpers
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

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await TypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        enableTwoPartTariffSupplementary: false,
        pageTitle: 'Select the bill run type',
        sessionId: session.id,
        selectedType: 'annual'
      })
    })
  })
})
