'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotifyStatusPresenter = require('../../../../app/presenters/jobs/notifications/notify-status.presenter.js')

describe('Jobs - Notifications - Notify Status presenter', () => {
  let notifyStatus
  let notification

  describe('when the "messageType" is an "email"', () => {
    beforeEach(() => {
      notification = {
        messageType: 'email',
        status: 'pending'
      }
    })

    describe('and the "notifyStatus" is "created"', () => {
      beforeEach(() => {
        notifyStatus = 'created'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'created',
          status: 'pending'
        })
      })
    })

    describe('and the "notifyStatus" is "sending"', () => {
      beforeEach(() => {
        notifyStatus = 'sending'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'sending',
          status: 'pending'
        })
      })
    })

    describe('and the "notifyStatus" is "delivered"', () => {
      beforeEach(() => {
        notifyStatus = 'delivered'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
      notification = {
        messageType: 'letter',
        status: 'pending'
      }
    })

    describe('and the "notifyStatus" is "accepted"', () => {
      beforeEach(() => {
        notifyStatus = 'accepted'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'accepted',
          status: 'pending'
        })
      })
    })

    describe('and the "notifyStatus" is "created"', () => {
      beforeEach(() => {
        notifyStatus = 'created'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'created',
          status: 'pending'
        })
      })
    })

    describe('and the "notifyStatus" is "sending"', () => {
      beforeEach(() => {
        notifyStatus = 'sending'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'sending',
          status: 'pending'
        })
      })
    })

    describe('and the "notifyStatus" is "received"', () => {
      beforeEach(() => {
        notifyStatus = 'received'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'received',
          status: 'sent'
        })
      })
    })

    describe('then the "notifyStatus" is "pending-virus-check"', () => {
      beforeEach(() => {
        notifyStatus = 'pending-virus-check'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'pending-virus-check',
          status: 'pending'
        })
      })
    })

    describe('and notify has errored', () => {
      describe('then the "notifyStatus" is "permanent-failure"', () => {
        beforeEach(() => {
          notifyStatus = 'permanent-failure'
        })

        it('correctly returns status to update', () => {
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

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
          const result = NotifyStatusPresenter.go(notifyStatus, notification)

          expect(result).to.equal({
            notifyStatus: 'error',
            status: 'error'
          })
        })
      })
    })

    describe('and the the status is not recognises', () => {
      beforeEach(() => {
        notifyStatus = 'fake'
      })

      it('correctly returns status to update', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'fake',
          status: 'pending'
        })
      })
    })
  })
})
