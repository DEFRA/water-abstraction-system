'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPurposesService = require('../../../../app/services/return-versions/setup/fetch-purposes.service.js')

// Thing under test
const PurposeService = require('../../../../app/services/return-versions/setup/purpose.service.js')

describe('Return Versions - Setup - Purpose service', () => {
  const requirementIndex = 0

  let session

  beforeEach(async () => {
    Sinon.stub(FetchPurposesService, 'go').resolves([
      { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' },
      { id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }
    ])

    session = await SessionHelper.add({
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
          startDate: '2022-04-01T00:00:00.000Z',
          waterUndertaker: false
        },
        multipleUpload: false,
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        returnVersionStartDate: '2023-01-01T00:00:00.000Z',
        licenceVersion: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          endDate: null,
          startDate: '2022-04-01T00:00:00.000Z',
          copyableReturnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01T00:00:00.000Z',
              reason: null,
              modLogs: []
            }
          ]
        },
        reason: 'major-change'
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await PurposeService.go(session.id, requirementIndex)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await PurposeService.go(session.id, requirementIndex)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the purpose for the requirements for returns',
        backLink: `/system/return-versions/setup/${session.id}/method`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        purposes: [
          { alias: '', checked: false, description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
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
