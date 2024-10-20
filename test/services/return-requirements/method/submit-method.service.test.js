'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const GenerateFromAbstractionDataService = require('../../../../app/services/return-requirements/method/generate-from-abstraction-data.service.js')

// Thing under test
const SubmitMethodService = require('../../../../app/services/return-requirements/method/submit-method.service.js')

describe('Return Requirements - Submit Method service', () => {
  let payload
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
            reason: null
          }],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          setup: 'use-abstraction-data'
        }

        Sinon.stub(GenerateFromAbstractionDataService, 'go').resolves(_generatedReturnRequirements())
      })

      it('saves the submitted value', async () => {
        await SubmitMethodService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.setup).to.equal('use-abstraction-data')
      })

      describe('and the user has selected to use abstraction data', () => {
        it('returns the route to check page', async () => {
          const result = await SubmitMethodService.go(session.id, payload)

          expect(result.redirect).to.equal('check')
        })

        it('returns the route to check page', async () => {
          await SubmitMethodService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.requirements).to.equal(_generatedReturnRequirements())
        })
      })

      describe('and the user has selected to copy an existing requirement', () => {
        beforeEach(() => {
          payload = {
            setup: 'use-existing-requirements'
          }
        })

        it('returns the route for the select an existing requirement page', async () => {
          const result = await SubmitMethodService.go(session.id, payload)

          expect(result.redirect).to.equal('existing')
        })
      })

      describe('and the user has selected to setup the requirement manually', () => {
        beforeEach(() => {
          payload = {
            setup: 'set-up-manually'
          }
        })

        it('returns the route for the select purpose page', async () => {
          const result = await SubmitMethodService.go(session.id, payload)

          expect(result.redirect).to.equal('purpose/0')
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitMethodService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'How do you want to set up the requirements for returns?',
          backLink: `/system/return-requirements/${session.id}/reason`,
          displayCopyExisting: true,
          licenceRef: '01/ABC',
          setup: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitMethodService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select how you want to set up the requirements for returns'
          })
        })
      })
    })
  })
})

function _generatedReturnRequirements () {
  return [
    {
      points: ['12345'],
      purposes: ['cea0e449-48de-4ff9-8dd7-c2f6d74ab1ea'],
      returnsCycle: 'summer',
      siteDescription: 'BOREHOLE IN FIELD',
      abstractionPeriod: {
        'end-abstraction-period-day': 31,
        'end-abstraction-period-month': 12,
        'start-abstraction-period-day': 1,
        'start-abstraction-period-month': 4
      },
      frequencyReported: 'month',
      frequencyCollected: 'week',
      agreementsExceptions: ['none']
    }
  ]
}
