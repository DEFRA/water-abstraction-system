'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ConfirmationPresenter = require('../../../../app/presenters/notices/setup/confirmation.presenter.js')

describe('Notices - Setup - Confirmation presenter', () => {
  const referenceCode = 'RNIV-1234'

  let event

  beforeEach(() => {
    event = {
      id: '123',
      subtype: 'returnInvitation',
      referenceCode,
      metadata: {}
    }
  })

  it('correctly presents the data', () => {
    const result = ConfirmationPresenter.go(event)

    expect(result).to.equal({
      forwardLink: '/notifications/report/123',
      monitoringStationLink: null,
      pageTitle: `Returns invitations sent`,
      referenceCode: 'RNIV-1234'
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
        monitoringStationLink: null,
        pageTitle: `Returns invitations sent`,
        referenceCode: 'RNIV-1234'
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
        monitoringStationLink: null,
        pageTitle: `Returns reminders sent`,
        referenceCode: 'RNIV-1234'
      })
    })
  })

  describe('and the journey is "waterAbstractionAlerts"', () => {
    beforeEach(() => {
      event.subtype = 'waterAbstractionAlerts'

      event.metadata = { options: { monitoringStationId: '123' } }
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/notifications/report/123',
        monitoringStationLink: '/system/monitoring-stations/123',
        pageTitle: 'Water abstraction alerts sent',
        referenceCode: 'RNIV-1234'
      })
    })
  })

  describe('and the journey is "paper-forms"', () => {
    beforeEach(() => {
      event.subtype = 'paperReturnForms'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/notifications/report/123',
        monitoringStationLink: null,
        pageTitle: 'Paper return forms sent',
        referenceCode: 'RNIV-1234'
      })
    })
  })
})
