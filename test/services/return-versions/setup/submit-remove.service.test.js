'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitRemoveService = require('../../../../app/services/return-versions/setup/submit-remove.service.js')

describe('Return Versions Setup - Submit Remove service', () => {
  const requirementIndex = 0

  let session
  let yarStub

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
        requirements: [
          {
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
            agreementsExceptions: ['none']
          }
        ],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })

    yarStub = {
      flash: Sinon.stub()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
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
