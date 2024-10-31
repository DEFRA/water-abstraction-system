'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const ProcessSessionStorageCleanupService = require('../../../../app/services/jobs/session-cleanup/process-session-storage-cleanup.service.js')

describe('Process Session Storage Cleanup service', () => {
  const todayMinusOneDay = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()

  let notifierStub
  let session

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is session data created more than 1 day ago', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ createdAt: todayMinusOneDay })
    })

    it('removes the session data created more than 1 day ago', async () => {
      await ProcessSessionStorageCleanupService.go()

      const results = await SessionModel.query().whereIn('id', [session.id])

      expect(results).to.have.length(0)
    })

    it('logs the time taken in milliseconds and seconds and number of records deleted', async () => {
      await ProcessSessionStorageCleanupService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Session storage cleanup job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.rowsDeleted).to.equal(1)
    })
  })

  describe('when there is session data created less than 1 day ago (today)', () => {
    beforeEach(async () => {
      session = await SessionHelper.add()
    })

    it('does not remove the session data created less than 1 day ago', async () => {
      await ProcessSessionStorageCleanupService.go()

      const results = await SessionModel.query().whereIn('id', [session.id])

      expect(results).to.have.length(1)
    })

    it('logs the time taken in milliseconds and seconds and number of records deleted', async () => {
      await ProcessSessionStorageCleanupService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Session storage cleanup job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.rowsDeleted).to.equal(0)
    })
  })
})
