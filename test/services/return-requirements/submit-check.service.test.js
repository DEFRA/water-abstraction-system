'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')
const ExpandedError = require('../../../app/errors/expanded.error.js')

// Things we need to stub
const GenerateReturnVersionService = require('../../../app/services/return-requirements/generate-return-version.service.js')
const PersistReturnVersionService = require('../../../app/services/return-requirements/persist-return-version.service.js')

// Thing under test
const CheckLicenceEndedService = require('../../../app/services/return-requirements/check-licence-ended.service.js')
const SubmitCheckService = require('../../../app/services/return-requirements/submit-check.service.js')

describe('Return Requirements - Submit Check service', () => {
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

  describe('When called with a valid licence', () => {
    beforeEach(() => {
      Sinon.stub(CheckLicenceEndedService, 'go').resolves(false)
    })

    it('returns a valid licence', async () => {
      const result = await SubmitCheckService.go(sessionId)

      expect(result).to.equal(session.data.licence.id)
    })
  })

  describe('When called with an invalid licence (expired, lapsed or revoked)', () => {
    beforeEach(async () => {
      Sinon.stub(CheckLicenceEndedService, 'go').resolves(true)
    })

    it('throws an error', async () => {
      const response = await expect(SubmitCheckService.go(sessionId)).to.reject()

      expect(response).to.be.an.instanceOf(ExpandedError)
      expect(response.message).to.equal('Invalid licence for return requirements')
    })
  })
})
