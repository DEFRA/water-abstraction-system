// Test framework
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import EventHelper from '../../support/helpers/event.helper.js'
import NotificationHelper from '../../support/helpers/notification.helper.js'
import { generateNoticeReferenceCode } from '../../support/generators.js'

// Thing under test
import FetchNoticeService from '../../../app/services/notices/fetch-notice.service.js'

describe('Notices - Fetch Notice service', () => {
  const pageNumber = '1'

  let event
  let filters
  let notificationEmail
  let notificationLetter

  beforeAll(async () => {
    event = await EventHelper.add({
      issuer: 'admin-internal@wrls.gov.uk',
      licences: ['01/123', '01/124'],
      metadata: {
        name: 'Water abstraction alert',
        error: 1,
        options: {
          sendingAlertType: 'warning',
          monitoringStationId: '7195f45e-6597-4771-85dc-e223cb55bc63'
        },
        recipients: 2
      },
      overallStatus: 'error',
      referenceCode: generateNoticeReferenceCode('WAA-'),
      status: 'completed',
      subtype: 'waterAbstractionAlerts',
      type: 'notification'
    })

    notificationEmail = await NotificationHelper.add({
      eventId: event.id,
      licences: ['01/124'],
      messageRef: 'abstraction alert reduce or stop warning',
      messageType: 'email',
      notifyId: '0bc87785-e64f-4b99-b15c-ee825235f9bf',
      notifyStatus: 'permanent-failure',
      personalisation: {
        alertType: 'warning',
        condition_text: '',
        flow_or_level: 'flow',
        issuer_email_address: 'admin-internal@wrls.gov.uk',
        licence_ref: '01/124',
        licenceMonitoringStationId: '399d4483-a198-4fe5-b229-45e2fc2a57ec',
        monitoring_station_name: 'FRENCHAY',
        source: '',
        threshold_unit: 'm3/s',
        threshold_value: 100
      },
      recipient: 'shaw.carol@atari.com',
      status: 'error'
    })

    notificationLetter = await NotificationHelper.add({
      eventId: event.id,
      licences: ['01/123'],
      messageRef: 'abstraction alert stop',
      messageType: 'letter',
      notifyId: '67b2849b-02bc-42fd-a623-86f6c2817e2d',
      notifyStatus: 'received',
      personalisation: {
        address_line_1: 'Clean Water Limited',
        address_line_2: 'c/o Bob Bobbles',
        address_line_3: 'Water Lane',
        address_line_4: 'Swampy Heath',
        address_line_5: 'CAMBRIDGESHIRE',
        address_line_6: 'CB23 1ZZ',
        alertType: 'warning',
        condition_text: 'Effect of restriction: 9.2 (ii) No abstraction shall take place when we say so',
        flow_or_level: 'flow',
        issuer_email_address: 'admin-internal@wrls.gov.uk',
        licence_ref: '01/123',
        licenceMonitoringStationId: 'b7cb48d1-7e23-49b8-9cee-686d302fdc48',
        name: 'Clean Water Limited',
        monitoring_station_name: 'FRENCHAY',
        source: '',
        threshold_unit: 'm3/s',
        threshold_value: 100
      },
      recipient: null,
      status: 'sent'
    })
  })

  beforeEach(() => {
    // NOTE: Mirrors an empty filters object as used by the services that call FetchNotice when no filter has been
    // applied by the user
    filters = {
      licence: null,
      openFilter: false,
      recipient: null,
      status: null
    }
  })

  describe('when no filter is applied', () => {
    it('returns the matching notice and associated notifications ordered by recipient name', async () => {
      const result = await FetchNoticeService(event.id, filters, pageNumber)

      expect(result.notice).toEqual({
        createdAt: event.createdAt,
        id: event.id,
        referenceCode: event.referenceCode,
        issuer: 'admin-internal@wrls.gov.uk',
        overallStatus: 'error',
        status: 'completed',
        subtype: 'waterAbstractionAlerts',
        alertType: 'warning'
      })

      expect(result.notifications).toEqual([
        {
          id: notificationLetter.id,
          recipientName: 'Clean Water Limited',
          licences: ['01/123'],
          messageType: 'letter',
          notifyStatus: 'received',
          personalisation: notificationLetter.personalisation,
          status: 'sent'
        },
        {
          id: notificationEmail.id,
          recipientName: 'shaw.carol@atari.com',
          licences: ['01/124'],
          messageType: 'email',
          notifyStatus: 'permanent-failure',
          personalisation: notificationEmail.personalisation,
          status: 'error'
        }
      ])

      expect(result.totalNumber).toEqual(2)
    })
  })

  describe('when a filter is applied', () => {
    describe('and "Status" has been set', () => {
      describe('and it is "Error"', () => {
        beforeEach(() => {
          filters.status = 'error'
        })

        it('returns the matching notifications', async () => {
          const result = await FetchNoticeService(event.id, filters, pageNumber)

          expect(result.notifications).toEqual([
            {
              id: notificationEmail.id,
              recipientName: 'shaw.carol@atari.com',
              licences: ['01/124'],
              messageType: 'email',
              notifyStatus: 'permanent-failure',
              personalisation: notificationEmail.personalisation,
              status: 'error'
            }
          ])

          expect(result.totalNumber).toEqual(1)
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticeService(event.id, filters, pageNumber)

          expect(result.notifications).not.toContainEqual({
            id: notificationLetter.id,
            recipientName: 'Clean Water Limited',
            licences: ['01/123'],
            messageType: 'letter',
            notifyStatus: 'received',
            personalisation: notificationLetter.personalisation,
            status: 'sent'
          })
        })
      })

      describe('and it is "Pending"', () => {
        beforeEach(() => {
          filters.status = 'pending'
        })

        it('returns the matching notifications (none in this case)', async () => {
          const result = await FetchNoticeService(event.id, filters, pageNumber)

          expect(result.notifications).toHaveLength(0)

          expect(result.totalNumber).toEqual(0)
        })

        it('excludes those that do not match (all in this case)', async () => {
          const result = await FetchNoticeService(event.id, filters, pageNumber)

          expect(result.notifications).not.toContainEqual({
            id: notificationEmail.id,
            recipientName: 'shaw.carol@atari.com',
            licences: ['01/124'],
            messageType: 'email',
            notifyStatus: 'permanent-failure',
            personalisation: notificationEmail.personalisation,
            status: 'error'
          })

          expect(result.notifications).not.toContainEqual({
            id: notificationLetter.id,
            recipientName: 'Clean Water Limited',
            licences: ['01/123'],
            messageType: 'letter',
            notifyStatus: 'received',
            personalisation: notificationLetter.personalisation,
            status: 'sent'
          })
        })
      })

      describe('and it is "Sent"', () => {
        beforeEach(() => {
          filters.status = 'sent'
        })

        it('returns the matching notifications', async () => {
          const result = await FetchNoticeService(event.id, filters, pageNumber)

          expect(result.notifications).toEqual([
            {
              id: notificationLetter.id,
              recipientName: 'Clean Water Limited',
              licences: ['01/123'],
              messageType: 'letter',
              notifyStatus: 'received',
              personalisation: notificationLetter.personalisation,
              status: 'sent'
            }
          ])

          expect(result.totalNumber).toEqual(1)
        })

        it('excludes those that do not match', async () => {
          const result = await FetchNoticeService(event.id, filters, pageNumber)

          expect(result.notifications).not.toContainEqual({
            id: notificationEmail.id,
            recipientName: 'shaw.carol@atari.com',
            licences: ['01/124'],
            messageType: 'email',
            notifyStatus: 'permanent-failure',
            personalisation: notificationEmail.personalisation,
            status: 'error'
          })
        })
      })
    })

    describe('and "recipient" has been set', () => {
      beforeEach(() => {
        // NOTE: We use an lowercase "water" here to test that the service is using a case insensitive where LIKE clause
        filters.recipient = 'water'
      })

      it('returns the matching notifications', async () => {
        const result = await FetchNoticeService(event.id, filters, pageNumber)

        expect(result.notifications).toEqual([
          {
            id: notificationLetter.id,
            recipientName: 'Clean Water Limited',
            licences: ['01/123'],
            messageType: 'letter',
            notifyStatus: 'received',
            personalisation: notificationLetter.personalisation,
            status: 'sent'
          }
        ])

        expect(result.totalNumber).toEqual(1)
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticeService(event.id, filters, pageNumber)

        expect(result.notifications).not.toContainEqual({
          id: notificationEmail.id,
          recipientName: 'shaw.carol@atari.com',
          licences: ['01/124'],
          messageType: 'email',
          notifyStatus: 'permanent-failure',
          personalisation: notificationEmail.personalisation,
          status: 'error'
        })
      })
    })

    describe('and "licence" has been set', () => {
      beforeEach(() => {
        filters.licence = '01/124'
      })

      it('returns the matching notifications', async () => {
        const result = await FetchNoticeService(event.id, filters, pageNumber)

        expect(result.notifications).toEqual([
          {
            id: notificationEmail.id,
            recipientName: 'shaw.carol@atari.com',
            licences: ['01/124'],
            messageType: 'email',
            notifyStatus: 'permanent-failure',
            personalisation: notificationEmail.personalisation,
            status: 'error'
          }
        ])

        expect(result.totalNumber).toEqual(1)
      })

      it('excludes those that do not match', async () => {
        const result = await FetchNoticeService(event.id, filters, pageNumber)

        expect(result.notifications).not.toContainEqual({
          id: notificationLetter.id,
          recipientName: 'Clean Water Limited',
          licences: ['01/123'],
          messageType: 'letter',
          notifyStatus: 'received',
          personalisation: notificationLetter.personalisation,
          status: 'sent'
        })
      })
    })
  })

  describe('when no matching notice exists', () => {
    it('returns an empty result', async () => {
      const result = await FetchNoticeService('1f0e0086-7bc4-4ef2-a696-35ea1e79d224', filters, pageNumber)

      expect(result).toEqual({
        notice: undefined,
        notifications: [],
        totalNumber: 0
      })
    })
  })
})
