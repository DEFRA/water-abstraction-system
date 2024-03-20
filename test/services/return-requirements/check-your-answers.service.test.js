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

describe('Check Your Answers service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()
    session = await SessionHelper.add({
      data: {
        licence: {
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Astro Boy'
        }
      }
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
        pageTitle: 'Check the return requirements for Astro Boy',
        licenceRef: '01/ABC'
      }, { skip: ['id'] })
    })
  })
})
