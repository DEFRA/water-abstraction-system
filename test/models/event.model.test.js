// Test helpers
import EventHelper from '../support/helpers/event.helper.js'
import NotificationHelper from '../support/helpers/notification.helper.js'
import NotificationModel from '../../app/models/notification.model.js'

// Thing under test
import EventModel from '../../app/models/event.model.js'

describe('Event model', () => {
  let testNotifications
  let testRecord

  beforeAll(async () => {
    testRecord = await EventHelper.add()

    testNotifications = []
    for (let i = 0; i < 2; i++) {
      const notification = await NotificationHelper.add({
        eventId: testRecord.id
      })

      testNotifications.push(notification)
    }
  })

  afterAll(async () => {
    for (const notification of testNotifications) {
      await notification.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await EventModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(EventModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to Notifications', () => {
      it('can successfully run a related query', async () => {
        const query = await EventModel.query().innerJoinRelated('notifications')

        expect(query).toBeDefined()
      })

      it('can eager load the notifications', async () => {
        const result = await EventModel.query().findById(testRecord.id).withGraphFetched('notifications')

        expect(result).toBeInstanceOf(EventModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.notifications).toBeInstanceOf(Array)
        expect(result.notifications[0]).toBeInstanceOf(NotificationModel)
        expect(result.notifications).toContainEqual(testNotifications[0])
        expect(result.notifications).toContainEqual(testNotifications[1])
      })
    })
  })
})
