'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const ConfirmationPresenter = require('../../../../app/presenters/notices/setup/confirmation.presenter.js')

describe('Notices - Setup - Confirmation presenter', () => {
  const referenceCode = generateReferenceCode()

  let event

  beforeEach(() => {
    event = {
      id: 'ca6a7546-2365-45a1-9f07-ab9338577e2a',
      subtype: 'returnInvitation',
      referenceCode,
      metadata: {}
    }
  })

  it('correctly presents the data', () => {
    const result = ConfirmationPresenter.go(event)

    expect(result).to.equal({
      forwardLink: '/system/notices/ca6a7546-2365-45a1-9f07-ab9338577e2a',
      monitoringStationLink: null,
      pageTitle: `Returns invitations sent`,
      referenceCode
    })
  })

  describe('and the journey is "invitations"', () => {
    beforeEach(() => {
      event.subtype = 'returnInvitation'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/system/notices/ca6a7546-2365-45a1-9f07-ab9338577e2a',
        monitoringStationLink: null,
        pageTitle: `Returns invitations sent`,
        referenceCode
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
        forwardLink: '/system/notices/ca6a7546-2365-45a1-9f07-ab9338577e2a',
        monitoringStationLink: null,
        pageTitle: `Returns reminders sent`,
        referenceCode
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
        forwardLink: '/system/notices/ca6a7546-2365-45a1-9f07-ab9338577e2a',
        monitoringStationLink: '/system/monitoring-stations/123',
        pageTitle: 'Water abstraction alerts sent',
        referenceCode
      })
    })
  })

  describe('and the notice type is "paperReturn"', () => {
    beforeEach(() => {
      event.subtype = 'paperReturnForms'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).to.equal({
        forwardLink: '/system/notices/ca6a7546-2365-45a1-9f07-ab9338577e2a',
        monitoringStationLink: null,
        pageTitle: 'Paper return forms sent',
        referenceCode
      })
    })
  })
})
