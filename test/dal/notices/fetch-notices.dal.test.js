// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'

// Test helpers
import EventHelper from 'water-abstraction-engine/test/helpers/event.helper.js'
import EventModel from 'water-abstraction-engine/models/event.model.js'
import NoticesFixture from '../../support/fixtures/notices.fixture.js'

// Thing under test
import FetchNoticesDal from '../../../src/dal/notices/fetch-notices.dal.js'

describe('Notices - Fetch Notices DAL', () => {
  let abstractionAlertNotice
  let filters
  let legacyNotice
  let pageNumber
  let renewalFinalNotice
  let renewalInvitationNotice
  let renewalReminderNotice
  let returnedInvitationNotice
  let returnsInvitationNotice

  beforeAll(async () => {
    returnsInvitationNotice = await EventHelper.add({
      ...NoticesFixture.returnsInvitation(),
      createdAt: new Date('2025-07-01T15:01:47.023Z'),
      issuer: 'billing.data@wrls.gov.uk'
    })

    legacyNotice = await EventHelper.add({
      ...NoticesFixture.legacyHandsOffFlow(),
      createdAt: new Date('2024-09-01T18:42:59.659Z'),
      overallStatus: 'error',
      statusCounts: { cancelled: 0, error: 1, pending: 0, returned: 0, sent: 0 }
    })

    abstractionAlertNotice = await EventHelper.add({
      ...NoticesFixture.alertStop(),
      createdAt: new Date('2025-09-17T09:13:26.924Z')
    })

    returnedInvitationNotice = await EventHelper.add({
      ...NoticesFixture.returnsInvitation(),
      createdAt: new Date('2025-05-07T09:01:47.023Z'),
      overallStatus: 'returned',
      statusCounts: { cancelled: 0, error: 0, pending: 0, returned: 1, sent: 0 }
    })

    renewalFinalNotice = await EventHelper.add({
      ...NoticesFixture.renewalFinal(),
      createdAt: new Date('2025-07-01T15:26:47.023Z'),
      issuer: 'user@wrls.gov.uk'
    })

    renewalInvitationNotice = await EventHelper.add({
      ...NoticesFixture.renewalInvitation(),
      createdAt: new Date('2025-07-01T16:01:47.023Z'),
      issuer: 'user@wrls.gov.uk'
    })

    renewalReminderNotice = await EventHelper.add({
      ...NoticesFixture.renewalReminder(),
      createdAt: new Date('2025-07-01T17:05:47.023Z'),
      issuer: 'user@wrls.gov.uk'
    })
  })

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchNotices when no filter
    // has been applied by the user
    filters = _filters()

    pageNumber = 1
  })

  afterAll(async () => {
    await abstractionAlertNotice.$query().delete()
    await legacyNotice.$query().delete()
    await returnsInvitationNotice.$query().delete()
    await returnedInvitationNotice.$query().delete()
    await renewalReminderNotice.$query().delete()
    await renewalInvitationNotice.$query().delete()
    await renewalFinalNotice.$query().delete()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when no filter is applied', () => {
    beforeEach(() => {
      // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
      // part of the full suite, and the risk our test record is returned in the second page of results.
      vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 1000)
    })

    it('returns all notices ordered by the date they were created (newest to oldest)', async () => {
      const result = await FetchNoticesDal(filters, pageNumber)

      // Assert first record was created later than last record
      expect(result.results[0].createdAt.getTime()).toBeGreaterThan(
        result.results[result.results.length - 1].createdAt.getTime()
      )

      // Assert we get the total number. Normally this would be in the thousands, whereas we will have fetched 25
      expect(result.total).toBeDefined()

      expect(result.results).toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
      expect(result.results).toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
      expect(result.results).toContainEqual(_transformNoticeToResult(renewalFinalNotice))
      expect(result.results).toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
      expect(result.results).toContainEqual(_transformNoticeToResult(renewalReminderNotice))
      expect(result.results).toContainEqual(_transformNoticeToResult(legacyNotice))
      expect(result.results).toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
    })
  })

  describe('when a filter is applied', () => {
    beforeEach(() => {
      vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 1000)
    })

    describe('and "From Date" has been set', () => {
      beforeEach(() => {
        filters.fromDate = new Date('2025-09-10')
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
      })

      describe('and when "From Date" is the same as a notice "Created At"', () => {
        beforeEach(() => {
          filters.fromDate = new Date('2025-07-01')
        })

        it('returns the matching notice', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).toContainEqual(_transformNoticeToResult(renewalReminderNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(renewalFinalNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
        })
      })
    })

    describe('and "Notice Types" has been set', () => {
      describe('and its a "standard" notice type (not an alert)', () => {
        describe('and its "returnsInvitation"', () => {
          beforeEach(() => {
            filters.noticeTypes.push('returnInvitation')
          })

          it('returns the matching notices', async () => {
            const result = await FetchNoticesDal(filters, pageNumber)

            expect(result.results).toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
            expect(result.results).toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
          })

          it('excludes those that do not match', async () => {
            const result = await FetchNoticesDal(filters, pageNumber)

            expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
          })
        })

        describe('and its "legacyNotifications"', () => {
          beforeEach(() => {
            filters.noticeTypes.push('legacyNotifications')
          })

          it('returns the matching notices', async () => {
            const result = await FetchNoticesDal(filters, pageNumber)

            expect(result.results).toContainEqual(_transformNoticeToResult(legacyNotice))
          })

          it('excludes those that do not match', async () => {
            const result = await FetchNoticesDal(filters, pageNumber)

            expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
            expect(result.results).not.toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
          })
        })
      })

      describe('and its an "alert" notice type', () => {
        beforeEach(() => {
          filters.noticeTypes.push('stop')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
        })
      })

      describe('and its a combination of notice types (standard and alert)', () => {
        beforeEach(() => {
          filters.noticeTypes.push('returnInvitation')
          filters.noticeTypes.push('stop')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
        })
      })
    })

    describe('and "Reference" has been set', () => {
      beforeEach(() => {
        // NOTE: We convert it to lowercase to test that the service is using case insensitive LIKE where clause
        filters.reference = abstractionAlertNotice.referenceCode.toLowerCase()
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
      })
    })

    describe('and "Sent By" has been set', () => {
      beforeEach(() => {
        // NOTE: We use an uppercase "DATA" here to test that the service is using case insensitive LIKE where clause
        filters.sentBy = 'DATA'
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
      })
    })

    describe('and "Statuses" has been set', () => {
      describe('with just one status', () => {
        beforeEach(() => {
          filters.statuses.push('returned')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(legacyNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
        })
      })

      describe('with multiple statuses', () => {
        beforeEach(() => {
          filters.statuses.push('returned', 'error')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(legacyNotice))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).not.toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
        })
      })
    })

    describe('and "To Date" has been set', () => {
      beforeEach(() => {
        filters.toDate = new Date('2024-10-01')
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).toContainEqual(_transformNoticeToResult(legacyNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesDal(filters, pageNumber)

        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalReminderNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(renewalFinalNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
        expect(result.results).not.toContainEqual(_transformNoticeToResult(abstractionAlertNotice))
      })

      describe('and when "To Date" is the same as a notice "Created At"', () => {
        beforeEach(() => {
          filters.toDate = new Date('2025-07-01')
        })

        it('returns the matching notice', async () => {
          const result = await FetchNoticesDal(filters, pageNumber)

          expect(result.results).toContainEqual(_transformNoticeToResult(renewalReminderNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(renewalInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(renewalFinalNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(returnedInvitationNotice))
          expect(result.results).toContainEqual(_transformNoticeToResult(legacyNotice))
        })
      })
    })
  })

  describe('when the results are paginated', () => {
    beforeEach(() => {
      pageNumber = '2'

      // NOTE: We know we create 3 records so we set the value to 2 to ensure the results are paginated
      vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 2)
    })

    it('can return the selected page', async () => {
      const result = await FetchNoticesDal(filters, pageNumber)

      expect(result.results).not.toHaveLength(0)
    })
  })
})

function _filters() {
  return {
    fromDate: null,
    noticeTypes: [],
    populated: false,
    reference: null,
    sentBy: null,
    statuses: [],
    toDate: null
  }
}

function _transformNoticeToResult(eventInstance) {
  const data = {
    alertType: eventInstance.metadata.options?.sendingAlertType || null,
    createdAt: eventInstance.createdAt,
    id: eventInstance.id,
    issuer: eventInstance.issuer,
    name: eventInstance.metadata.name,
    overallStatus: eventInstance.overallStatus,
    recipientCount: eventInstance.metadata.recipients,
    referenceCode: eventInstance.referenceCode,
    subtype: eventInstance.subtype
  }

  return EventModel.fromJson(data)
}
