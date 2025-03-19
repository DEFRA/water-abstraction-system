'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotifyStatusPresenter = require('../../../../app/presenters/notifications/setup/notify-status.presenter.js')

describe('Notifications Setup - Notify status presenter', () => {
  let notifyStatus
  let scheduledNotification

  describe('when the "messageType" is an "email"', () => {
    beforeEach(() => {
      scheduledNotification = {
        messageType: 'email',
        status: 'sending'
      }
    })

    describe('and the "notifyStatus" is "created"', () => {
      beforeEach(() => {
        notifyStatus = 'created'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'created',
          status: 'sending'
        })
      })
    })

    describe('and the "notifyStatus" is "sending"', () => {
      beforeEach(() => {
        notifyStatus = 'sending'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'sending',
          status: 'sending'
        })
      })
    })

    describe('and the "notifyStatus" is "delivered"', () => {
      beforeEach(() => {
        notifyStatus = 'delivered'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'delivered',
          status: 'sent'
        })
      })
    })

    describe('and notify has errored', () => {
      describe('then the "notifyStatus" is "permanent-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'permanent-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "technical-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'technical-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'technical-failure',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "temporary-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'temporary-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "error"', () => {
        beforeEach(() => {
          notifyStatus = 'error'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'error',
            status: 'error'
          })
        })
      })
    })
  })

  describe('when the "messageType" is a "letter"', () => {
    beforeEach(() => {
      scheduledNotification = {
        messageType: 'letter',
        status: 'sending'
      }
    })

    describe('and the "notifyStatus" is "accepted"', () => {
      beforeEach(() => {
        notifyStatus = 'accepted'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'accepted',
          status: 'sent'
        })
      })
    })

    describe('and the "notifyStatus" is "created"', () => {
      beforeEach(() => {
        notifyStatus = 'created'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'created',
          status: 'sending'
        })
      })
    })

    describe('and the "notifyStatus" is "sending"', () => {
      beforeEach(() => {
        notifyStatus = 'sending'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'sending',
          status: 'sending'
        })
      })
    })

    describe('and the "notifyStatus" is "delivered"', () => {
      beforeEach(() => {
        notifyStatus = 'delivered'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'delivered',
          status: 'sent'
        })
      })
    })

    describe('and the "notifyStatus" is "received"', () => {
      beforeEach(() => {
        notifyStatus = 'received'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

        expect(result).to.equal({
          notifyStatus: 'received',
          status: 'sent'
        })
      })
    })

    describe('and notify has errored', () => {
      describe('then the "notifyStatus" is "permanent-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'permanent-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'permanent-failure',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "technical-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'technical-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'technical-failure',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "temporary-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'temporary-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'temporary-failure',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "validation-failed"', () => {
        beforeEach(() => {
          notifyStatus = 'validation-failed'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'validation-failed',
            status: 'error'
          })
        })
      })

      describe('then the "notifyStatus" is "error"', () => {
        beforeEach(() => {
          notifyStatus = 'error'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, scheduledNotification)

          expect(result).to.equal({
            notifyStatus: 'error',
            status: 'error'
          })
        })
      })
    })
  })
})
