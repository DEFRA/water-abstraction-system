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
const SetupService = require('../../../app/services/return-requirements/setup.service.js')

describe('Setup service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        checkYourAnswersVisited: false,
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
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SetupService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SetupService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'How do you want to set up the requirements for returns?',
        backLink: `/system/return-requirements/${session.id}/reason`,
        licenceRef: '01/ABC',
        setup: null
      }, { skip: ['sessionId'] })
    })
  })
})
