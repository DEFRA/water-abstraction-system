'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Things we need to stub
const GenerateReturnVersionService = require('../../../../../app/services/return-requirements/setup/check/generate-return-version.service.js')
const PersistReturnVersionService = require('../../../../../app/services/return-requirements/setup/check/persist-return-version.service.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/return-requirements/setup/check/submit-check.service.js')

describe('Return Requirements Setup - Submit Check service', () => {
  let session
  let sessionId

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
          returnVersions: [],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
    sessionId = session.id

    Sinon.stub(GenerateReturnVersionService, 'go').resolves('returnVersionData')
    Sinon.stub(PersistReturnVersionService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When called with a licence that has not ended', () => {
    it('returns a valid licence', async () => {
      const result = await SubmitCheckService.go(sessionId)

      expect(result).to.equal(session.data.licence.id)
    })
  })

  describe('When called with an licence that has ended (expired, lapsed or revoked)', () => {
    it('returns a valid licence', async () => {
      const result = await SubmitCheckService.go(sessionId)

      expect(result).to.equal(session.data.licence.id)
    })
  })
})
