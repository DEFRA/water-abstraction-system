'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const NoReturnsRequiredService = require('../../../app/services/return-requirements/no-returns-required.service.js')

describe('No Returns Required service', () => {
  let session

  beforeEach(async () => {
    await DatabaseHelper.clean()
    session = await SessionHelper.add({ data: { licence: { licenceRef: '01/123' } } })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data including the error for the view', async () => {
      const error = new Error('Test error message')
      const result = await NoReturnsRequiredService.go(session.id, error)

      expect(result.errorMessage).to.exist()
      expect(result.errorMessage.text).to.equal(error.message)
    })
  })
})
