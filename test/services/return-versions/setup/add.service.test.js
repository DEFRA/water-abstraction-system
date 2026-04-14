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
const AddService = require('../../../../app/services/return-versions/setup/add.service.js')

describe('Return Versions Setup - Add service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
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

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('adds another empty object to the requirement array in the current setup session record', async () => {
      await AddService.go(session.id)

      expect(session.requirements.length).to.equal(2)
      expect(session.requirements).to.equal([{}, {}])
      expect(session.$update.called).to.be.true()
    })

    it('returns the index of the new requirement', async () => {
      const result = await AddService.go(session.id)

      expect(result).to.equal(1)
    })
  })
})
