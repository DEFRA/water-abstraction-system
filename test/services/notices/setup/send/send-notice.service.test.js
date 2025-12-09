'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../fixtures/notifications.fixture.js')

// Things we need to stub
const SendMainNoticeService = require('../../../../../app/services/notices/setup/send/send-main-notice.service.js')

// Thing under test
const SendNoticeService = require('../../../../../app/services/notices/setup/send/send-notice.service.js')

describe('Notices - Setup - Send - Send Notice service', () => {
  let notice
  let notifications
  let notifierStub
  let sendMainNoticeStub

  beforeEach(() => {
    notice = NoticesFixture.returnsInvitation()
    notifications = [NotificationsFixture.returnsInvitationEmail(notice)]

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      sendMainNoticeStub = Sinon.stub(SendMainNoticeService, 'go').resolves()
    })

    it('sends the main notice', async () => {
      await SendNoticeService.go(notice, notifications)

      expect(sendMainNoticeStub.calledOnce).to.be.true()
      expect(sendMainNoticeStub.firstCall.args[0]).to.equal(notice)
      expect(sendMainNoticeStub.firstCall.args[1]).to.equal(notifications)
    })

    it('logs the time taken', async () => {
      await SendNoticeService.go(notice, notifications)

      const args = notifierStub.omg.firstCall.args

      expect(args[0]).to.equal('Send notice complete')
      expect(args[1].timeTakenMs).to.exist()
      expect(args[1].count).to.equal(1)
      expect(args[1].noticeId).to.equal(notice.id)
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      Sinon.stub(SendMainNoticeService, 'go').rejects('Computer says no')
    })

    it('logs the error', async () => {
      await SendNoticeService.go(notice, notifications)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Send notice failed')
      expect(args[1].notice.id).to.equal(notice.id)
      expect(args[2]).to.be.an.error()
      expect(args[2].name).to.equal('Computer says no')
    })
  })
})
