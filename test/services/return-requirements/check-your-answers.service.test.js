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

// Thing under test
const CheckYourAnswersService = require('../../../app/services/return-requirements/check-your-answers.service.js')
const SessionModel = require('../../../app/models/session.model.js')

describe('Check Your Answers service', () => {
  let session
  let yarStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        requirements: [{}],
        checkYourAnswersVisited: false,
        journey: 'no-returns-required',
        startDateOptions: 'licenceStartDate',
        reason: 'returns-exception'
      }
    })

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await CheckYourAnswersService.go(session.id, yarStub)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await CheckYourAnswersService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        notification: undefined,
        journey: 'no-returns-required',
        licenceRef: '01/ABC',
        note: null,
        pageTitle: 'Check the return requirements for Turbo Kid',
        reason: 'Returns exception',
        reasonLink: `/system/return-requirements/${session.id}/no-returns-required`,
        startDate: '1 January 2023',
        userEmail: 'No notes added'
      }, { skip: ['sessionId'] })
    })

    it('updates the session record to indicate user has visited check-your-answers', async () => {
      await CheckYourAnswersService.go(session.id, yarStub)
      const updatedSession = await SessionModel.query().findById(session.id)

      expect(updatedSession.checkYourAnswersVisited).to.be.true()
    })
  })
})
