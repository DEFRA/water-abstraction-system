'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ConfirmationPresenter = require('../../../../app/presenters/notifications/setup/confirmation.presenter.js')

describe('Notifications Setup - Confirmation presenter', () => {
  const referenceCode = 'ADHC-1234'

  let event

  beforeEach(() => {
    event = {
      id: '123',
      subtype: 'adHocReminder',
      referenceCode
    }
  })

  it('correctly presents the data', () => {
    const result = ConfirmationPresenter.go(event)

    expect(result).to.equal({
      forwardLink: '/notifications/report/123',
      pageTitle: `Returns ad-hoc sent`,
      referenceCode: 'ADHC-1234'
    })
  })

  describe('when the journey is "ad-hoc"', () => {
    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/notifications/report/123',
        pageTitle: `Returns ad-hoc sent`,
        referenceCode: 'ADHC-1234'
      })
    })
  })

  describe('and the journey is "invitations"', () => {
    beforeEach(() => {
      event.subtype = 'returnInvitation'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/notifications/report/123',
        pageTitle: `Returns invitations sent`,
        referenceCode: 'ADHC-1234'
      })
    })
  })

  describe('and the journey is "reminders"', () => {
    beforeEach(() => {
      event.subtype = 'returnReminder'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/notifications/report/123',
        pageTitle: `Returns reminders sent`,
        referenceCode: 'ADHC-1234'
      })
    })
  })
})
