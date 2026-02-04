'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { futureDueDate } = require('../../../../app/presenters/notices/base.presenter.js')
const { generateNoticeReferenceCode, generateUUID } = require('../../../../app/lib/general.lib.js')
const { NOTIFY_TEMPLATES } = require('../../../../app/lib/notify-templates.lib.js')

// Thing under test
const CreateNotificationsService = require('../../../../app/services/notices/setup/create-notifications.service.js')

describe('Notices - Setup - Create Notifications service', () => {
  const noticeId = generateUUID()

  let recipients
  let session

  describe('when the notice is an abstraction alert', () => {
    beforeEach(() => {
      recipients = [RecipientsFixture.alertNoticePrimaryUser(), RecipientsFixture.alertNoticeAdditionalContact()]

      const licenceMonitoringStations = [
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          id: generateUUID(),
          latestNotification: null,
          licence: {
            id: generateUUID(),
            licenceRef: recipients[0].licence_refs[0]
          },
          measureType: 'flow',
          notes: null,
          restrictionType: 'stop',
          thresholdGroup: 'flow-50-m3/s',
          thresholdValue: 50,
          thresholdUnit: 'm3/s'
        },
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          id: generateUUID(),
          latestNotification: null,
          licence: {
            id: generateUUID(),
            licenceRef: recipients[1].licence_refs[0]
          },
          measureType: 'flow',
          notes: null,
          restrictionType: 'stop',
          thresholdGroup: 'flow-500-Ml/d',
          thresholdValue: 500,
          thresholdUnit: 'Ml/d'
        }
      ]

      session = {
        alertEmailAddress: 'admin-internal@wrls.gov.uk',
        alertEmailAddressType: 'username',
        alertThresholds: ['flow-50-m3/s', 'flow-500-Ml/d'],
        alertType: 'stop',
        licenceRefs: [...recipients[0].licence_refs, ...recipients[1].licence_refs],
        licenceMonitoringStations,
        journey: 'alerts',
        monitoringStationId: generateUUID(),
        monitoringStationName: 'DEATH STAR',
        monitoringStationRiverName: '',
        name: 'Water abstraction alert',
        noticeType: 'abstractionAlerts',
        notificationType: 'Abstraction alert',
        referenceCode: generateNoticeReferenceCode('WAA-'),
        relevantLicenceMonitoringStations: [...licenceMonitoringStations],
        removedThresholds: [],
        selectedRecipients: [recipients[0].contact_hash_id, recipients[1].contact_hash_id],
        subType: 'waterAbstractionAlerts'
      }
    })

    it('returns the created the abstraction alert notifications', async () => {
      const results = await CreateNotificationsService.go(session, recipients, noticeId)

      expect(results).to.have.length(2)

      expect(results[0]).to.equal(
        {
          contactType: recipients[0].contact_type,
          dueDate: null,
          eventId: noticeId,
          licenceMonitoringStationId: session.licenceMonitoringStations[0].id,
          licences: recipients[0].licence_refs,
          messageRef: 'abstraction alert stop',
          messageType: 'email',
          pdf: null,
          personalisation: {
            alertType: 'stop',
            condition_text: '',
            flow_or_level: 'flow',
            issuer_email_address: 'admin-internal@wrls.gov.uk',
            label: 'DEATH STAR',
            licenceGaugingStationId: session.licenceMonitoringStations[0].id,
            licenceId: session.licenceMonitoringStations[0].licence.id,
            licenceRef: session.licenceMonitoringStations[0].licence.licenceRef,
            monitoring_station_name: 'DEATH STAR',
            sending_alert_type: 'stop',
            source: '',
            thresholdUnit: 'm3/s',
            thresholdValue: 50
          },
          recipient: recipients[0].email,
          returnLogIds: null,
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.alerts.email.stop
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )

      expect(results[1]).to.equal(
        {
          contactType: recipients[1].contact_type,
          dueDate: null,
          eventId: noticeId,
          licenceMonitoringStationId: session.licenceMonitoringStations[1].id,
          licences: recipients[1].licence_refs,
          messageRef: 'abstraction alert stop',
          messageType: 'email',
          pdf: null,
          personalisation: {
            alertType: 'stop',
            condition_text: '',
            flow_or_level: 'flow',
            issuer_email_address: 'admin-internal@wrls.gov.uk',
            label: 'DEATH STAR',
            licenceGaugingStationId: session.licenceMonitoringStations[1].id,
            licenceId: session.licenceMonitoringStations[1].licence.id,
            licenceRef: session.licenceMonitoringStations[1].licence.licenceRef,
            monitoring_station_name: 'DEATH STAR',
            sending_alert_type: 'stop',
            source: '',
            thresholdUnit: 'Ml/d',
            thresholdValue: 500
          },
          recipient: recipients[1].email,
          returnLogIds: null,
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.alerts.email.stop
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )
    })
  })

  describe('when the notice is a paper return', () => {
    beforeEach(() => {
      const licenceHolder = RecipientsFixture.returnsNoticeLicenceHolder()
      const returnsTo = RecipientsFixture.returnsNoticeReturnsTo()

      returnsTo.licence_refs = licenceHolder.licence_refs
      recipients = [licenceHolder, returnsTo]

      const referenceCode = generateNoticeReferenceCode('PRTF-')
      const selectedReturnId = generateUUID()
      const sessionId = generateUUID()
      const licenceRef = licenceHolder.licence_refs[0]

      session = {
        addressJourney: {
          address: {},
          backLink: {
            href: `/system/notices/setup/${sessionId}/recipient-name`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`,
          activeNavBar: 'notices',
          pageTitleCaption: `Notice ${referenceCode}`
        },
        checkPageVisited: true,
        dueReturns: [
          {
            dueDate: '2025-04-28T00:00:00.000Z',
            endDate: '2025-03-31T00:00:00.000Z',
            naldAreaCode: 'RIDIN',
            purpose: 'Spray Irrigation - Direct',
            regionCode: 3,
            regionName: 'North East',
            returnId: `v1:3:${licenceRef}:10059610:2024-04-01:2025-03-31`,
            returnLogId: selectedReturnId,
            returnReference: '10059610',
            returnsFrequency: 'month',
            siteDescription: 'BOREHOLE AT AVALON',
            startDate: '2024-04-01T00:00:00.000Z',
            twoPartTariff: false
          },
          {
            dueDate: '2024-04-28T00:00:00.000Z',
            endDate: '2024-03-31T00:00:00.000Z',
            purpose: 'Spray Irrigation - Direct',
            startDate: '2023-04-01T00:00:00.000Z',
            regionCode: 3,
            regionName: 'North East',
            returnId: `v1:3:${licenceRef}:10044001:2023-04-01:2024-03-31`,
            returnLogId: generateUUID(),
            naldAreaCode: 'RIDIN',
            twoPartTariff: false,
            returnReference: '10044001',
            siteDescription: 'PUMP AT TINTAGEL',
            returnsFrequency: 'month'
          }
        ],
        id: sessionId,
        licenceRef,
        journey: 'adhoc',
        name: 'Paper returns',
        notificationType: 'Paper returns',
        noticeType: 'paperReturn',
        referenceCode,
        selectedRecipients: [recipients[0].contact_hash_id, recipients[1].contact_hash_id],
        selectedReturns: [selectedReturnId],
        subType: 'paperReturnForms'
      }
    })

    it('returns the created the paper return notifications', async () => {
      const results = await CreateNotificationsService.go(session, recipients, noticeId)

      expect(results).to.have.length(2)

      expect(results[0]).to.equal(
        {
          contactType: recipients[0].contact_type,
          dueDate: new Date(session.dueReturns[0].dueDate),
          eventId: noticeId,
          licenceMonitoringStationId: null,
          licences: recipients[0].licence_refs,
          messageRef: 'paper return',
          messageType: 'letter',
          pdf: null,
          personalisation: {
            address_line_1: 'J Returnsholder',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            due_date: '28 April 2025',
            end_date: '31 March 2025',
            format_id: '10059610',
            is_two_part_tariff: false,
            licence_ref: session.licenceRef,
            naldAreaCode: 'RIDIN',
            purpose: 'Spray Irrigation - Direct',
            qr_url: session.dueReturns[0].returnLogId,
            region_code: 3,
            region_name: 'North East',
            returns_frequency: 'month',
            site_description: 'BOREHOLE AT AVALON',
            start_date: '1 April 2024'
          },
          recipient: null,
          returnLogIds: session.selectedReturns,
          status: 'pending',
          templateId: null
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )

      expect(results[1]).to.equal(
        {
          contactType: recipients[1].contact_type,
          dueDate: new Date(session.dueReturns[0].dueDate),
          eventId: noticeId,
          licenceMonitoringStationId: null,
          licences: recipients[1].licence_refs,
          messageRef: 'paper return',
          messageType: 'letter',
          pdf: null,
          personalisation: {
            address_line_1: 'J Returnsto',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            due_date: '28 April 2025',
            end_date: '31 March 2025',
            format_id: '10059610',
            is_two_part_tariff: false,
            licence_ref: session.licenceRef,
            naldAreaCode: 'RIDIN',
            purpose: 'Spray Irrigation - Direct',
            qr_url: session.dueReturns[0].returnLogId,
            region_code: 3,
            region_name: 'North East',
            returns_frequency: 'month',
            site_description: 'BOREHOLE AT AVALON',
            start_date: '1 April 2024'
          },
          recipient: null,
          returnLogIds: session.selectedReturns,
          status: 'pending',
          templateId: null
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )
    })
  })

  describe('when the notice is a returns invitation or reminder', () => {
    beforeEach(() => {
      recipients = [RecipientsFixture.returnsNoticeLicenceHolder(), RecipientsFixture.returnsNoticeReturnsTo()]

      const referenceCode = generateNoticeReferenceCode('RINV-')
      const sessionId = generateUUID()

      session = {
        addressJourney: {
          address: {},
          backLink: {
            href: `/system/notices/setup/${sessionId}/recipient-name`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`,
          activeNavBar: 'notices',
          pageTitleCaption: `Notice ${referenceCode}`
        },
        checkPageVisited: true,
        id: sessionId,
        journey: 'standard',
        name: 'Returns: invitation',
        notificationType: 'Returns invitation',
        noticeType: 'invitations',
        referenceCode,
        selectedRecipients: [recipients[0].contact_hash_id, recipients[1].contact_hash_id],
        subType: 'returnInvitation'
      }
    })

    it('returns the created the returns notifications', async () => {
      const results = await CreateNotificationsService.go(session, recipients, noticeId)

      expect(results).to.have.length(2)

      expect(results[0]).to.equal(
        {
          contactType: recipients[0].contact_type,
          dueDate: futureDueDate('letter'),
          eventId: noticeId,
          licenceMonitoringStationId: null,
          licences: recipients[0].licence_refs,
          messageRef: 'returns invitation',
          messageType: 'letter',
          pdf: null,
          personalisation: {
            address_line_1: 'J Returnsholder',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            name: 'J Returnsholder',
            periodEndDate: null,
            periodStartDate: null,
            returnDueDate: formatLongDate(futureDueDate('letter'))
          },
          recipient: null,
          returnLogIds: recipients[0].return_log_ids,
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )

      expect(results[1]).to.equal(
        {
          contactType: recipients[1].contact_type,
          dueDate: futureDueDate('letter'),
          eventId: noticeId,
          licenceMonitoringStationId: null,
          licences: recipients[1].licence_refs,
          messageRef: 'returns invitation',
          messageType: 'letter',
          pdf: null,
          personalisation: {
            address_line_1: 'J Returnsto',
            address_line_2: '4',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            name: 'J Returnsto',
            periodEndDate: null,
            periodStartDate: null,
            returnDueDate: formatLongDate(futureDueDate('letter'))
          },
          recipient: null,
          returnLogIds: recipients[1].return_log_ids,
          status: 'pending',
          templateId: NOTIFY_TEMPLATES.invitations.standard.letter['returns to']
        },
        { skip: ['createdAt', 'id', 'updatedAt'] }
      )
    })
  })
})
