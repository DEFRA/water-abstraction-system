'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const SessionModel = require('../../../app/models/session.model.js')

// Thing under test
const InitiateReturnRequirementSessionService = require('../../../app/services/return-requirements/initiate-return-requirement-session.service.js')

describe('Initiate Return Requirement Session service', () => {
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    licence = await LicenceHelper.add()
  })

  describe('when called', () => {
    describe('and the licence exists', () => {
      it('creates a new session record containing details of the licence', async () => {
        const result = await InitiateReturnRequirementSessionService.go(licence.id)

        const session = await SessionModel.query().findById(result)
        const { data } = session

        expect(data.licence.id).to.equal(licence.id)
        expect(data.licence.licenceRef).to.equal(licence.licenceRef)
      })
    })

    describe('but the licence does not exist', () => {
      it('throws a Boom not found error', async () => {
        const error = await expect(InitiateReturnRequirementSessionService.go('e456e538-4d55-4552-84f7-6a7636eb1945')).to.reject()

        expect(error.isBoom).to.be.true()
        expect(error.data).to.equal({ id: 'e456e538-4d55-4552-84f7-6a7636eb1945' })

        const { statusCode, error: errorType, message } = error.output.payload

        expect(statusCode).to.equal(404)
        expect(errorType).to.equal('Not Found')
        expect(message).to.equal('Licence for new return requirement not found')
      })
    })
  })
})
