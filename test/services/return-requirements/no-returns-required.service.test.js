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
const NoReturnsRequiredService = require('../../../app/services/return-requirements/no-returns-required.service.js')

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

describe('No Returns Required service', () => {
  let session

  describe('when called', () => {
    beforeEach(async () => {
      await DatabaseSupport.clean()
      session = await SessionHelper.add({ ...sessionData })
    })

    it('fetches the current setup session record', async () => {
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        checkYourAnswersVisited: false,
        pageTitle: 'Why are no returns required?',
        licenceRef: '01/ABC'
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
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result.checkYourAnswersVisited).to.be.true()
    })
  })
})
