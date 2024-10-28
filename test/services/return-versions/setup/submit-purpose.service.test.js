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
const FetchPurposesService = require('../../../../app/services/return-versions/setup/fetch-purposes.service.js')

// Thing under test
const SubmitPurposeService = require('../../../../app/services/return-versions/setup/submit-purpose.service.js')

describe('Return Versions Setup - Submit Purpose service', () => {
  const requirementIndex = 0

  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
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
            reason: null,
            modLogs: []
          }],
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

    Sinon.stub(FetchPurposesService, 'go').resolves([
      { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' },
      { id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = {
          purposes: ['14794d57-1acf-4c91-8b48-4b1ec68bfd6f'],
          'alias-14794d57-1acf-4c91-8b48-4b1ec68bfd6f': 'great warm machine'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].purposes).to.equal([
          { alias: 'great warm machine', description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' }
        ])
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
      describe('because it is empty', () => {
        beforeEach(async () => {
          payload = {}
        })

        it('returns page data for the view', async () => {
          const result = await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: {
              text: 'Select any purpose for the requirements for returns'
            },
            pageTitle: 'Select the purpose for the requirements for returns',
            backLink: `/system/return-versions/setup/${session.id}/method`,
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            purposes: [
              { alias: '', checked: false, description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
              { alias: '', checked: false, description: 'Horticultural Watering', id: '49088608-ee9f-491a-8070-6831240945ac' }
            ],
            sessionId: session.id
          })
        })
      })

      describe('because they entered an alias that is too long', () => {
        beforeEach(async () => {
          payload = {
            purposes: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
            'alias-14794d57-1acf-4c91-8b48-4b1ec68bfd6f': 'THGBk2GM85EyXB54SsfenU2yWiKjDuPTcJCrPfTsSzojNvj6ciVmI3PXJ2fisQgXWfSI4ZPIqV5GLPtR15qbcw3Hamoeit764Cojz'
          }
        })

        it('returns page data for the view', async () => {
          const result = await SubmitPurposeService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: {
              text: 'Purpose description must be 100 characters or less'
            },
            pageTitle: 'Select the purpose for the requirements for returns',
            backLink: `/system/return-versions/setup/${session.id}/method`,
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            purposes: [
              {
                alias: 'THGBk2GM85EyXB54SsfenU2yWiKjDuPTcJCrPfTsSzojNvj6ciVmI3PXJ2fisQgXWfSI4ZPIqV5GLPtR15qbcw3Hamoeit764Cojz',
                checked: true,
                description: 'Heat Pump',
                id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f'
              },
              {
                alias: '',
                checked: false,
                description: 'Horticultural Watering',
                id: '49088608-ee9f-491a-8070-6831240945ac'
              }
            ],
            sessionId: session.id
          })
        })
      })
    })
  })
})
