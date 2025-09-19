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
const { today } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CleanExpiredSessionsService = require('../../../../app/services/jobs/clean/clean-expired-sessions.service.js')

describe('Jobs - Clean - Clean Expired Sessions service', () => {
  const todaysDate = today()
  const todayMinusOneDay = new Date(todaysDate.setDate(todaysDate.getDate() - 1)).toISOString()

  let notifierStub
  let session

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the clean is successful', () => {
    describe('when there is a session created more than 1 day ago', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ createdAt: todayMinusOneDay })
      })

      it('removes the session and returns the count', async () => {
        const result = await CleanExpiredSessionsService.go()

        const existsResults = await SessionModel.query().whereIn('id', [session.id])

        expect(existsResults).to.have.length(0)

        // We can't check the exact count in case the test deletes void return logs created by other tests
        expect(result).to.be.greaterThan(0)
      })
    })

    describe('when there is a session created less than 1 day ago (today)', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()
      })

      it('does not remove the session and returns the count', async () => {
        const result = await CleanExpiredSessionsService.go()

        const existsResults = await SessionModel.query().whereIn('id', [session.id])

        expect(existsResults).to.have.length(1)

        // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
        // by other tests. We just want to check we are always getting a number
        expect(typeof result).to.equal('number')
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

    it('does not throw an error', async () => {
      await expect(CleanExpiredSessionsService.go()).not.to.reject()
    })

    it('logs the error', async () => {
      await CleanExpiredSessionsService.go()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({ job: 'clean-expired-sessions' })
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanExpiredSessionsService.go()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created by
      // other tests. We just want to check we are always getting a number
      expect(typeof result).to.equal('number')
    })
  })
})
