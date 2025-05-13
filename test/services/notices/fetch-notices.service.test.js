'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesSeeder = require('../../support/seeders/notices.seeder.js')
const EventModel = require('../../../app/models/event.model.js')

// Thing under test
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')

describe('Notices - Fetch Notices service', () => {
  const pageNumber = 1

  let filters
  let seedData

  before(async () => {
    seedData = await NoticesSeeder.seed()
  })

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchNotices when no filter
    // has been applied by the user
    filters = _filters()
  })

  describe('when no filter is applied', () => {
    it('returns all notices ordered by the date they were created (newest to oldest)', async () => {
      const result = await FetchNoticesService.go(filters, pageNumber)

      expect(result.results).contains(_transformEventToResult(seedData.fromDateEvent))
      expect(result.results).contains(_transformEventToResult(seedData.legacyEvent))
      expect(result.results).contains(_transformEventToResult(seedData.resumeAlertEvent))
      expect(result.results).contains(_transformEventToResult(seedData.sentByEvent))
      expect(result.results).contains(_transformEventToResult(seedData.stopAlertEvent))
    })
  })

  describe('when a filter is applied', () => {
    describe('and "Sent By" has been set', () => {
      beforeEach(() => {
        filters.sentBy = 'area.team@wrls.gov.uk'
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformEventToResult(seedData.sentByEvent))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformEventToResult(seedData.fromDateEvent))
        expect(result.results).not.contains(_transformEventToResult(seedData.legacyEvent))
        expect(result.results).not.contains(_transformEventToResult(seedData.resumeAlertEvent))
        expect(result.results).not.contains(_transformEventToResult(seedData.stopAlertEvent))
      })
    })

    describe('and "From Date" has been set', () => {
      beforeEach(() => {
        filters.fromDate = new Date('2025-04-01')
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformEventToResult(seedData.fromDateEvent))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformEventToResult(seedData.legacyEvent))
        expect(result.results).not.contains(_transformEventToResult(seedData.resumeAlertEvent))
        expect(result.results).not.contains(_transformEventToResult(seedData.sentByEvent))
        expect(result.results).not.contains(_transformEventToResult(seedData.stopAlertEvent))
      })
    })

    describe('and "To Date" has been set', () => {
      beforeEach(() => {
        filters.toDate = new Date('2025-04-01')
      })

      it('returns the matching notices', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).contains(_transformEventToResult(seedData.legacyEvent))
        expect(result.results).contains(_transformEventToResult(seedData.resumeAlertEvent))
        expect(result.results).contains(_transformEventToResult(seedData.sentByEvent))
        expect(result.results).contains(_transformEventToResult(seedData.stopAlertEvent))
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticesService.go(filters, pageNumber)

        expect(result.results).not.contains(_transformEventToResult(seedData.fromDateEvent))
      })
    })

    describe('and "Notice Types" has been set', () => {
      describe('and its a "standard" notice type (not an alert)', () => {
        describe('and its "returnsInvitation"', () => {
          beforeEach(() => {
            filters.noticeTypes.push('returnInvitation')
          })

          it('returns the matching notices', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).contains(_transformEventToResult(seedData.fromDateEvent))
            expect(result.results).contains(_transformEventToResult(seedData.sentByEvent))
          })

          it('excludes those that do not match', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).not.contains(_transformEventToResult(seedData.legacyEvent))
            expect(result.results).not.contains(_transformEventToResult(seedData.resumeAlertEvent))
            expect(result.results).not.contains(_transformEventToResult(seedData.stopAlertEvent))
          })
        })

        describe('and its "legacyNotifications"', () => {
          beforeEach(() => {
            filters.noticeTypes.push('legacyNotifications')
          })

          it('returns the matching notices', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).contains(_transformEventToResult(seedData.legacyEvent))
          })

          it('excludes those that do not match', async () => {
            const result = await FetchNoticesService.go(filters, pageNumber)

            expect(result.results).not.contains(_transformEventToResult(seedData.fromDateEvent))
            expect(result.results).not.contains(_transformEventToResult(seedData.resumeAlertEvent))
            expect(result.results).not.contains(_transformEventToResult(seedData.sentByEvent))
            expect(result.results).not.contains(_transformEventToResult(seedData.stopAlertEvent))
          })
        })
      })

      describe('and its an "alert" notice type', () => {
        beforeEach(() => {
          filters.noticeTypes.push('resume')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).contains(_transformEventToResult(seedData.resumeAlertEvent))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).not.contains(_transformEventToResult(seedData.fromDateEvent))
          expect(result.results).not.contains(_transformEventToResult(seedData.legacyEvent))
          expect(result.results).not.contains(_transformEventToResult(seedData.sentByEvent))
          expect(result.results).not.contains(_transformEventToResult(seedData.stopAlertEvent))
        })
      })

      describe('and its a combination of notice types (standard and alert)', () => {
        beforeEach(() => {
          filters.noticeTypes.push('returnInvitation')
          filters.noticeTypes.push('stop')
        })

        it('returns the matching notices', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).contains(_transformEventToResult(seedData.fromDateEvent))
          expect(result.results).contains(_transformEventToResult(seedData.sentByEvent))
          expect(result.results).contains(_transformEventToResult(seedData.stopAlertEvent))
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticesService.go(filters, pageNumber)

          expect(result.results).not.contains(_transformEventToResult(seedData.legacyEvent))
          expect(result.results).not.contains(_transformEventToResult(seedData.resumeAlertEvent))
        })
      })
    })
  })
})

function _filters() {
  return {
    fromDate: null,
    noticeTypes: [],
    populated: false,
    sentBy: null,
    toDate: null
  }
}

function _transformEventToResult(eventInstance, overrides = {}) {
  const data = {
    id: eventInstance.id,
    createdAt: eventInstance.createdAt,
    issuer: eventInstance.issuer,
    name: eventInstance.metadata.name,
    alertType: eventInstance.metadata.options?.sendingAlertType || null,
    recipientCount: eventInstance.metadata.recipients,
    errorCount: eventInstance.metadata.error,
    ...overrides
  }

  return EventModel.fromJson(data)
}
