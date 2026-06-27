'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticeSessionFixture = require('../../../support/fixtures/notice-session.fixture.js')
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const { formatAbstractionPeriod, formatValueUnit } = require('../../../../app/presenters/base.presenter.js')
const { addressToCSV } = require('../../../../app/presenters/notices/base.presenter.js')
const { transformArrayToCSVRow } = require('../../../../app/lib/transform-to-csv.lib.js')

// Things to stub
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ProcessDownloadRecipientsService = require('../../../../app/services/notices/setup/process-download-recipients.service.js')

describe('Notices - Setup - Process Download Recipients service', () => {
  let session
  let recipient

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the notice type is an "abstraction alert"', () => {
    beforeAll(() => {
      recipient = RecipientsFixture.alertNoticePrimaryUser()
      session = NoticeSessionFixture.abstractionAlertStop(recipient.licence_refs[0])

      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      Sinon.stub(FetchRecipientsService, 'go').resolves([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService.go(session.id)

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

      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      Sinon.stub(FetchRecipientsService, 'go').resolves([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService.go(session.id)

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

      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      Sinon.stub(FetchRecipientsService, 'go').resolves([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService.go(session.id)

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

      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      Sinon.stub(FetchRecipientsService, 'go').resolves([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService.go(session.id)

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

      Sinon.stub(FetchSessionDal, 'go').resolves(session)

      Sinon.stub(FetchRecipientsService, 'go').resolves([recipient])
    })

    it('returns the correct csv string, filename and type', async () => {
      const result = await ProcessDownloadRecipientsService.go(session.id)

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
