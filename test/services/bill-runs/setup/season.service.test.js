'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SeasonService = require('../../../../app/services/bill-runs/setup/season.service.js')

describe('Bill Runs - Setup - Type service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { season: 'summer' } })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SeasonService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        pageTitle: 'Select the season',
        sessionId: session.id,
        selectedSeason: 'summer'
      })
    })
  })
})
