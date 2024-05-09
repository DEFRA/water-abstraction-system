'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitCancelService = require('../../../app/services/return-requirements/submit-cancel.service.js')

describe('Submit Cancel service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      id: '61e07498-f309-4829-96a9-72084a54996d',
      data: {
        checkYourAnswersVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{
          points: [
            'At National Grid Reference TQ 6520 5937 (POINT A, ADDINGTON SANDPITS)'
          ],
          purposes: [
            'Mineral Washing'
          ],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Bore hole in rear field',
          abstractionPeriod: {
            'end-abstraction-period-day': '31',
            'end-abstraction-period-month': '10',
            'start-abstraction-period-day': '1',
            'start-abstraction-period-month': '4'
          },
          frequencyReported: 'monthly',
          frequencyCollected: 'monthly',
          agreementsExceptions: [
            'none'
          ]
        }],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  describe('when a user submits the return requirements to be cancelled', () => {
    it('deletes the session data', async () => {
      await SubmitCancelService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession).not.to.exist()
    })
  })
})
