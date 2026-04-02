'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../support/helpers/session.helper.js')
const SessionNotFoundError = require('../../app/errors/session-not-found.error.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

// Thing under test
const FetchSessionDal = require('../../app/dal/fetch-session.dal.js')

describe('DAL - Fetch session dal', () => {
  let session
  let sessionId

  before(async () => {
    session = await SessionHelper.add()
    sessionId = session.id
  })

  after(async () => {
    await session.$query().delete()
  })

  describe('when the session exists', () => {
    it('returns the session', async () => {
      const result = await FetchSessionDal.go(sessionId)

      expect(result).to.equal(session)
    })
  })

  describe('when the session does not exists', () => {
    it('throws a "SessionNotFoundError"', async () => {
      const promise = FetchSessionDal.go(generateUUID())

      await expect(promise).to.reject(SessionNotFoundError)
    })
  })
})
