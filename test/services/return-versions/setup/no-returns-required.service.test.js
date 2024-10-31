'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const NoReturnsRequiredService = require('../../../../app/services/return-versions/setup/no-returns-required.service.js')

describe('Return Versions Setup - No Returns Required service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        checkPageVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          returnVersions: [{
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'no-returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Why are no returns required?',
        backLink: `/system/return-versions/setup/${session.id}/start-date`,
        licenceRef: '01/ABC',
        reason: null
      }, { skip: ['sessionId'] })
    })
  })
})
