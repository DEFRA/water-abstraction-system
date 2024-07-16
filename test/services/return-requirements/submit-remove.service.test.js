'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitRemoveService = require('../../../app/services/return-requirements/submit-remove.service.js')

describe('Return Requirements - Submit Remove service', () => {
  const requirementIndex = 0

  let session
  let yarStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      id: '61e07498-f309-4829-96a9-72084a54996d',
      data: {
        checkPageVisited: false,
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
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })

    yarStub = {
      flash: Sinon.stub()
    }
  })

  describe('when a user submits the return requirements to be removed', () => {
    it('deletes the selected requirement from the session data', async () => {
      await SubmitRemoveService.go(session.id, requirementIndex, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.requirements[requirementIndex]).not.to.exist()
    })

    it('sets the notification message to "Requirements removed"', async () => {
      await SubmitRemoveService.go(session.id, requirementIndex, yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({ title: 'Removed', text: 'Requirement removed' })
    })
  })
})
