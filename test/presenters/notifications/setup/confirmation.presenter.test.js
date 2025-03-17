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

  let session

  beforeEach(() => {
    session = {
      journey: 'ad-hoc',
      referenceCode
    }
  })

  it('correctly presents the data', () => {
    const result = ConfirmationPresenter.go(session)

    expect(result).to.equal({
      backLink: `/manage`,
      forwardLink: '/notifications/report',
      pageTitle: `Returns ad-hoc sent`,
      referenceCode: 'ADHC-1234'
    })
  })

  describe('when the journey is "ad-hoc"', () => {
    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(session)

      expect(result).to.equal({
        backLink: `/manage`,
        forwardLink: '/notifications/report',
        pageTitle: `Returns ad-hoc sent`,
        referenceCode: 'ADHC-1234'
      })
    })
  })

  describe('and the journey is "invitations"', () => {
    beforeEach(() => {
      session.journey = 'invitations'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(session)

      expect(result).to.equal({
        backLink: `/manage`,
        forwardLink: '/notifications/report',
        pageTitle: `Returns invitations sent`,
        referenceCode: 'ADHC-1234'
      })
    })
  })

  describe('and the journey is "reminders"', () => {
    beforeEach(() => {
      session.journey = 'reminders'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(session)

      expect(result).to.equal({
        backLink: `/manage`,
        forwardLink: '/notifications/report',
        pageTitle: `Returns reminders sent`,
        referenceCode: 'ADHC-1234'
      })
    })
  })
})
