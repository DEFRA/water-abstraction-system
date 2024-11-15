'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FetchPointsService = require('../../../../../app/services/return-versions/setup/fetch-points.service.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../../app/services/return-versions/setup/check/check.service.js')

describe('Return Versions Setup - Check service', () => {
  let session
  let yarStub

  beforeEach(async () => {
    Sinon.stub(FetchPointsService, 'go').resolves([])

    session = await SessionHelper.add({
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
        multipleUpload: false,
        returnVersionStartDate: '2023-01-01',
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await CheckService.go(session.id, yarStub)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await CheckService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceRef: '01/ABC',
        multipleUpload: false,
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        notification: undefined,
        pageTitle: 'Check the requirements for returns for Turbo Kid',
        reason: 'Major change',
        reasonLink: `/system/return-versions/setup/${session.id}/reason`,
        requirements: [],
        returnsRequired: true,
        startDate: '1 January 2023'
      }, { skip: ['sessionId'] })
    })

    it('updates the session record to indicate user has visited the "check" page', async () => {
      await CheckService.go(session.id, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.checkPageVisited).to.be.true()
    })
  })
})
