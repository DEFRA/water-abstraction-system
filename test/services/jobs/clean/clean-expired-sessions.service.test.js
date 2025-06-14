'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const CleanExpiredSessionsService = require('../../../../app/services/jobs/clean/clean-expired-sessions.service.js')

describe('Jobs - Clean - Clean Expired Sessions service', () => {
  const todayMinusOneDay = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()

  let session

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the clean is successful', () => {
    describe('when there is a session created more than 1 day ago', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ createdAt: todayMinusOneDay })
      })

      it('removes the session', async () => {
        await CleanExpiredSessionsService.go()

        const results = await SessionModel.query().whereIn('id', [session.id])

        expect(results).to.have.length(0)
      })
    })

    describe('when there is a session created less than 1 day ago (today)', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()
      })

      it('does not remove the session', async () => {
        await CleanExpiredSessionsService.go()

        const results = await SessionModel.query().whereIn('id', [session.id])

        expect(results).to.have.length(1)
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      Sinon.stub(SessionModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        where: Sinon.stub().rejects()
      })
    })

    it('throws an error', async () => {
      await expect(CleanExpiredSessionsService.go()).to.reject()
    })
  })
})
