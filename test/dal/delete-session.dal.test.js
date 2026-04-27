'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../support/helpers/session.helper.js')
const SessionModel = require('../../app/models/session.model.js')

// Thing under test
const DeleteSessionDal = require('../../app/dal/delete-session.dal.js')

describe('DAL - Delete session dal', () => {
  let session
  let sessionId

  before(async () => {
    session = await SessionHelper.add()
    sessionId = session.id
  })

  describe('when the session exists', () => {
    it('deletes the session', async () => {
      await DeleteSessionDal.go(sessionId)

      const session = await SessionModel.query().findById(sessionId)

      expect(session).to.be.undefined()
    })
  })
})
