'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitRemoveService = require('../../../../app/services/return-versions/setup/submit-remove.service.js')

describe('Return Versions Setup - Submit Remove service', () => {
  const requirementIndex = 0

  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
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
            abstractionPeriodEndDay: '31',
            abstractionPeriodEndMonth: '10',
            abstractionPeriodStartDay: '01',
            abstractionPeriodStartMonth: '04'
          },
          frequencyReported: 'month',
          frequencyCollected: 'month',
          agreementsExceptions: ['none']
        }
      ],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = {
      flash: Sinon.stub()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a user submits the return requirements to be removed', () => {
    it('deletes the selected requirement from the session data', async () => {
      await SubmitRemoveService.go(session.id, requirementIndex, yarStub)

      expect(session.requirements[requirementIndex]).not.to.exist()
      expect(session.$update.called).to.be.true()
    })

    it('sets the notification message to "Requirements removed"', async () => {
      await SubmitRemoveService.go(session.id, requirementIndex, yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({ title: 'Removed', text: 'Requirement removed' })
    })
  })
})
