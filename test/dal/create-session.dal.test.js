'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModel = require('../../app/models/session.model.js')

// Thing under test
const CreateSessionDal = require('../../app/dal/create-session.dal.js')

describe('DAL - Create Session DAL', () => {
  describe('when there is no data', () => {
    it('creates an empty session and returns the session ID', async () => {
      const result = await CreateSessionDal.go()

      const session = await SessionModel.query().findById(result.id)

      expect(session).to.equal(
        {
          data: {},
          id: result.id
        },
        { skip: ['createdAt', 'updatedAt'] }
      )
    })
  })

  describe('when there is data', () => {
    let data

    before(() => {
      data = { testData: 'Here is some test data' }
    })

    it('creates a session with the data and returns the session ID', async () => {
      const result = await CreateSessionDal.go(data)

      const session = await SessionModel.query().findById(result.id)

      expect(session).to.equal(
        {
          data: { testData: 'Here is some test data' },
          id: result.id,
          testData: 'Here is some test data'
        },
        { skip: ['createdAt', 'updatedAt'] }
      )
    })
  })
})
