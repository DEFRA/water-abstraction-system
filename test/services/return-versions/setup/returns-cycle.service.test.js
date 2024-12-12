'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReturnsCycleService = require('../../../../app/services/return-versions/setup/returns-cycle.service.js')

describe('Return Versions Setup - Returns Cycle service', () => {
  const requirementIndex = 0

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
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ReturnsCycleService.go(session.id, requirementIndex)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ReturnsCycleService.go(session.id, requirementIndex)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          pageTitle: 'Select the returns cycle for the requirements for returns',
          backLink: `/system/return-versions/setup/${session.id}/abstraction-period/0`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          returnsCycle: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
