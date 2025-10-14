'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Test helpers
const EventModel = require('../../../app/models/event.model.js')
const EventHelper = require('../../support/helpers/event.helper.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Thing under test
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')

describe('Notices - Fetch Notices service', () => {
  let abstractionAlertNotice
  let filters
  let legacyNotice
  let pageNumber
  let returnedInvitationNotice
  let returnsInvitationNotice

  before(async () => {
    returnsInvitationNotice = await EventHelper.add({
      createdAt: new Date('2025-07-01T15:01:47.023Z'),
      issuer: 'billing.data@wrls.gov.uk',
      metadata: {
        name: 'Returns: invitation',
        error: 1,
        options: { excludeLicences: [] },
        recipients: 1,
        returnCycle: {
          dueDate: new Date('2025-07-28'),
          endDate: new Date('2025-06-30'),
          isSummer: false,
          startDate: new Date('2025-04-01')
        }
      },
      overallStatus: 'error',
      referenceCode: NotificationHelper.generateReferenceCode(),
      status: 'completed',
      subtype: 'returnInvitation',
      type: 'notification'
    })

    legacyNotice = await EventHelper.add({
      createdAt: new Date('2024-09-01T18:42:59.659Z'),
      issuer: 'legacy.alerts@wrls.gov.uk',
      metadata: {
        name: 'Hands off flow: resume abstraction',
        sent: 0,
        error: 0,
        pending: 1,
        recipients: 1,
        taskConfigId: 4
      },
      overallStatus: 'pending',
      referenceCode: NotificationHelper.generateReferenceCode('HOF'),
      status: 'completed',
      subtype: 'hof-resume',
      type: 'notification'
    })

    abstractionAlertNotice = await EventHelper.add({
      createdAt: new Date('2025-09-17T09:13:26.924Z'),
      issuer: 'abstraction.alerts@wrls.gov.uk',
      metadata: {
        name: 'Water abstraction alert',
        error: 0,
        options: { sendingAlertType: 'stop', monitoringStationId: '464639dd-1c70-4107-94f1-575f07c434be' },
        recipients: 1
      },
      overallStatus: 'sent',
      referenceCode: NotificationHelper.generateReferenceCode('WAA'),
      status: 'completed',
      subtype: 'waterAbstractionAlerts',
      type: 'notification'
    })

    returnedInvitationNotice = await EventHelper.add({
      createdAt: new Date('2025-07-01T15:01:47.023Z'),
      issuer: 'billing.data@wrls.gov.uk',
      metadata: {
        name: 'Returns: invitation',
        error: 1,
        options: { excludeLicences: [] },
        recipients: 1,
        returnCycle: {
          dueDate: new Date('2025-07-28'),
          endDate: new Date('2025-06-30'),
          isSummer: false,
          startDate: new Date('2025-04-01')
        }
      },
      overallStatus: 'returned',
      referenceCode: NotificationHelper.generateReferenceCode(),
      status: 'completed',
      subtype: 'returnInvitation',
      type: 'notification'
    })
  })

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchNotices when no filter
    // has been applied by the user
    filters = _filters()

    pageNumber = 1
  })

  after(async () => {
    await abstractionAlertNotice.$query().delete()
    await legacyNotice.$query().delete()
    await returnsInvitationNotice.$query().delete()
    await returnedInvitationNotice.$query().delete()
  })

  describe('when no filter is applied', () => {
    beforeEach(() => {
      // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
      // part of the full suite, and the risk our test record is returned in the second page of results.
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
    })

    it('returns all notices ordered by the date they were created (newest to oldest)', async () => {
      const result = await FetchNoticesService.go(filters, pageNumber)

      // Assert first record was created later than last record
      expect(result.results[0].createdAt).to.be.above(result.results[result.results.length - 1].createdAt)

      // Assert we get the total number. Normally this would be in the thousands, whereas we will have fetched 25
      expect(result.total).to.exist()

      expect(result.results).contains(_transformNoticeToResult(returnsInvitationNotice))
      expect(result.results).contains(_transformNoticeToResult(returnedInvitationNotice))
      expect(result.results).contains(_transformNoticeToResult(legacyNotice))
      expect(result.results).contains(_transformNoticeToResult(abstractionAlertNotice))
    })
  })

  describe('when a filter is applied', () => {
    beforeEach(() => {
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
    })

    describe('and "Notice Types" has been set', () => {
      describe('and its a "standard" notice type (not an alert)', () => {
        describe('and its "returnsInvitation"', () => {
          beforeEach(() => {
            filters.noticeTypes.push('returnInvitation')
          })

          it('returns the matching notices', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).contains(_transformNoticeToResult(returnsInvitationNotice))
          })

          it('excludes those that do not match', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).not.contains(_transformNoticeToResult(legacyNotice))
            expect(result.results).not.contains(_transformNoticeToResult(abstractionAlertNotice))
          })
        })

        describe('and its "legacyNotifications"', () => {
          beforeEach(() => {
            filters.noticeTypes.push('legacyNotifications')
          })

          it('returns the matching notices', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).contains(_transformNoticeToResult(legacyNotice))
          })

          it('excludes those that do not match', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).not.contains(_transformNoticeToResult(returnsInvitationNotice))
            expect(result.results).not.contains(_transformNoticeToResult(abstractionAlertNotice))
          })
        })
      })

      describe('and its an "alert" notice type', () => {
        beforeEach(() => {
          filters.noticeTypes.push('stop')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).contains(_transformNoticeToResult(abstractionAlertNotice))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).not.contains(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).not.contains(_transformNoticeToResult(legacyNotice))
        })
      })

      describe('and its a combination of notice types (standard and alert)', () => {
        beforeEach(() => {
          filters.noticeTypes.push('returnInvitation')
          filters.noticeTypes.push('stop')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).contains(_transformNoticeToResult(returnsInvitationNotice))
          expect(result.results).contains(_transformNoticeToResult(abstractionAlertNotice))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).not.contains(_transformNoticeToResult(legacyNotice))
        })
      })
    })

    describe('and "Sent By" has been set', () => {
      beforeEach(() => {
        // NOTE: We use an uppercase "DATA" here to test that the service is using case insensitive LIKE where clause
        filters.sentBy = 'DATA'
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformNoticeToResult(returnsInvitationNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformNoticeToResult(legacyNotice))
        expect(result.results).not.contains(_transformNoticeToResult(abstractionAlertNotice))
      })
    })

    describe('and "Reference" has been set', () => {
      beforeEach(() => {
        // NOTE: We convert it to lowercase to test that the service is using case insensitive LIKE where clause
        filters.reference = abstractionAlertNotice.referenceCode.toLowerCase()
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformNoticeToResult(abstractionAlertNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformNoticeToResult(returnsInvitationNotice))
        expect(result.results).not.contains(_transformNoticeToResult(legacyNotice))
      })
    })

    describe('and "From Date" has been set', () => {
      beforeEach(() => {
        filters.fromDate = new Date('2025-09-10')
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformNoticeToResult(abstractionAlertNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformNoticeToResult(returnsInvitationNotice))
        expect(result.results).not.contains(_transformNoticeToResult(legacyNotice))
      })

      describe('and when "From Date" is the same as a notice "Created At"', () => {
        beforeEach(() => {
          filters.fromDate = new Date('2025-07-01')
        })

        it('returns the matching notice', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).contains(_transformNoticeToResult(returnsInvitationNotice))
        })
      })
    })

    describe('and "To Date" has been set', () => {
      beforeEach(() => {
        filters.toDate = new Date('2024-10-01')
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformNoticeToResult(legacyNotice))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformNoticeToResult(returnsInvitationNotice))
        expect(result.results).not.contains(_transformNoticeToResult(abstractionAlertNotice))
      })

      describe('and when "To Date" is the same as a notice "Created At"', () => {
        beforeEach(() => {
          filters.toDate = new Date('2025-07-01')
        })

        it('returns the matching notice', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).contains(_transformNoticeToResult(returnsInvitationNotice))
        })
      })
    })
  })

  describe('when the results are paginated', () => {
    beforeEach(() => {
      pageNumber = 2

      // NOTE: We know we create 3 records so we set the value to 2 to ensure the results are paginated
      Sinon.stub(databaseConfig, 'defaultPageSize').value(2)
    })

    it('can return the selected page', async () => {
      const result = await FetchNoticesService.go(filters, pageNumber)

      expect(result.results).not.to.be.empty()
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
    toDate: null
  }
}

function _transformNoticeToResult(eventInstance) {
  const data = {
    id: eventInstance.id,
    createdAt: eventInstance.createdAt,
    issuer: eventInstance.issuer,
    overallStatus: eventInstance.overallStatus,
    referenceCode: eventInstance.referenceCode,
    subtype: eventInstance.subtype,
    name: eventInstance.metadata.name,
    alertType: eventInstance.metadata.options?.sendingAlertType || null,
    recipientCount: eventInstance.metadata.recipients
  }

  return EventModel.fromJson(data)
}
