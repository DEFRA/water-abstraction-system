'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const NotifyStatusesService = require('../../../app/services/notify/notify-statuses.service.js')

describe('Notify - Batch status service', () => {
  let notificationId
  let notifyStub
  let referenceCode

  beforeEach(() => {
    // If you wish to test live notify replace this with a real notification id
    notificationId = null
    // If you wish to test live notify replace this with a real unique reference
    referenceCode = 'RINV-97CN09'
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the call to "notify" is successful', () => {
    beforeEach(() => {
      notifyStub = _stubSuccessfulNotify({
        data: {
          notifications: [{ status: 'received', reference: 'RINV-97CN09' }]
        }
      })
    })

    it('should call notify', async () => {
      const result = await NotifyStatusesService.go(notificationId, referenceCode)

      expect(result).to.equal({
        data: [
          {
            reference: 'RINV-97CN09',
            status: 'received'
          }
        ]
      })
    })

    it('should use the notify client', async () => {
      await NotifyStatusesService.go(notificationId, referenceCode)

      expect(notifyStub.calledWith(null, null, referenceCode, notificationId)).to.equal(true)
    })
  })

  describe('and there are no "notifications"', () => {
    beforeEach(() => {
      // This is a bad uuid and should not exist in notify
      notificationId = '616d49cf-4a7e-4188-a7e4-682f1a41dd83'

      notifyStub = _stubSuccessfulNotify({
        data: {
          notifications: []
        }
      })
    })

    it('should return an empty array', async () => {
      const result = await NotifyStatusesService.go(notificationId, referenceCode)

      expect(result).to.equal({
        data: []
      })
    })
  })

  describe('when the call to "notify" is unsuccessful', () => {
    beforeEach(() => {
      // This is a bad uuid and should not exist in notify
      notificationId = '616d49cf-4a7e-4188-a7e4-682f1a41dd83'

      notifyStub = _stubUnSuccessfulNotify()
    })

    it('should return an error', async () => {
      const result = await NotifyStatusesService.go(notificationId, referenceCode)

      expect(result).to.equal({
        status: 404,
        message: 'Request failed with status code 404',
        errors: [{ error: 'NoResultFound', message: 'No result found' }]
      })
    })
  })
})

function _stubSuccessfulNotify(response) {
  return Sinon.stub(NotifyClient.prototype, 'getNotifications').resolves(response)
}

function _stubUnSuccessfulNotify() {
  return Sinon.stub(NotifyClient.prototype, 'getNotifications').rejects({
    status: 404,
    message: 'Request failed with status code 404',
    response: {
      data: {
        errors: [{ error: 'NoResultFound', message: 'No result found' }]
      }
    }
  })
}
