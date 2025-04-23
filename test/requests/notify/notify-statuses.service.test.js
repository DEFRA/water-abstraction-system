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
const NotifyStatusesRequest = require('../../../app/requests/notify/notify-statuses.request.js')

describe('Notify - Statuses request', () => {
  let notificationId
  let notifyStub
  let referenceCode

  beforeEach(() => {
    notificationId = null
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
      const result = await NotifyStatusesRequest.send(notificationId, referenceCode)

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
      await NotifyStatusesRequest.send(notificationId, referenceCode)

      expect(notifyStub.calledWith(null, null, referenceCode, notificationId)).to.equal(true)
    })
  })

  describe('and there are no "notifications"', () => {
    beforeEach(() => {
      notificationId = '616d49cf-4a7e-4188-a7e4-682f1a41dd83'

      notifyStub = _stubSuccessfulNotify({
        data: {
          notifications: []
        }
      })
    })

    it('should return an empty array', async () => {
      const result = await NotifyStatusesRequest.send(notificationId, referenceCode)

      expect(result).to.equal({
        data: []
      })
    })
  })

  describe('when the call to "notify" is unsuccessful', () => {
    beforeEach(() => {
      notifyStub = _stubUnSuccessfulNotify()
    })

    it('should return an error', async () => {
      const result = await NotifyStatusesRequest.send(notificationId, referenceCode)

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
