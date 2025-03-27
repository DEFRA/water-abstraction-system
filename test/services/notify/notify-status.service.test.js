'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { NotifyClient } = require('notifications-node-client')
const { stubNotify } = require('../../../config/notify.config.js')

// Thing under test
const NotifyStatusService = require('../../../app/services/notify/notify-status.service.js')

describe('Notify - Status service', () => {
  let notificationId
  let notifierStub
  let notifyStub

  beforeEach(() => {
    // If you wish to test live notify replace this with a real notification id
    notificationId = '5a714bec-4ca0-45ba-8edf-8fa37db09499'
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the call to "notify" is successful', () => {
    beforeEach(() => {
      notifyStub = _stubSuccessfulNotify()
    })

    it('should call notify', async () => {
      const result = await NotifyStatusService.go(notificationId)

      expect(result).to.equal({
        status: 'received'
      })
    })

    if (stubNotify) {
      it('should use the notify client', async () => {
        await NotifyStatusService.go(notificationId)

        expect(notifyStub.calledWith(notificationId)).to.equal(true)
      })
    }
  })

  describe('when the call to "notify" is unsuccessful', () => {
    beforeEach(() => {
      // This is a bad uuid and should not exist in notify
      notificationId = '616d49cf-4a7e-4188-a7e4-682f1a41dd83'

      notifyStub = _stubUnSuccessfulNotify()
    })

    it('should return an error', async () => {
      const result = await NotifyStatusService.go(notificationId)

      expect(result).to.equal({
        status: 404,
        message: 'Request failed with status code 404',
        errors: [{ error: 'NoResultFound', message: 'No result found' }]
      })
    })
  })
})

function _stubSuccessfulNotify() {
  if (stubNotify) {
    return Sinon.stub(NotifyClient.prototype, 'getNotificationById').resolves({
      data: {
        status: 'received'
      }
    })
  }
}

function _stubUnSuccessfulNotify() {
  if (stubNotify) {
    return Sinon.stub(NotifyClient.prototype, 'getNotificationById').rejects({
      status: 404,
      message: 'Request failed with status code 404',
      response: {
        data: {
          errors: [{ error: 'NoResultFound', message: 'No result found' }]
        }
      }
    })
  }
}
