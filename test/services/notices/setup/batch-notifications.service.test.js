'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const EventHelper = require('../../../support/helpers/event.helper.js')
const EventModel = require('../../../../app/models/event.model.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { stubNotify } = require('../../../../config/notify.config.js')

// Things we need to stub
const NotifyConfig = require('../../../../config/notify.config.js')
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const BatchNotificationsService = require('../../../../app/services/notices/setup/batch-notifications.service.js')

describe.only('Notices - Setup - Batch notifications service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100
  const referenceCode = 'RINV-123'

  let event
  let eventId
  let notifierStub
  let recipients
  let session
  let testRecipients

  beforeEach(async () => {
    // By setting the batch size to 1 we can prove that all the batches are run, as we should have all the notifications
    // still saved in the database regardless of batch size
    Sinon.stub(NotifyConfig, 'batchSize').value(1)
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly, we do not want increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the journey is a return journey', () => {
    beforeEach(async () => {
      recipients = RecipientsFixture.recipients()

      testRecipients = [...Object.values(recipients)]

      event = await EventHelper.add({
        type: 'notification',
        subtype: 'returnsInvitation',
        referenceCode,
        metadata: {}
      })

      eventId = event.id

      session = {
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: '2025-04-28',
          endDate: '2023-03-31',
          summer: 'false',
          startDate: '2022-04-01'
        },
        journey: 'invitations',
        referenceCode
      }
    })

    describe('when the batch is successful', () => {
      beforeEach(() => {
        _stubSuccessfulNotify({
          data: {
            id: '12345',
            content: {
              body: 'My dearest margery'
            }
          },
          status: 201,
          statusText: 'CREATED'
        })
      })

      it('should persist the notifications', async () => {
        await BatchNotificationsService.go(testRecipients, session, eventId)

        const result = await _getNotifications(eventId)

        const [firstMultiple, secondMultiple] = recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')

        expect(result).to.equal([
          {
            id: result[0].id,
            recipient: 'primary.user@important.com',
            messageType: 'email',
            messageRef: 'returns_invitation_primary_user_email',
            personalisation: {
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              periodStartDate: '1 April 2022'
            },
            status: 'pending',
            notifyError: null,
            licences: [recipients.primaryUser.licence_refs],
            notifyId: result[0].notifyId,
            notifyStatus: 'created',
            plaintext: result[0].plaintext,
            eventId,
            createdAt: result[0].createdAt
          },
          {
            id: result[1].id,
            recipient: 'returns.agent@important.com',
            messageType: 'email',
            messageRef: 'returns_invitation_returns_agent_email',
            personalisation: {
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              periodStartDate: '1 April 2022'
            },
            status: 'pending',
            notifyError: null,
            licences: [recipients.returnsAgent.licence_refs],
            notifyId: result[1].notifyId,
            notifyStatus: 'created',
            plaintext: result[1].plaintext,
            eventId,
            createdAt: result[1].createdAt
          },
          {
            id: result[2].id,
            recipient: null,
            messageType: 'letter',
            messageRef: 'returns_invitation_licence_holder_letter',
            personalisation: {
              name: 'Mr H J Licence holder',
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              address_line_1: '1',
              address_line_2: 'Privet Drive',
              address_line_3: 'Little Whinging',
              address_line_4: 'Surrey',
              address_line_5: 'WD25 7LR',
              periodStartDate: '1 April 2022'
            },
            status: 'pending',
            notifyError: null,
            licences: [recipients.licenceHolder.licence_refs],
            notifyId: result[2].notifyId,
            notifyStatus: 'created',
            plaintext: result[2].plaintext,
            eventId,
            createdAt: result[2].createdAt
          },
          {
            id: result[3].id,
            recipient: null,
            messageType: 'letter',
            messageRef: 'returns_invitation_returns_to_letter',
            personalisation: {
              name: 'Mr H J Returns to',
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              address_line_1: '2',
              address_line_2: 'Privet Drive',
              address_line_3: 'Little Whinging',
              address_line_4: 'Surrey',
              address_line_5: 'WD25 7LR',
              periodStartDate: '1 April 2022'
            },
            status: 'pending',
            notifyError: null,
            licences: [recipients.returnsTo.licence_refs],
            notifyId: result[3].notifyId,
            notifyStatus: 'created',
            plaintext: result[3].plaintext,
            eventId,
            createdAt: result[3].createdAt
          },
          {
            id: result[4].id,
            recipient: null,
            messageType: 'letter',
            messageRef: 'returns_invitation_licence_holder_letter',
            personalisation: {
              name: 'Mr H J Licence holder with multiple licences',
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              address_line_1: '3',
              address_line_2: 'Privet Drive',
              address_line_3: 'Little Whinging',
              address_line_4: 'Surrey',
              address_line_5: 'WD25 7LR',
              periodStartDate: '1 April 2022'
            },
            status: 'pending',
            notifyError: null,
            licences: [firstMultiple, secondMultiple],
            notifyId: result[4].notifyId,
            notifyStatus: 'created',
            plaintext: result[4].plaintext,
            eventId,
            createdAt: result[4].createdAt
          }
        ])
      })

      if (stubNotify) {
        it('correctly sends the "email" data to Notify', async () => {
          await BatchNotificationsService.go(testRecipients, session, eventId)

          expect(
            NotifyClient.prototype.sendEmail.calledWith(
              '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
              'primary.user@important.com',
              {
                personalisation: {
                  periodEndDate: '31 March 2023',
                  periodStartDate: '1 April 2022',
                  returnDueDate: '28 April 2025'
                },
                reference: 'RINV-123'
              }
            )
          ).to.be.true()
        })
      }
      if (stubNotify) {
        it('correctly sends the "letter" data to Notify', async () => {
          await BatchNotificationsService.go(testRecipients, session, eventId)

          expect(
            NotifyClient.prototype.sendLetter.calledWith('4fe80aed-c5dd-44c3-9044-d0289d635019', {
              personalisation: {
                address_line_1: '1',
                address_line_2: 'Privet Drive',
                address_line_3: 'Little Whinging',
                address_line_4: 'Surrey',
                address_line_5: 'WD25 7LR',
                name: 'Mr H J Licence holder',
                periodEndDate: '31 March 2023',
                periodStartDate: '1 April 2022',
                returnDueDate: '28 April 2025'
              },
              reference: 'RINV-123'
            })
          ).to.be.true()
        })
      }
    })

    describe('when a call to "notify" is unsuccessful', () => {
      beforeEach(() => {
        testRecipients = [
          {
            ...recipients.primaryUser,
            email: 'bad@email'
          },
          {
            ...recipients.returnsAgent
          }
        ]

        _stubUnSuccessfulNotify()
      })

      it('should persist the notifications with the errors', async () => {
        await BatchNotificationsService.go(testRecipients, session, eventId)

        const result = await _getNotifications(eventId)

        expect(result).to.equal([
          // This should contain the error
          {
            id: result[0].id,
            recipient: 'bad@email',
            messageType: 'email',
            messageRef: 'returns_invitation_primary_user_email',
            personalisation: {
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              periodStartDate: '1 April 2022'
            },
            status: 'error',
            notifyError:
              '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"email_address Not a valid email address"}]}',
            licences: [recipients.primaryUser.licence_refs],
            notifyId: null,
            notifyStatus: null,
            plaintext: null,
            eventId,
            createdAt: result[0].createdAt
          },
          // notifications without errors should still work
          {
            id: result[1].id,
            recipient: 'returns.agent@important.com',
            messageType: 'email',
            messageRef: 'returns_invitation_returns_agent_email',
            personalisation: {
              periodEndDate: '31 March 2023',
              returnDueDate: '28 April 2025',
              periodStartDate: '1 April 2022'
            },
            status: 'pending',
            notifyError: null,
            licences: [recipients.returnsAgent.licence_refs],
            notifyId: result[1].notifyId,
            notifyStatus: 'created',
            plaintext: result[1].plaintext,
            eventId,
            createdAt: result[1].createdAt
          }
        ])
      })

      it('should update the "event.metadata.error"', async () => {
        await BatchNotificationsService.go(testRecipients, session, eventId)

        const updatedResult = await EventModel.query().findById(eventId)

        expect(updatedResult.metadata.error).to.equal(1)

        expect(updatedResult).to.equal({
          createdAt: event.createdAt,
          entities: null,
          id: eventId,
          issuer: 'test.user@defra.gov.uk',
          licences: null,
          metadata: {
            error: 1
          },
          referenceCode: 'RINV-123',
          status: 'start',
          subtype: 'returnsInvitation',
          type: 'notification',
          updatedAt: updatedResult.updatedAt
        })
      })
    })
  })

  describe('when the journey is "abstraction-alert"', () => {
    let licenceMonitoringStationOne
    let licenceMonitoringStationTwo

    beforeEach(async () => {
      recipients = RecipientsFixture.alertsRecipients()

      testRecipients = [...Object.values(recipients)]

      event = await EventHelper.add({
        type: 'notification',
        subtype: 'waterAbstractionAlerts',
        referenceCode,
        metadata: {}
      })

      eventId = event.id

      const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

      licenceMonitoringStationOne = abstractionAlertSessionData.licenceMonitoringStations[0]
      licenceMonitoringStationTwo = abstractionAlertSessionData.licenceMonitoringStations[1]

      const relevantLicenceMonitoringStations = [
        {
          ...licenceMonitoringStationOne,
          licence: {
            licenceRef: recipients.primaryUser.licence_refs
          }
        },
        {
          ...licenceMonitoringStationTwo,
          licence: {
            licenceRef: recipients.licenceHolder.licence_refs
          }
        }
      ]

      session = {
        ...abstractionAlertSessionData,
        alertType: 'stop',
        journey: 'abstraction-alert',
        name: 'Water abstraction alert',
        referenceCode: 'WAA-123',
        relevantLicenceMonitoringStations,
        removeLicences: [],
        returnsPeriod: 'quarterFour',
        subType: 'waterAbstractionAlerts'
      }

      _stubSuccessfulNotify({
        data: {
          id: '12345',
          content: {
            body: 'My dearest margery'
          }
        },
        status: 201,
        statusText: 'CREATED'
      })
    })

    it('should persist the notifications', async () => {
      await BatchNotificationsService.go(testRecipients, session, eventId)

      const result = await _getNotifications(eventId)

      expect(result).to.equal([
        {
          id: result[0].id,
          recipient: 'additional.contact@important.com',
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            source: '',
            licence_ref: '01/19/76/7327',
            flow_or_level: 'level',
            condition_text: '',
            threshold_unit: 'm',
            threshold_value: 1000,
            issuer_email_address: '',
            monitoring_station_name: 'Death star'
          },
          status: 'pending',
          notifyError: null,
          licences: [recipients.additionalContact.licence_refs],
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          createdAt: result[0].createdAt
        },
        {
          id: result[1].id,
          recipient: null,
          messageType: 'letter',
          messageRef: 'water_abstraction_alert_reduce_warning',
          personalisation: {
            name: 'Mr H J Licence holder',
            source: '',
            licence_ref: recipients.additionalContact.licence_refs,
            flow_or_level: 'flow',
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            condition_text: '',
            threshold_unit: 'm3/s',
            threshold_value: 100,
            issuer_email_address: '',
            monitoring_station_name: 'Death star'
          },
          status: 'pending',
          notifyError: null,
          licences: [recipients.licenceHolder.licence_refs],
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          createdAt: result[1].createdAt
        },
        {
          id: result[2].id,
          recipient: 'primary.user@important.com',
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            source: '',
            licence_ref: recipients.primaryUser.licence_refs,
            flow_or_level: 'level',
            condition_text: '',
            threshold_unit: 'm',
            threshold_value: 1000,
            issuer_email_address: '',
            monitoring_station_name: 'Death star'
          },
          status: 'pending',
          notifyError: null,
          licences: [recipients.primaryUser.licence_refs],
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          createdAt: result[2].createdAt
        }
      ])
    })
  })
})

async function _getNotifications(eventId) {
  return NotificationModel.query().where('eventId', eventId)
}

function _stubSuccessfulNotify(response) {
  if (stubNotify) {
    Sinon.stub(NotifyClient.prototype, 'sendEmail').resolves(response)
    Sinon.stub(NotifyClient.prototype, 'sendLetter').resolves(response)
  }
}

function _stubUnSuccessfulNotify() {
  if (stubNotify) {
    const emailStub = Sinon.stub(NotifyClient.prototype, 'sendEmail')
    emailStub
      .onCall(0)
      .rejects({
        status: 400,
        message: 'Request failed with status code 400',
        response: {
          data: {
            errors: [
              {
                error: 'ValidationError',
                message: 'email_address Not a valid email address'
              }
            ]
          }
        }
      })
      .onCall(1)
      .resolves({
        data: {
          id: '12345',
          content: {
            body: 'My dearest margery'
          }
        },
        status: 201,
        statusText: 'CREATED'
      })
  }
}
