'use strict'

// Test helpers
const { generateNoticeReferenceCode, generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ConfirmationPresenter = require('../../../../app/presenters/notices/setup/confirmation.presenter.js')

describe('Notices - Setup - Confirmation presenter', () => {
  const referenceCode = generateNoticeReferenceCode('RINV-')

  let event

  beforeEach(() => {
    event = {
      id: generateUUID(),
      subtype: 'returnInvitation',
      referenceCode,
      metadata: {}
    }
  })

  it('correctly presents the data', () => {
    const result = ConfirmationPresenter.go(event)

    expect(result).toEqual({
      forwardLink: `/system/notices/${event.id}`,
      monitoringStationLink: null,
      pageTitle: `Returns invitations sent`,
      referenceCode
    })
  })

  describe('and the notice type is "returnInvitation"', () => {
    beforeEach(() => {
      event.subtype = 'returnInvitation'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).toEqual({
        forwardLink: `/system/notices/${event.id}`,
        monitoringStationLink: null,
        pageTitle: `Returns invitations sent`,
        referenceCode
      })
    })
  })

  describe('and the notice type is "returnReminder"', () => {
    beforeEach(() => {
      event.subtype = 'returnReminder'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).toEqual({
        forwardLink: `/system/notices/${event.id}`,
        monitoringStationLink: null,
        pageTitle: `Returns reminders sent`,
        referenceCode
      })
    })
  })

  describe('and the notice type is "waterAbstractionAlerts"', () => {
    beforeEach(() => {
      event.subtype = 'waterAbstractionAlerts'

      event.metadata = { options: { monitoringStationId: '123' } }
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).toEqual({
        forwardLink: `/system/notices/${event.id}`,
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

      expect(result).toEqual({
        forwardLink: `/system/notices/${event.id}`,
        monitoringStationLink: null,
        pageTitle: 'Paper returns sent',
        referenceCode
      })
    })
  })

  describe('and the notice type is "renewalInvitation"', () => {
    beforeEach(() => {
      event.subtype = 'renewalInvitation'
    })

    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(event)

      expect(result).toEqual({
        forwardLink: `/system/notices/${event.id}`,
        monitoringStationLink: null,
        pageTitle: 'Renewal invitations sent',
        referenceCode
      })
    })
  })
})
