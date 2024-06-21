'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things we need to stub
const GenerateFromExistingRequirementsService = require('../../../app/services/return-requirements/generate-from-existing-requirements.service.js')

// Thing under test
const SubmitExistingService = require('../../../app/services/return-requirements/submit-existing.service.js')

describe('Return Requirements - Submit Existing service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    await DatabaseSupport.clean()

    sessionData = {
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
            reason: null
          }],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          existing: '60b5d10d-1372-4fb2-b222-bfac81da69ab'
        }

        Sinon.stub(GenerateFromExistingRequirementsService, 'go').resolves([_transformedReturnRequirement()])
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitExistingService.go(session.id, payload)

        expect(result).to.equal({})
      })

      it('saves the selected existing return requirements', async () => {
        await SubmitExistingService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements).to.equal([_transformedReturnRequirement()])
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitExistingService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Use previous requirements for returns',
          existingOptions: [{ value: '60b5d10d-1372-4fb2-b222-bfac81da69ab', text: '1 January 2023' }],
          licenceRef: '01/ABC'
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitExistingService.go(session.id, payload)

          expect(result.error).to.equal({ text: 'Select a return version' })
        })
      })
    })
  })
})

function _transformedReturnRequirement () {
  return {
    points: ['1234'],
    purposes: ['1a1a68cc-b1f5-43db-8d1a-3452425bcc68'],
    returnsCycle: 'winter-and-all-year',
    siteDescription: 'FIRST BOREHOLE AT AVALON',
    abstractionPeriod: {
      'end-abstraction-period-day': 31,
      'end-abstraction-period-month': 3,
      'start-abstraction-period-day': 1,
      'start-abstraction-period-month': 4
    },
    frequencyReported: 'weekly',
    frequencyCollected: 'weekly',
    agreementsExceptions: ['none']
  }
}
