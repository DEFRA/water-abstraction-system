'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const EventModel = require('../../../app/models/event.model.js')

// Thing under test
const FetchEventsService = require('../../../app/services/notifications/fetch-events-notifications.service.js')

describe('Fetch Events service', () => {
  let testEvent
  let secondTestEvent

  describe('when an event exists and there are no filters applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        filterNotificationTypes: undefined,
        sentBy: undefined,
        sentFromDay: undefined,
        sentFromMonth: undefined,
        sentFromYear: undefined,
        sentToDay: undefined,
        sentToMonth: undefined,
        sentToYear: undefined,
        openFilter: undefined
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a sent by filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
      await EventHelper.add({
        type: 'notification',
        issuer: 'test@test.com',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({ sentBy: 'test.user@defra.gov.uk' })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a sentFromDay filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
      secondTestEvent = await EventHelper.add({
        type: 'notification',
        issuer: 'test@test.com',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        sentFromDay: 1,
        sentFromMonth: 1,
        sentFromYear: new Date().getFullYear()
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
      expect(result).to.contain(
        EventModel.fromJson({
          id: secondTestEvent.id,
          createdAt: secondTestEvent.createdAt,
          issuer: secondTestEvent.issuer,
          name: secondTestEvent.metadata.name,
          alertType: secondTestEvent.metadata.options.sendingAlertType,
          recipientCount: secondTestEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a sentToDay filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
      secondTestEvent = await EventHelper.add({
        type: 'notification',
        issuer: 'test@test.com',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        sentToDay: 1,
        sentToMonth: 11,
        sentToYear: new Date().getFullYear()
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
      expect(result).to.contain(
        EventModel.fromJson({
          id: secondTestEvent.id,
          createdAt: secondTestEvent.createdAt,
          issuer: secondTestEvent.issuer,
          name: secondTestEvent.metadata.name,
          alertType: secondTestEvent.metadata.options.sendingAlertType,
          recipientCount: secondTestEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a waterAbstractionAlerts with a resume filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'waterAbstractionAlerts',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'warning',
            linkages: [[{ alertType: 'resume' }]]
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          waterAbstractionAlertResume: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a waterAbstractionAlerts with a stop filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'waterAbstractionAlerts',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'warning',
            linkages: [[{ alertType: 'stop' }]]
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          waterAbstractionAlertStop: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a waterAbstractionAlertReduce with a reduce filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'waterAbstractionAlerts',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'warning',
            linkages: [[{ alertType: 'reduce' }]]
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          waterAbstractionAlertReduce: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a waterAbstractionAlertWarning with a warning filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'waterAbstractionAlerts',
        status: 'sent',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'warning',
            linkages: [[{ alertType: 'warning' }]]
          },
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          waterAbstractionAlertWarning: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: testEvent.metadata.options.sendingAlertType,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a returnsPaperForm filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'paperReturnForms',
        status: 'sent',
        metadata: {
          name: 'Paper returns',
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          returnsPaperForm: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: null,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a returnReminders filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'returnReminder',
        status: 'sent',
        metadata: {
          name: 'Returns: reminder',
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          returnReminders: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: null,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists and there is a returnInvitation filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'returnInvitation',
        status: 'sent',
        metadata: {
          name: 'Paper returns',
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          returnInvitation: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: null,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists with a subtype of with a hof-stop and there is a legacyNotifications filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'hof-stop',
        status: 'sent',
        metadata: {
          name: 'Hands off flow: stop abstraction',
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          legacyNotifications: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: null,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists with a subtype of with a hof-resume and there is a legacyNotifications filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'hof-resume',
        status: 'sent',
        metadata: {
          name: 'Hands off flow: resume abstraction',
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          legacyNotifications: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: null,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })

  describe('when an event exists with a subtype of with a hof-warning and there is a legacyNotifications filter applied', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        type: 'notification',
        subtype: 'hof-warning',
        status: 'sent',
        metadata: {
          name: 'Hands off flow: levels warning',
          recipients: 1
        }
      })
    })

    it('fetches the matching events', async () => {
      const result = await FetchEventsService.go({
        notifications: {
          legacyNotifications: true
        }
      })

      expect(result).to.contain(
        EventModel.fromJson({
          id: testEvent.id,
          createdAt: testEvent.createdAt,
          issuer: testEvent.issuer,
          name: testEvent.metadata.name,
          alertType: null,
          recipientCount: testEvent.metadata.recipients,
          errorCount: null
        })
      )
    })
  })
})
