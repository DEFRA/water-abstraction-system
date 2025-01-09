'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReviewService = require('../../../../app/services/notifications/setup/review.service.js')

describe('Notifications Setup - Review service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add()
  })

  describe('when provided no params', () => {
    it('correctly presents the data', async () => {
      const result = await ReviewService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        pageTitle: 'Review the mailing list'
      })
    })
  })
})
