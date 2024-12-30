'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSeasonService = require('../../../../app/services/bill-runs/setup/submit-season.service.js')

describe('Bill Runs - Setup - Submit Season service', () => {
  let payload
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: {} })
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          season: 'summer'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitSeasonService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.season).to.equal('summer')
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitSeasonService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitSeasonService.go(session.id, payload)

          expect(result).to.equal({
            error: {
              text: 'Select the season'
            },
            pageTitle: 'Select the season',
            sessionId: session.id,
            selectedSeason: null
          })
        })
      })
    })
  })
})
