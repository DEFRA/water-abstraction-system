// Test framework
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as NoticeSessionFixture from '../../../support/fixtures/notice-session.fixture.js'
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { addressToCSV } from '../../../../app/presenters/notices/base.presenter.js'
import { transformArrayToCSVRow } from '../../../../app/lib/transform-to-csv.lib.js'
import { formatAbstractionPeriod, formatValueUnit } from '../../../../app/presenters/base.presenter.js'

// Things to stub
import * as FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ProcessDownloadRecipientsService from '../../../../app/services/notices/setup/process-download-recipients.service.js'

describe('Notices - Setup - Process Download Recipients service', () => {
  let session
  let recipient

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the notice type is an "abstraction alert"', () => {
    beforeAll(() => {
      recipient = RecipientsFixture.alertNoticePrimaryUser()
      session = NoticeSessionFixture.abstractionAlertStop(recipient.licence_refs[0])

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService(session.id)

      const recipientRow = _transformAbstractionAlertRecipientToRow(recipient, session)

      expect(result).toEqual({
        data:
          // Headers
          'Licence,Abstraction periods,Measure type,Threshold,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          recipientRow,
        type: 'text/csv',
        filename: `${session.notificationType} - ${session.referenceCode}.csv`
      })
    })
  })

  describe('when the notice type is "paper returns"', () => {
    beforeAll(() => {
      recipient = RecipientsFixture.returnsNoticeLicenceHolder()
      session = NoticeSessionFixture.paperReturn(recipient.licence_refs[0])

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService(session.id)

      const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

      expect(result).toEqual({
        data:
          // Headers
          'Licence,Return id,Return reference,Return start date,Return end date,Return due date,Notification type,Notification due date,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          recipientRow,
        type: 'text/csv',
        filename: `${session.notificationType} - ${session.referenceCode}.csv`
      })
    })
  })

  describe('when the notice type is a "returns reminder"', () => {
    beforeAll(() => {
      recipient = RecipientsFixture.returnsNoticeLicenceHolder()
      session = NoticeSessionFixture.standardReminder(recipient.licence_refs[0])

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService(session.id)

      const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

      expect(result).toEqual({
        data:
          // Headers
          'Licence,Return id,Return reference,Return start date,Return end date,Return due date,Notification type,Notification due date,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          recipientRow,
        type: 'text/csv',
        filename: `${session.notificationType} - ${session.referenceCode}.csv`
      })
    })
  })

  describe('when the notice type is a "returns invitation"', () => {
    beforeAll(() => {
      recipient = RecipientsFixture.returnsNoticeLicenceHolder()
      session = NoticeSessionFixture.standardInvitation(recipient.licence_refs[0])

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService(session.id)

      const recipientRow = _transformRecipientToRow(recipient, session.notificationType)

      expect(result).toEqual({
        data:
          // Headers
          'Licence,Return id,Return reference,Return start date,Return end date,Return due date,Notification type,Notification due date,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          recipientRow,
        type: 'text/csv',
        filename: `${session.notificationType} - ${session.referenceCode}.csv`
      })
    })
  })

  describe('when the notice type is a "renewal invitation"', () => {
    beforeAll(() => {
      recipient = RecipientsFixture.renewalInvitationLicenceHolder()
      session = NoticeSessionFixture.adHocRenewalInvitation(recipient.licence_refs[0])

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService(session.id)

      const recipientRow = _transformRenewalRecipientToRow(recipient, session)

      expect(result).toEqual({
        data:
          // Headers
          'Licence,Renewal date,Expiry date,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          recipientRow,
        type: 'text/csv',
        filename: `${session.notificationType} - ${session.referenceCode}.csv`
      })
    })
  })
})

function _transformAbstractionAlertRecipientToRow(recipient, session) {
  const { notificationType, relevantLicenceMonitoringStations } = session

  const licenceMonitoringStation = relevantLicenceMonitoringStations[0]

  const abstractionPeriod = formatAbstractionPeriod(
    licenceMonitoringStation.abstractionPeriodStartDay,
    licenceMonitoringStation.abstractionPeriodStartMonth,
    licenceMonitoringStation.abstractionPeriodEndDay,
    licenceMonitoringStation.abstractionPeriodEndMonth
  )

  const row = [
    recipient.licence_refs[0],
    abstractionPeriod,
    licenceMonitoringStation.measureType,
    formatValueUnit(licenceMonitoringStation.thresholdValue, licenceMonitoringStation.thresholdUnit),
    notificationType,
    recipient.contact ? 'letter' : 'email',
    recipient.contact_type,
    recipient.email || '',
    ...addressToCSV(recipient.contact)
  ]

  return transformArrayToCSVRow(row)
}

function _transformRecipientToRow(recipient, notificationType) {
  const row = [
    recipient.licence_ref,
    recipient.return_id,
    recipient.return_reference,
    recipient.start_date,
    recipient.end_date,
    recipient.due_date,
    notificationType,
    recipient.notificationDueDate,
    recipient.message_type,
    recipient.contact_type,
    recipient.email || '',
    ...addressToCSV(recipient.contact)
  ]

  return transformArrayToCSVRow(row)
}

function _transformRenewalRecipientToRow(recipient, session) {
  const { expiryDate, notificationType, renewalDate } = session

  const row = [
    recipient.licence_refs.join(', '),
    new Date(renewalDate),
    new Date(expiryDate),
    notificationType,
    recipient.message_type,
    recipient.contact_type,
    recipient.email || '',
    ...addressToCSV(recipient.contact)
  ]

  return transformArrayToCSVRow(row)
}
