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

    describe('and Notify status is "created"', () => {
      beforeEach(() => {
        notifyStatus = 'created'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'created',
          status: 'pending'
        })
      })
    })

    describe('and Notify status is "sending"', () => {
      beforeEach(() => {
        notifyStatus = 'sending'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'sending',
          status: 'pending'
        })
      })
    })

    describe('and Notify status is "delivered"', () => {
      beforeEach(() => {
        notifyStatus = 'delivered'
      })

      it('correctly returns the statuses to update (sent)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'delivered',
          status: 'sent'
        })
      })
    })

    describe('and Notify status is "permanent-failure"', () => {
      beforeEach(() => {
        notifyStatus = 'permanent-failure'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'permanent-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify status is "technical-failure"', () => {
      beforeEach(() => {
        notifyStatus = 'technical-failure'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'technical-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify status is "temporary-failure"', () => {
      beforeEach(() => {
        notifyStatus = 'temporary-failure'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'temporary-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify status is error', () => {
      beforeEach(() => {
        notifyStatus = 'error'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'error',
          status: 'error'
        })
      })
    })

    describe('and the Notify status is not recognised', () => {
      beforeEach(() => {
        notifyStatus = 'fake'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'fake',
          status: 'pending'
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

    describe('and Notify status is "accepted"', () => {
      beforeEach(() => {
        notifyStatus = 'accepted'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'accepted',
          status: 'pending'
        })
      })
    })

    describe('and Notify status is "created"', () => {
      beforeEach(() => {
        notifyStatus = 'created'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'created',
          status: 'pending'
        })
      })
    })

    describe('and Notify status is "sending"', () => {
      beforeEach(() => {
        notifyStatus = 'sending'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'sending',
          status: 'pending'
        })
      })
    })

    describe('and Notify status is "pending-virus-check"', () => {
      beforeEach(() => {
        notifyStatus = 'pending-virus-check'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'pending-virus-check',
          status: 'pending'
        })
      })
    })

    describe('and Notify status is "received"', () => {
      beforeEach(() => {
        notifyStatus = 'received'
      })

      it('correctly returns the statuses to update (sent)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'received',
          status: 'sent'
        })
      })
    })

    describe('and Notify status is "permanent-failure"', () => {
      beforeEach(() => {
        notifyStatus = 'permanent-failure'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'permanent-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify status is "technical-failure"', () => {
      beforeEach(() => {
        notifyStatus = 'technical-failure'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'technical-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify status is "temporary-failure"', () => {
      beforeEach(() => {
        notifyStatus = 'temporary-failure'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'temporary-failure',
          status: 'error'
        })
      })
    })

    describe('and Notify status is "validation-failed"', () => {
      beforeEach(() => {
        notifyStatus = 'validation-failed'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'validation-failed',
          status: 'error'
        })
      })
    })

    describe('and Notify status is "error"', () => {
      beforeEach(() => {
        notifyStatus = 'error'
      })

      it('correctly returns the statuses to update (error)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'error',
          status: 'error'
        })
      })
    })

    describe('and the Notify status is not recognised', () => {
      beforeEach(() => {
        notifyStatus = 'fake'
      })

      it('correctly returns the statuses to update (pending)', () => {
        const result = NotifyStatusPresenter.go(notifyStatus, notification)

        expect(result).to.equal({
          notifyStatus: 'fake',
          status: 'pending'
        })
      })
    })
  })
})
