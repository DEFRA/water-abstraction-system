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
const StartDateService = require('../../../app/services/return-requirements/start-date.service.js')

const sessionData = {
  data: {
    checkYourAnswersVisited: false,
    licence: {
      id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
      currentVersionStartDate: '2023-01-01T00:00:00.000Z',
      endDate: null,
      licenceRef: '01/ABC',
      licenceHolder: 'Turbo Kid',
      startDate: '2022-04-01T00:00:00.000Z'
    }
  }
}

describe('Start Date service', () => {
  let session

  describe('when called', () => {
    beforeEach(async () => {
      await DatabaseSupport.clean()
      session = await SessionHelper.add({ ...sessionData })
    })

    it('fetches the current setup session record', async () => {
      const result = await StartDateService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await StartDateService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        checkYourAnswersVisited: false,
        pageTitle: 'Select the start date for the return requirement',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        licenceVersionStartDate: '1 January 2023',
        anotherStartDateDay: null,
        anotherStartDateMonth: null,
        anotherStartDateYear: null,
        anotherStartDateSelected: false,
        licenceStartDateSelected: false
      }, { skip: ['id'] })
    })
  })

  describe('when the user has visited check-your-answers', () => {
    beforeEach(async () => {
      await DatabaseSupport.clean()
      sessionData.data.checkYourAnswersVisited = true
      session = await SessionHelper.add({ ...sessionData })
    })

    it('redirects back to check-your-answers', async () => {
      const result = await StartDateService.go(session.id)

      expect(result.checkYourAnswersVisited).to.be.true()
    })
  })
})
