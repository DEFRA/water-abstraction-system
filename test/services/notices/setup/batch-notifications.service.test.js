'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { notifyTemplates } = require('../../../../app/lib/notify-templates.lib.js')

// Things we need to stub
const CreateEmailRequest = require('../../../../app/requests/notify/create-email.request.js')
const CreatePrecompiledFileRequest = require('../../../../app/requests/notify/create-precompiled-file.request.js')
const DetermineReturnFormsService = require('../../../../app/services/notices/setup/determine-return-forms.service.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const NotifyLetterRequest = require('../../../../app/requests/notify/create-letter.request.js')

// Thing under test
const BatchNotificationsService = require('../../../../app/services/notices/setup/batch-notifications.service.js')

describe('Notices - Setup - Batch Notifications service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100

  let event
  let recipients
  let recipientsFixture
  let reference
  let session

  beforeEach(async () => {
    // By setting the batch size to 1 we can prove that all the batches are run, as we should have all the notifications
    // still saved in the database regardless of batch size
    Sinon.stub(NotifyConfig, 'batchSize').value(1)
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly, we do not want increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when sending return invitations or reminders', () => {
    beforeEach(async () => {
      reference = generateReferenceCode()

      recipientsFixture = RecipientsFixture.recipients()
      recipients = [...Object.values(recipientsFixture)]

      event = await EventHelper.add({
        metadata: {},
        licences: _licences(recipients),
        referenceCode: reference,
        status: 'completed',
        subtype: 'returnInvitation',
        type: 'notification'
      })

      session = {
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: '2025-04-28',
          endDate: '2023-03-31',
          summer: 'false',
          startDate: '2022-04-01'
        },
        journey: 'standard',
        noticeType: 'invitations',
        referenceCode: reference
      }
    })

    describe('that contains letters and emails', () => {
      describe('and the requests to Notify in the batch are a mix of successes and failures', () => {
        beforeEach(() => {
          Sinon.stub(CreateEmailRequest, 'send')
            .onCall(0)
            .resolves({
              succeeded: false,
              response: {
                statusCode: 400,
                body: {
                  errors: [
                    {
                      error: 'ValidationError',
                      message: 'email_address Not a valid email address'
                    }
                  ],
                  status_code: 400
                }
              }
            })
            .onCall(1)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  content: {
                    body: 'Dear licence holder,\r\n',
                    from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
                    one_click_unsubscribe_url: null,
                    subject: 'Submit your water abstraction returns by 28th April 2025'
                  },
                  id: '9a0a0ba0-9dc7-4322-9a68-cb370220d0c9',
                  reference,
                  scheduled_for: null,
                  template: {
                    id: notifyTemplates.standard.invitations.returnsAgentEmail,
                    uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.returnsAgentEmail}`,
                    version: 40
                  },
                  uri: 'https://api.notifications.service.gov.uk/v2/notifications/9a0a0ba0-9dc7-4322-9a68-cb370220d0c9'
                }
              }
            })

          Sinon.stub(NotifyLetterRequest, 'send')
            .onCall(0)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  content: {
                    body: 'Dear Licence holder,\r\n',
                    subject: 'Submit your water abstraction returns by 28th April 2025'
                  },
                  id: 'fff6c2a9-77fc-4553-8265-546109a45044',
                  reference,
                  scheduled_for: null,
                  template: {
                    id: notifyTemplates.standard.invitations.licenceHolderLetter,
                    uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.licenceHolderLetter}`,
                    version: 32
                  },
                  uri: 'https://api.notifications.service.gov.uk/v2/notifications/fff6c2a9-77fc-4553-8265-546109a45044'
                }
              }
            })
            .onCall(1)
            .resolves({
              succeeded: false,
              response: {
                statusCode: 400,
                body: {
                  errors: [
                    {
                      error: 'BadRequestError',
                      message: 'Missing personalisation: returnDueDate'
                    }
                  ],
                  status_code: 400
                }
              }
            })
            .onCall(2)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  content: {
                    body: 'Dear Licence holder with multiple licences,\r\n',
                    subject: 'Submit your water abstraction returns by 28th April 2025'
                  },
                  id: '997a76c7-7866-4bd3-b199-ca69eef31a41',
                  reference,
                  scheduled_for: null,
                  template: {
                    id: notifyTemplates.standard.invitations.licenceHolderLetter,
                    uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.licenceHolderLetter}`,
                    version: 32
                  },
                  uri: 'https://api.notifications.service.gov.uk/v2/notifications/997a76c7-7866-4bd3-b199-ca69eef31a41'
                }
              }
            })
        })

        it("always creates the notifications including the result of the request to Notify, and updates the Event's error count", async () => {
          await BatchNotificationsService.go(recipients, session, event.id)

          // Confirm the event is updated with the error count
          const refreshedEvent = await event.$query()

          expect(refreshedEvent).to.equal({
            id: event.id,
            referenceCode: reference,
            type: 'notification',
            subtype: 'returnInvitation',
            issuer: 'test.user@defra.gov.uk',
            licences: event.licences,
            entities: null,
            metadata: { error: 2 },
            status: 'completed',
            createdAt: event.createdAt,
            updatedAt: refreshedEvent.updatedAt
          })

          // Confirm the notifications are created and Notify request recorded as expected
          const createdNotifications = await NotificationModel.query().where('eventId', event.id)

          expect(createdNotifications).to.have.length(5)
          expect(createdNotifications[0]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: recipients[0].licence_refs.split(','),
              messageRef: 'returns_invitation_primary_user_email',
              messageType: 'email',
              plaintext: null,
              personalisation: {
                periodEndDate: '31 March 2023',
                returnDueDate: '28 April 2025',
                periodStartDate: '1 April 2022'
              },
              notifyError:
                '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"email_address Not a valid email address"}]}',
              notifyId: null,
              notifyStatus: null,
              recipient: 'primary.user@important.com',
              returnLogIds: null,
              status: 'error'
            },
            { skip: ['id', 'createdAt'] }
          )

          expect(createdNotifications[1]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: recipients[1].licence_refs.split(','),
              messageRef: 'returns_invitation_returns_agent_email',
              messageType: 'email',
              plaintext: 'Dear licence holder,\r\n',
              personalisation: {
                periodEndDate: '31 March 2023',
                returnDueDate: '28 April 2025',
                periodStartDate: '1 April 2022'
              },
              notifyError: null,
              notifyId: '9a0a0ba0-9dc7-4322-9a68-cb370220d0c9',
              notifyStatus: 'created',
              recipient: 'returns.agent@important.com',
              returnLogIds: null,
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )

          expect(createdNotifications[2]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: recipients[2].licence_refs.split(','),
              messageRef: 'returns_invitation_licence_holder_letter',
              messageType: 'letter',
              plaintext: 'Dear Licence holder,\r\n',
              personalisation: {
                name: 'Mr H J Licence holder',
                periodEndDate: '31 March 2023',
                returnDueDate: '28 April 2025',
                address_line_1: 'Mr H J Licence holder',
                address_line_2: '1',
                address_line_3: 'Privet Drive',
                address_line_4: 'Little Whinging',
                address_line_5: 'Surrey',
                address_line_6: 'WD25 7LR',
                periodStartDate: '1 April 2022'
              },
              notifyError: null,
              notifyId: 'fff6c2a9-77fc-4553-8265-546109a45044',
              notifyStatus: 'created',
              recipient: null,
              returnLogIds: null,
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )

          expect(createdNotifications[3]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: recipients[3].licence_refs.split(','),
              messageRef: 'returns_invitation_returns_to_letter',
              messageType: 'letter',
              plaintext: null,
              personalisation: {
                name: 'Mr H J Returns to',
                periodEndDate: '31 March 2023',
                returnDueDate: '28 April 2025',
                address_line_1: 'Mr H J Returns to',
                address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                address_line_3: '2',
                address_line_4: 'Privet Drive',
                address_line_5: 'Little Whinging',
                address_line_6: 'Surrey',
                periodStartDate: '1 April 2022'
              },
              notifyError:
                '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"BadRequestError","message":"Missing personalisation: returnDueDate"}]}',
              notifyId: null,
              notifyStatus: null,
              recipient: null,
              returnLogIds: null,
              status: 'error'
            },
            { skip: ['id', 'createdAt'] }
          )

          expect(createdNotifications[4]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: recipients[4].licence_refs.split(','),
              messageRef: 'returns_invitation_licence_holder_letter',
              messageType: 'letter',
              plaintext: 'Dear Licence holder with multiple licences,\r\n',
              personalisation: {
                name: 'Mr H J Licence holder with multiple licences',
                periodEndDate: '31 March 2023',
                returnDueDate: '28 April 2025',
                address_line_1: 'Mr H J Licence holder with multiple licences',
                address_line_2: '3',
                address_line_3: 'Privet Drive',
                address_line_4: 'Little Whinging',
                address_line_5: 'Surrey',
                address_line_6: 'WD25 7LR',
                periodStartDate: '1 April 2022'
              },
              notifyError: null,
              notifyId: '997a76c7-7866-4bd3-b199-ca69eef31a41',
              notifyStatus: 'created',
              recipient: null,
              returnLogIds: null,
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )
        })
      })
    })
  })

  describe('when sending abstraction alerts', () => {
    beforeEach(async () => {
      reference = generateReferenceCode('WAA')

      recipientsFixture = RecipientsFixture.alertsRecipients()
      recipients = [...Object.values(recipientsFixture)]

      event = await EventHelper.add({
        metadata: {},
        licences: _licences(recipients),
        referenceCode: reference,
        status: 'completed',
        subtype: 'waterAbstractionAlerts',
        type: 'notification'
      })

      const licenceMonitoringStations = [
        {
          id: '4a87cf86-76ff-4059-9b74-924ab19c1367',
          notes: null,
          status: null,
          licence: {
            id: 'f9a0fdad-9608-4559-a8f1-d680fec25c9a',
            licenceRef: recipients[0].licence_refs
          },
          measureType: 'flow',
          thresholdUnit: 'Ml/d',
          thresholdGroup: 'flow-500-Ml/d',
          thresholdValue: 500,
          restrictionType: 'stop',
          statusUpdatedAt: null,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4
        },
        {
          id: 'cf52778d-bc21-46a0-87de-4643c7961309',
          notes: null,
          status: 'warning',
          licence: {
            id: '1f933cf4-f6cf-49a9-bfc7-fdf91e935c57',
            licenceRef: recipients[1].licence_refs
          },
          measureType: 'flow',
          thresholdUnit: 'Ml/d',
          thresholdGroup: 'flow-750-Ml/d',
          thresholdValue: 750,
          restrictionType: 'stop',
          statusUpdatedAt: '2025-08-14T22:47:52.981Z',
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 11
        },
        {
          id: '0cd06c03-d15a-45c6-87ac-6cfb1e2d3db6',
          notes: null,
          status: 'warning',
          licence: {
            id: '5f79267d-5e37-45c5-b783-deccf571c307',
            licenceRef: recipients[2].licence_refs
          },
          measureType: 'flow',
          thresholdUnit: 'Ml/d',
          thresholdGroup: 'flow-1000-Ml/d',
          thresholdValue: 1000,
          restrictionType: 'stop',
          statusUpdatedAt: '2025-07-09T15:56:45.979Z',
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4
        }
      ]

      session = {
        address: {
          redirectUrl: '/system/notices/setup/22dd7d17-41f1-4b56-bbdb-b7e35364bf24/add-recipient'
        },
        alertEmailAddress: 'admin-internal@wrls.gov.uk',
        alertEmailAddressType: 'username',
        alertThresholds: ['flow-1000-Ml/d', 'flow-750-Ml/d', 'flow-500-Ml/d'],
        alertType: 'warning',
        id: '22dd7d17-41f1-4b56-bbdb-b7e35364bf24',
        journey: 'alerts',
        licenceRefs: event.licences,
        licenceMonitoringStations,
        monitoringStationId: '7195f45e-6597-4771-85dc-e223cb55bc63',
        monitoringStationName: 'FRENCHAY',
        monitoringStationRiverName: '',
        name: 'Water abstraction alert',
        noticeType: 'abstractionAlerts',
        notificationType: 'Abstraction alert',
        referenceCode: reference,
        relevantLicenceMonitoringStations: [...licenceMonitoringStations],
        removedThresholds: [],
        selectedRecipients: [],
        subType: 'waterAbstractionAlerts'
      }
    })

    describe('that contains letters and emails', () => {
      describe('and the requests to Notify in the batch are a mix of successes and failures', () => {
        beforeEach(() => {
          Sinon.stub(CreateEmailRequest, 'send')
            .onCall(0)
            .resolves({
              succeeded: false,
              response: {
                statusCode: 400,
                body: {
                  errors: [
                    {
                      error: 'BadRequestError',
                      message: 'Missing personalisation: monitoring_station_name'
                    }
                  ],
                  status_code: 400
                }
              }
            })
            .onCall(1)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  content: {
                    body: 'Dear licence contact,\r\n',
                    from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
                    one_click_unsubscribe_url: null,
                    subject: 'Water abstraction alert: You may need to reduce or stop water abstraction soon'
                  },
                  id: 'a5488243-9c8d-4c2b-95df-d65f7c9a5f41',
                  reference,
                  scheduled_for: null,
                  template: {
                    id: notifyTemplates.alerts.email.reduceOrStopWarning,
                    uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.alerts.email.reduceOrStopWarning}`,
                    version: 1
                  },
                  uri: 'https://api.notifications.service.gov.uk/v2/notifications/a5488243-9c8d-4c2b-95df-d65f7c9a5f41'
                }
              }
            })

          Sinon.stub(NotifyLetterRequest, 'send')
            .onCall(0)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  content: {
                    body: 'Dear licence contact,\r\n',
                    subject: 'Water abstraction alert: You may need to reduce or stop water abstraction soon'
                  },
                  id: '797cfc1e-0699-4006-985d-10f4219a280a',
                  reference,
                  scheduled_for: null,
                  template: {
                    id: notifyTemplates.alerts.letter.reduceOrStopWarning,
                    uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.alerts.letter.reduceOrStopWarning}`,
                    version: 5
                  },
                  uri: 'https://api.notifications.service.gov.uk/v2/notifications/797cfc1e-0699-4006-985d-10f4219a280a'
                }
              }
            })
        })

        it("always creates the notifications including the result of the request to Notify, and updates the Event's error count", async () => {
          await BatchNotificationsService.go(recipients, session, event.id)

          // Confirm the event is updated with the error count
          const refreshedEvent = await event.$query()

          expect(refreshedEvent).to.equal({
            id: event.id,
            referenceCode: reference,
            type: 'notification',
            subtype: 'waterAbstractionAlerts',
            issuer: 'test.user@defra.gov.uk',
            licences: event.licences,
            entities: null,
            metadata: { error: 1 },
            status: 'completed',
            createdAt: event.createdAt,
            updatedAt: refreshedEvent.updatedAt
          })

          // Confirm the notifications are created and Notify request recorded as expected
          const createdNotifications = await NotificationModel.query().where('eventId', event.id)

          expect(createdNotifications).to.have.length(3)
          expect(createdNotifications[0]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: session.licenceMonitoringStations[0].id,
              licences: recipients[0].licence_refs.split(','),
              messageRef: 'water_abstraction_alert_stop_warning_email',
              messageType: 'email',
              plaintext: null,
              personalisation: {
                alertType: 'stop',
                condition_text: '',
                flow_or_level: 'flow',
                issuer_email_address: 'admin-internal@wrls.gov.uk',
                label: 'FRENCHAY',
                licenceGaugingStationId: '4a87cf86-76ff-4059-9b74-924ab19c1367',
                licenceId: session.licenceMonitoringStations[0].licence.id,
                licenceRef: recipients[0].licence_refs,
                monitoring_station_name: 'FRENCHAY',
                sending_alert_type: 'warning',
                source: '',
                thresholdUnit: 'Ml/d',
                thresholdValue: 500
              },
              notifyError:
                '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"BadRequestError","message":"Missing personalisation: monitoring_station_name"}]}',
              notifyId: null,
              notifyStatus: null,
              recipient: 'additional.contact@important.com',
              returnLogIds: null,
              status: 'error'
            },
            { skip: ['id', 'createdAt'] }
          )

          expect(createdNotifications[1]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: session.licenceMonitoringStations[1].id,
              licences: recipients[1].licence_refs.split(','),
              messageRef: 'water_abstraction_alert_stop_warning',
              messageType: 'letter',
              plaintext: 'Dear licence contact,\r\n',
              personalisation: {
                address_line_1: 'Mr H J Licence holder',
                address_line_2: '1',
                address_line_3: 'Privet Drive',
                address_line_4: 'Little Whinging',
                address_line_5: 'Surrey',
                address_line_6: 'WD25 7LR',
                alertType: 'stop',
                condition_text: '',
                flow_or_level: 'flow',
                issuer_email_address: 'admin-internal@wrls.gov.uk',
                label: 'FRENCHAY',
                licenceGaugingStationId: 'cf52778d-bc21-46a0-87de-4643c7961309',
                licenceId: session.licenceMonitoringStations[1].licence.id,
                licenceRef: recipients[1].licence_refs,
                monitoring_station_name: 'FRENCHAY',
                name: 'Mr H J Licence holder',
                sending_alert_type: 'warning',
                source: '',
                thresholdUnit: 'Ml/d',
                thresholdValue: 750
              },
              notifyError: null,
              notifyId: '797cfc1e-0699-4006-985d-10f4219a280a',
              notifyStatus: 'created',
              recipient: null,
              returnLogIds: null,
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )

          expect(createdNotifications[2]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: session.licenceMonitoringStations[2].id,
              licences: recipients[2].licence_refs.split(','),
              messageRef: 'water_abstraction_alert_stop_warning_email',
              messageType: 'email',
              plaintext: 'Dear licence contact,\r\n',
              personalisation: {
                alertType: 'stop',
                flow_or_level: 'flow',
                condition_text: '',
                issuer_email_address: 'admin-internal@wrls.gov.uk',
                label: 'FRENCHAY',
                licenceGaugingStationId: '0cd06c03-d15a-45c6-87ac-6cfb1e2d3db6',
                licenceId: session.licenceMonitoringStations[2].licence.id,
                licenceRef: recipients[2].licence_refs,
                monitoring_station_name: 'FRENCHAY',
                sending_alert_type: 'warning',
                source: '',
                thresholdUnit: 'Ml/d',
                thresholdValue: 1000
              },
              notifyError: null,
              notifyId: 'a5488243-9c8d-4c2b-95df-d65f7c9a5f41',
              notifyStatus: 'created',
              recipient: 'primary.user@important.com',
              returnLogIds: null,
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )
        })
      })
    })
  })

  describe('when sending return forms', () => {
    let returnId

    beforeEach(async () => {
      reference = generateReferenceCode('PRTF')

      returnId = generateUUID()
      recipientsFixture = RecipientsFixture.recipients()
      recipients = [recipientsFixture.licenceHolder]

      event = await EventHelper.add({
        metadata: {},
        licences: _licences(recipients),
        referenceCode: reference,
        status: 'completed',
        subtype: 'paperReturnForms',
        type: 'notification'
      })

      session = {
        noticeType: 'returnForms',
        referenceCode: reference
      }

      const buffer = new TextEncoder().encode('mock file').buffer

      const notification = {
        content: buffer,
        eventId: event.id,
        licences: JSON.stringify([recipientsFixture.licenceHolder.licence_refs]),
        messageRef: 'pdf.return_form',
        messageType: 'letter',
        reference,
        returnLogIds: [returnId]
      }

      Sinon.stub(DetermineReturnFormsService, 'go').resolves([
        {
          ...notification,
          personalisation: { name: 'Red 5' }
        },
        {
          ...notification,
          personalisation: { name: 'Rouge One' }
        },
        {
          ...notification,
          personalisation: { name: 'Gold leader' }
        }
      ])
    })

    describe('that contains PDF files', () => {
      describe('and the requests to Notify in the batch are a mix of successes and failures', () => {
        beforeEach(() => {
          Sinon.stub(CreatePrecompiledFileRequest, 'send')
            .onCall(0)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  id: 'fff6c2a9-77fc-4553-8265-546109a45044',
                  reference
                }
              }
            })
            .onCall(1)
            .resolves({
              succeeded: false,
              response: {
                statusCode: 400,
                body: {
                  errors: [
                    {
                      error: 'BadRequestError',
                      message: 'File is not a PDF'
                    }
                  ],
                  status_code: 400
                }
              }
            })
            .onCall(2)
            .resolves({
              succeeded: true,
              response: {
                statusCode: 200,
                body: {
                  id: '997a76c7-7866-4bd3-b199-ca69eef31a41',
                  reference
                }
              }
            })
        })

        it("always creates the notifications including the result of the request to Notify, and updates the Event's error count", async () => {
          await BatchNotificationsService.go(recipients, session, event.id)

          // Confirm the event is updated with the error count
          const refreshedEvent = await event.$query()

          expect(refreshedEvent).to.equal({
            id: event.id,
            referenceCode: reference,
            type: 'notification',
            subtype: 'paperReturnForms',
            issuer: 'test.user@defra.gov.uk',
            licences: event.licences,
            entities: null,
            metadata: { error: 1 },
            status: 'completed',
            createdAt: event.createdAt,
            updatedAt: refreshedEvent.updatedAt
          })

          // Confirm the notifications are created and Notify request recorded as expected
          const createdNotifications = await NotificationModel.query().where('eventId', event.id)

          expect(createdNotifications).to.have.length(3)

          // A successful notification
          expect(createdNotifications[0]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: [recipientsFixture.licenceHolder.licence_refs],
              messageRef: 'pdf.return_form',
              messageType: 'letter',
              notifyError: null,
              notifyId: 'fff6c2a9-77fc-4553-8265-546109a45044',
              notifyStatus: 'created',
              personalisation: {
                name: 'Red 5'
              },
              plaintext: null,
              recipient: null,
              returnLogIds: [returnId],
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )

          // An unsuccessful notification
          expect(createdNotifications[1]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: [recipientsFixture.licenceHolder.licence_refs],
              messageRef: 'pdf.return_form',
              messageType: 'letter',
              notifyError:
                '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"BadRequestError","message":"File is not a PDF"}]}',
              notifyId: null,
              notifyStatus: null,
              personalisation: {
                name: 'Rouge One'
              },
              plaintext: null,
              recipient: null,
              returnLogIds: [returnId],
              status: 'error'
            },
            { skip: ['id', 'createdAt'] }
          )

          // A successful notification
          expect(createdNotifications[2]).to.equal(
            {
              eventId: event.id,
              licenceMonitoringStationId: null,
              licences: [recipientsFixture.licenceHolder.licence_refs],
              messageRef: 'pdf.return_form',
              messageType: 'letter',
              notifyError: null,
              notifyId: '997a76c7-7866-4bd3-b199-ca69eef31a41',
              notifyStatus: 'created',
              personalisation: {
                name: 'Gold leader'
              },
              plaintext: null,
              recipient: null,
              returnLogIds: [returnId],
              status: 'pending'
            },
            { skip: ['id', 'createdAt'] }
          )
        })
      })
    })
  })
})

function _licences(recipients) {
  const allLicenceRefs = []

  recipients.forEach((recipient) => {
    const licenceRefs = recipient.licence_refs.split(',')

    allLicenceRefs.push(...licenceRefs)
  })

  const uniqueLicenceRefs = [...new Set(allLicenceRefs)]

  // Sort them alphabetically
  uniqueLicenceRefs.sort()

  return JSON.stringify(uniqueLicenceRefs)
}
