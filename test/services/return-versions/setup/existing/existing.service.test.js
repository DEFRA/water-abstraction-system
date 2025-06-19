'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const ExistingService = require('../../../../../app/services/return-versions/setup/existing/existing.service.js')

describe('Return Versions - Setup - Existing service', () => {
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
              reason: null,
              modLogs: []
            }
          ],
          startDate: '2022-04-01T00:00:00.000Z',
          waterUndertaker: false
        },
        multipleUpload: false,
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        returnVersionStartDate: '2023-01-01T00:00:00.000Z',
        licenceVersion: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          endDate: null,
          startDate: '2022-04-01T00:00:00.000Z',
          copyableReturnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01T00:00:00.000Z',
              reason: null,
              modLogs: []
            }
          ]
        },
        reason: 'major-change'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ExistingService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ExistingService.go(session.id)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          pageTitle: 'Use previous requirements for returns',
          backLink: `/system/return-versions/setup/${session.id}/method`,
          existingOptions: [{ value: '60b5d10d-1372-4fb2-b222-bfac81da69ab', text: '1 January 2023' }],
          licenceRef: '01/ABC'
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
