'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SeasonService = require('../../../../app/services/bill-runs/setup/season.service.js')

describe('Bill Runs - Setup - Type service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { season: 'summer' } })
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SeasonService.go(session.id)

      expect(result).to.equal({
        pageTitle: 'Select the season',
        sessionId: session.id,
        selectedSeason: 'summer'
      })
    })
  })
})
