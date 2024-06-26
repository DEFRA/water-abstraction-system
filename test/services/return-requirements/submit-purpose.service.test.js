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
const FetchLicencePurposesService = require('../../../app/services/return-requirements/fetch-licence-purposes.service.js')

// Thing under test
const SubmitPurposeService = require('../../../app/services/return-requirements/submit-purpose.service.js')

describe('Return Requirements - Submit Purpose service', () => {
  const requirementIndex = 0

  let payload
  let session
  let sessionData
  let yarStub

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
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = {
          purposes: ['14794d57-1acf-4c91-8b48-4b1ec68bfd6f']
        }

        Sinon.stub(FetchLicencePurposesService, 'go').resolves([
          { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' },
          { id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' },
          { id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d', description: 'Large Garden Watering' }
        ])
      })

      it('saves the submitted value', async () => {
        await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].purposes).to.equal(['14794d57-1acf-4c91-8b48-4b1ec68bfd6f'])
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}

        Sinon.stub(FetchLicencePurposesService, 'go').resolves([
          { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' },
          { id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' },
          { id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d', description: 'Large Garden Watering' }
        ])
      })

      it('returns page data for the view', async () => {
        const result = await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the purpose for the requirements for returns',
          backLink: `/system/return-requirements/${session.id}/setup`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          error: {
            text: 'Select any purpose for the requirements for returns'
          },
          licencePurposes: [{
            description: 'Heat Pump',
            id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f'
          },
          {
            description: 'Horticultural Watering',
            id: '49088608-ee9f-491a-8070-6831240945ac'
          },
          {
            description: 'Large Garden Watering',
            id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d'
          }],
          licenceRef: '01/ABC',
          purposes: '',
          sessionId: session.id
        }, { skip: ['sessionId', 'error'] })
      })
    })
  })
})
