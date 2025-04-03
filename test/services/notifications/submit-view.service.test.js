'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SubmitViewService = require('../../../app/services/notifications/submit-view.service.js')

describe('Notifications - Submit view', () => {
  let payload
  let yarStub

  beforeEach(async () => {
    yarStub = { clear: Sinon.stub().returns(), set: Sinon.stub().returns() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a clear in the payload', () => {
    it('clears them from yar', async () => {
      payload = {
        clearFilters: 'reset'
      }
      await SubmitViewService.go(payload, yarStub)

      expect(yarStub.clear.called).to.be.true()
      expect(yarStub.set.called).to.be.false()
    })
  })

  describe('when called with a valid payload', () => {
    it('saves the submitted payload into yar', async () => {
      payload = {
        filterNotificationTypes: [
          'legacy-notifications',
          'returns-paper-form',
          'returns-reminders',
          'returns-invitation',
          'water-abstraction-alert-resume',
          'water-abstraction-alert-stop',
          'water-abstraction-alert-reduce',
          'water-abstraction-alert-warning'
        ],
        sentBy: 'test@test.com',
        'sent-from-day': '1',
        'sent-from-month': '1',
        'sent-from-year': '2025',
        'sent-to-day': '31',
        'sent-to-month': '12',
        'sent-to-year': '2025'
      }
      await SubmitViewService.go(payload, yarStub)

      expect(yarStub.clear.called).to.be.false()
      expect(yarStub.set.called).to.be.true()
      expect(yarStub.set.args[0][1]).to.equal({
        filterNotificationTypes: [
          'legacy-notifications',
          'returns-paper-form',
          'returns-reminders',
          'returns-invitation',
          'water-abstraction-alert-resume',
          'water-abstraction-alert-stop',
          'water-abstraction-alert-reduce',
          'water-abstraction-alert-warning'
        ],
        sentBy: 'test@test.com',
        sentFromDay: '1',
        sentFromMonth: '1',
        sentFromYear: '2025',
        sentToDay: '31',
        sentToMonth: '12',
        sentToYear: '2025'
      })
    })
  })

  describe('when called with an empty valid payload', () => {
    it('saves the submitted payload into yar', async () => {
      payload = {}

      await SubmitViewService.go(payload, yarStub)

      expect(yarStub.clear.called).to.be.false()
      expect(yarStub.set.called).to.be.true()
      expect(yarStub.set.args[0][1]).to.equal({
        filterNotificationTypes: undefined,
        sentBy: undefined,
        sentFromDay: null,
        sentFromMonth: null,
        sentFromYear: null,
        sentToDay: null,
        sentToMonth: null,
        sentToYear: null
      })
    })
  })
})
