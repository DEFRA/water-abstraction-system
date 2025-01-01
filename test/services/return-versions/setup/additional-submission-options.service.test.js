'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const AdditionalSubmissionOptionsService = require('../../../../app/services/return-versions/setup/additional-submission-options.service.js')

describe('Return Versions Setup - Additional Submission Options service', () => {
  let session

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
          startDate: '2022-04-01T00:00:00.000Z'
        },
        multipleUpload: false,
        noAdditionalOptions: undefined,
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await AdditionalSubmissionOptionsService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await AdditionalSubmissionOptionsService.go(session.id)

      expect(result).to.equal(
        {
          multipleUpload: false,
          noAdditionalOptions: undefined,
          quarterlyReturnSubmissions: false,
          quarterlyReturns: undefined,
          activeNavBar: 'search',
          backLink: `/system/return-versions/setup/${session.id}/check`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          pageTitle: 'Select any additional submission options for the return requirements'
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
