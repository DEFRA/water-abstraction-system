// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import SessionHelper from '../support/helpers/session.helper.js'
import SessionNotFoundError from '../../app/errors/session-not-found.error.js'
import { generateUUID } from '../../app/lib/general.lib.js'

// Thing under test
import FetchSessionDal from '../../app/dal/fetch-session.dal.js'

describe('DAL - Fetch session dal', () => {
  let session
  let sessionId

  beforeAll(async () => {
    session = await SessionHelper.add()
    sessionId = session.id
  })

  afterAll(async () => {
    await session.$query().delete()
  })

  describe('when the session exists', () => {
    it('returns the session', async () => {
      const result = await FetchSessionDal(sessionId)

      expect(result).toEqual(session)
    })
  })

  describe('when the session does not exists', () => {
    it('throws a "SessionNotFoundError"', async () => {
      const promise = FetchSessionDal(generateUUID())

      await expect(promise).rejects.toBeInstanceOf(SessionNotFoundError)
    })
  })
})
