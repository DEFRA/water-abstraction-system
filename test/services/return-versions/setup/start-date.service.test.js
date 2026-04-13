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
const StartDateService = require('../../../../app/services/return-versions/setup/start-date.service.js')

describe('Return Versions Setup - Start Date service', () => {
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
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}]
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await StartDateService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await StartDateService.go(session.id)

      expect(result).to.equal(
        {
          pageTitle: 'Select the start date for the requirements for returns',
          pageTitleCaption: 'Licence 01/ABC',
          startDateDay: null,
          startDateMonth: null,
          startDateYear: null,
          backLink: {
            href: '/system/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d/set-up',
            text: 'Back'
          },
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licenceVersionStartDate: '1 January 2023',
          startDateOption: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
