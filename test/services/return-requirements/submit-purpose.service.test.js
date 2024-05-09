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
const FetchPurposesService = require('../../../app/services/return-requirements/fetch-purposes.service.js')

// Thing under test
const SubmitPurposeService = require('../../../app/services/return-requirements/submit-purpose.service.js')

describe('Submit Purpose service', () => {
  const requirementIndex = 0

  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
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
          purposes: ['Heat Pump']
        }

        Sinon.stub(FetchPurposesService, 'go').resolves([
          { description: 'Heat Pump' },
          { description: 'Horticultural Watering' }
        ])
      })

      it('saves the submitted value', async () => {
        await SubmitPurposeService.go(session.id, requirementIndex, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].purposes).to.equal(['Heat Pump'])
      })

      it('returns the checkYourAnswersVisited property (no page data needed for a redirect)', async () => {
        const result = await SubmitPurposeService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          checkYourAnswersVisited: false
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}

        Sinon.stub(FetchPurposesService, 'go').resolves([
          { description: 'Heat Pump' },
          { description: 'Horticultural Watering' }
        ])
      })

      it('returns page data for the view', async () => {
        const result = await SubmitPurposeService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the purpose for the requirements for returns',
          backLink: `/system/return-requirements/${session.id}/setup`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licencePurposes: ['Heat Pump', 'Horticultural Watering'],
          licenceRef: '01/ABC',
          purposes: ''
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitPurposeService.go(session.id, requirementIndex, payload)

          expect(result.error).to.equal({
            text: 'Select any purpose for the requirements for returns'
          })
        })
      })
    })
  })
})
