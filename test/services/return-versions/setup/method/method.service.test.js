'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../../support/database.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const MethodService = require('../../../../../app/services/return-versions/setup/method/method.service.js')

describe('Return Versions Setup - Method service', () => {
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
          returnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01T00:00:00.000Z',
              reason: null
            }
          ],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await MethodService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await MethodService.go(session.id)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          pageTitle: 'How do you want to set up the requirements for returns?',
          backLink: `/system/return-versions/setup/${session.id}/reason`,
          displayCopyExisting: true,
          licenceRef: '01/ABC',
          method: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
