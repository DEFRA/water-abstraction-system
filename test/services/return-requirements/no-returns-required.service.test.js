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
    it('fetches the current setup session record', async () => {
      const result = await NoReturnsRequiredService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    describe('without the optional error param', () => {
      it('returns page data for the view', async () => {
        const result = await NoReturnsRequiredService.go(session.id)

        expect(result.activeNavBar).to.exist()
        expect(result.licenceRef).to.exist()
        expect(result.radioItems).to.exist()

        expect(result.errorMessage).to.be.null()
      })
    })

    describe('with the optional error param', () => {
      const error = new Error('Test error message')

      it('returns page data for the view including the error message', async () => {
        const result = await NoReturnsRequiredService.go(session.id, error)

        expect(result.activeNavBar).to.exist()
        expect(result.licenceRef).to.exist()
        expect(result.radioItems).to.exist()

        expect(result.errorMessage).to.exist()
        expect(result.errorMessage.text).to.equal(error.message)
      })
    })
  })
})
