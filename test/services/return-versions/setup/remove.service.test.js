'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const RemoveService = require('../../../../app/services/return-versions/setup/remove.service.js')

describe('Return Versions Setup - Remove service', () => {
  const requirementIndex = 0

  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      id: generateUUID(),
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
        journey: 'returns-required',
        requirements: [{
          points: ['At National Grid Reference TQ 6520 5937 (POINT A, ADDINGTON SANDPITS)'],
          purposes: [{ alias: '', description: 'Mineral Washing', id: '3a865331-d2f3-4acc-ac85-527fa2b0d2dd' }],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Bore hole in rear field',
          abstractionPeriod: {
            'end-abstraction-period-day': '31',
            'end-abstraction-period-month': '10',
            'start-abstraction-period-day': '1',
            'start-abstraction-period-month': '4'
          },
          frequencyReported: 'month',
          frequencyCollected: 'month',
          agreementsExceptions: [
            'none'
          ]
        }],
        startDateOptions: 'licenceStartDate'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await RemoveService.go(session.id, requirementIndex)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await RemoveService.go(session.id, requirementIndex)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: `/system/return-versions/setup/${session.id}/check`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'You are about to remove these requirements for returns',
        returnRequirement: 'Winter and all year monthly requirements for returns, Bore hole in rear field.',
        sessionId: session.id,
        startDate: '1 January 2023'
      })
    })
  })
})
