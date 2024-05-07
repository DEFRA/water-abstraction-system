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

const sessionData = {
  data: {
    checkYourAnswersVisited: false,
    licence: {
      endDate: null,
      licenceRef: '01/ABC',
      licenceHolder: 'Astro Boy',
      currentVersionStartDate: '2023-02-08T00:00:00.000Z'
    },
    reason: 'abstraction-below-100-cubic-metres-per-day',
    journey: 'no-returns-required',
    note: {
      content: 'Note attached to requirement',
      userEmail: 'carol.shaw@atari.com'
    },
    startDateOptions: 'licenceStartDate'
  }
}

describe('Check Your Answers service', () => {
  let session
  let yarStub

  beforeEach(async () => {
    await DatabaseSupport.clean()
    session = await SessionHelper.add({
      ...sessionData
    })
    yarStub = { flash: Sinon.stub().returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await CheckYourAnswersService.go(session.id, yarStub)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await CheckYourAnswersService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        id: session.id,
        pageTitle: 'Check the return requirements for Astro Boy',
        journey: 'no-returns-required',
        licenceRef: '01/ABC',
        note: 'Note attached to requirement',
        notification: undefined,
        userEmail: 'carol.shaw@atari.com',
        reason: 'abstraction-below-100-cubic-metres-per-day',
        startDate: '8 February 2023'
      }, { skip: ['id'] })
    })

    it('updates the session record to indicate user has visited check-your-answers', async () => {
      await CheckYourAnswersService.go(session.id, yarStub)
      const updatedSession = await SessionModel.query().findById(session.id)

      expect(updatedSession.checkYourAnswersVisited).to.be.true()
    })
  })
})
