'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const CheckYourAnswersService = require('../../../app/services/return-requirements/check-your-answers.service.js')
const SessionModel = require('../../../app/models/session.model.js')

const sessionData = {
  data: {
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
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

describe.only('Check Your Answers service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()
    session = await SessionHelper.add({
      ...sessionData
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await CheckYourAnswersService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await CheckYourAnswersService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        id: session.id,
        pageTitle: 'Check the return requirements for Astro Boy',
        journey: 'no-returns-required',
        licenceRef: '01/ABC',
        note: {
          content: 'Note attached to requirement',
          userEmail: 'carol.shaw@atari.com'
        },
        reason: 'abstraction-below-100-cubic-metres-per-day',
        startDate: '8 February 2023'
      }, { skip: ['id'] })
    })

    it('updates the session record to indicate user has visited check-your-answers', async () => {
      await CheckYourAnswersService.go(session.id)
      const updatedSession = await SessionModel.query().findById(session.id)

      expect(updatedSession.data.checkYourAnswersVisited).to.be.true()
    })
  })
})
