'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const NotificationsPresenter = require('../../../../app/presenters/notices/setup/notifications.presenter.js')

describe('Notices - Setup - Notifications Presenter', () => {
  const eventId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let clock
  let determinedReturnsPeriod
  let recipients
  let session
  let testRecipients

  beforeEach(() => {
    determinedReturnsPeriod = {
      dueDate: new Date('2025-04-28'),
      endDate: new Date('2025-03-31'),
      name: 'quarterFour',
      startDate: new Date('2025-01-01'),
      summer: 'false'
    }

    recipients = RecipientsFixture.recipients()

    testRecipients = [...Object.values(recipients)]

    session = {
      determinedReturnsPeriod,
      journey: 'standard',
      noticeType: 'invitations'
    }

    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly transform the recipients into notifications', () => {
    const result = NotificationsPresenter.go(testRecipients, session, eventId)

    const [firstMultiple, secondMultiple] = recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')

    expect(result).to.equal([
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId,
        licences: [recipients.primaryUser.licence_refs],
        messageRef: 'returns_invitation_primary_user_email',
        messageType: 'email',
        personalisation: {
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: '28 April 2025'
        },
        recipient: 'primary.user@important.com',
        status: 'pending',
        templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId,
        licences: [recipients.returnsAgent.licence_refs],
        messageRef: 'returns_invitation_returns_agent_email',
        messageType: 'email',
        personalisation: {
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: '28 April 2025'
        },
        recipient: 'returns.agent@important.com',
        status: 'pending',
        templateId: '41c45bd4-8225-4d7e-a175-b48b613b5510'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId,
        licences: [recipients.licenceHolder.licence_refs],
        messageRef: 'returns_invitation_licence_holder_letter',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Licence holder',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Mr H J Licence holder',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: '28 April 2025'
        },
        status: 'pending',
        templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId,
        licences: [recipients.returnsTo.licence_refs],
        messageRef: 'returns_invitation_returns_to_letter',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Returns to',
          address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
          address_line_3: '2',
          address_line_4: 'Privet Drive',
          address_line_5: 'Little Whinging',
          address_line_6: 'Surrey',
          name: 'Mr H J Returns to',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: '28 April 2025'
        },
        status: 'pending',
        templateId: '0e535549-99a2-44a9-84a7-589b12d00879'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId,
        licences: [firstMultiple, secondMultiple],
        messageRef: 'returns_invitation_licence_holder_letter',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Licence holder with multiple licences',
          address_line_2: '3',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          name: 'Mr H J Licence holder with multiple licences',
          periodEndDate: '31 March 2025',
          periodStartDate: '1 January 2025',
          returnDueDate: '28 April 2025'
        },
        status: 'pending',
        templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
      }
    ])
  })

  describe('when the journey is for "standard"', () => {
    describe('when the "noticeType" is for "invitations"', () => {
      beforeEach(() => {
        session.noticeType = 'invitations'
      })

      describe('when the notifications is an email', () => {
        describe('and the "contact_type" is for a "Primary user"', () => {
          beforeEach(() => {
            testRecipients = [recipients.primaryUser]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_invitation_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns Agent"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsAgent]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsAgent.licence_refs],
                messageRef: 'returns_invitation_returns_agent_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                recipient: 'returns.agent@important.com',
                status: 'pending',
                templateId: '41c45bd4-8225-4d7e-a175-b48b613b5510'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.primaryUser, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_invitation_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
              }
            ])
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the "contact_type" is for a "Licence Holder"', () => {
          beforeEach(() => {
            testRecipients = [recipients.licenceHolder]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_invitation_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                status: 'pending',
                templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns To"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsTo]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsTo.licence_refs],
                messageRef: 'returns_invitation_returns_to_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Returns to',
                  address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                  address_line_3: '2',
                  address_line_4: 'Privet Drive',
                  address_line_5: 'Little Whinging',
                  address_line_6: 'Surrey',
                  name: 'Mr H J Returns to',
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                status: 'pending',
                templateId: '0e535549-99a2-44a9-84a7-589b12d00879'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.licenceHolder, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_invitation_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                status: 'pending',
                templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
              }
            ])
          })
        })
      })
    })

    describe('when the "noticeType" is for "reminders"', () => {
      beforeEach(() => {
        session.noticeType = 'reminders'
      })

      describe('when the notifications is an email', () => {
        describe('and the "contact_type" is for a "Primary user"', () => {
          beforeEach(() => {
            testRecipients = [recipients.primaryUser]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_reminder_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns Agent"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsAgent]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsAgent.licence_refs],
                messageRef: 'returns_reminder_returns_agent_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                recipient: 'returns.agent@important.com',
                status: 'pending',
                templateId: '038e1807-d1b5-4f09-a5a6-d7eee9030a7a'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.primaryUser, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_reminder_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836'
              }
            ])
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the "contact_type" is for a "Licence Holder"', () => {
          beforeEach(() => {
            testRecipients = [recipients.licenceHolder]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_reminder_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                status: 'pending',
                templateId: 'c01c808b-094b-4a3a-ab9f-a6e86bad36ba'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns To"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsTo]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsTo.licence_refs],
                messageRef: 'returns_reminder_returns_to_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Returns to',
                  address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                  address_line_3: '2',
                  address_line_4: 'Privet Drive',
                  address_line_5: 'Little Whinging',
                  address_line_6: 'Surrey',
                  name: 'Mr H J Returns to',
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                status: 'pending',
                templateId: 'e9f132c7-a550-4e18-a5c1-78375f07aa2d'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.licenceHolder, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_reminder_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '31 March 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                status: 'pending',
                templateId: 'c01c808b-094b-4a3a-ab9f-a6e86bad36ba'
              }
            ])
          })
        })
      })
    })
  })

  describe('when the journey is for "adhoc"', () => {
    describe('when the "noticeType" is for "invitations"', () => {
      beforeEach(() => {
        session.journey = 'adhoc'
        session.noticeType = 'invitations'

        delete session.determinedReturnsPeriod
      })

      describe('when the notifications is an email', () => {
        describe('and the "contact_type" is for a "Primary user"', () => {
          beforeEach(() => {
            testRecipients = [recipients.primaryUser]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_invitation_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '29 January 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: '7bb89469-1dbc-458a-9526-fad8ab71285f'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns Agent"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsAgent]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsAgent.licence_refs],
                messageRef: 'returns_invitation_returns_agent_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '29 January 2025'
                },
                recipient: 'returns.agent@important.com',
                status: 'pending',
                templateId: 'cbc4efe2-f3b5-4642-8f6d-3532df73ee94'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.primaryUser, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_invitation_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '29 January 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: '7bb89469-1dbc-458a-9526-fad8ab71285f'
              }
            ])
          })
        })

        describe('the "returnDueDate" property', () => {
          beforeEach(() => {
            testRecipients = [recipients.primaryUser]
          })

          it('should be 28 days past the current date', () => {
            const [result] = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result.personalisation.returnDueDate).to.equal('29 January 2025')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the "contact_type" is for a "Licence Holder"', () => {
          beforeEach(() => {
            testRecipients = [recipients.licenceHolder]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_invitation_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  returnDueDate: '30 January 2025',
                  periodEndDate: null,
                  periodStartDate: null
                },
                status: 'pending',
                templateId: '4b47cf1c-043c-4a0c-8659-5be06cb2b860'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns To"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsTo]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsTo.licence_refs],
                messageRef: 'returns_invitation_returns_to_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Returns to',
                  address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                  address_line_3: '2',
                  address_line_4: 'Privet Drive',
                  address_line_5: 'Little Whinging',
                  address_line_6: 'Surrey',
                  name: 'Mr H J Returns to',
                  returnDueDate: '30 January 2025',
                  periodEndDate: null,
                  periodStartDate: null
                },
                status: 'pending',
                templateId: '73b4c395-4423-4976-8ab4-c82e2cb6beee'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.licenceHolder, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_invitation_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '30 January 2025'
                },
                status: 'pending',
                templateId: '4b47cf1c-043c-4a0c-8659-5be06cb2b860'
              }
            ])
          })
        })

        describe('the "returnDueDate" property', () => {
          beforeEach(() => {
            testRecipients = [recipients.licenceHolder]
          })

          it('should be 29 days past the current date', () => {
            const [result] = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result.personalisation.returnDueDate).to.equal('30 January 2025')
          })
        })
      })
    })

    describe('when the "noticeType" is for "reminders"', () => {
      beforeEach(() => {
        session.journey = 'adhoc'
        session.noticeType = 'reminders'

        delete session.determinedReturnsPeriod
      })

      describe('when the notifications is an email', () => {
        describe('and the "contact_type" is for a "Primary user"', () => {
          beforeEach(() => {
            testRecipients = [recipients.primaryUser]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_reminder_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '29 January 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: '87dceeb3-aa2b-4ff5-aff9-97755a71532b'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns Agent"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsAgent]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsAgent.licence_refs],
                messageRef: 'returns_reminder_returns_agent_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '29 January 2025'
                },
                recipient: 'returns.agent@important.com',
                status: 'pending',
                templateId: 'c8076bbd-7d93-4743-81b3-755a5c5f1d50'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.primaryUser, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.primaryUser.licence_refs],
                messageRef: 'returns_reminder_primary_user_email',
                messageType: 'email',
                personalisation: {
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '29 January 2025'
                },
                recipient: 'primary.user@important.com',
                status: 'pending',
                templateId: '87dceeb3-aa2b-4ff5-aff9-97755a71532b'
              }
            ])
          })
        })

        describe('the "returnDueDate" property', () => {
          beforeEach(() => {
            testRecipients = [recipients.primaryUser]
          })

          it('should be 28 days past the current date', () => {
            const [result] = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result.personalisation.returnDueDate).to.equal('29 January 2025')
          })
        })
      })

      describe('when the notifications is a letter', () => {
        describe('and the "contact_type" is for a "Licence Holder"', () => {
          beforeEach(() => {
            testRecipients = [recipients.licenceHolder]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_reminder_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  returnDueDate: '30 January 2025',
                  periodEndDate: null,
                  periodStartDate: null
                },
                status: 'pending',
                templateId: '62224316-35c4-4b02-98c2-81332817f3dc'
              }
            ])
          })
        })

        describe('and the "contact_type" is for a "Returns To"', () => {
          beforeEach(() => {
            testRecipients = [recipients.returnsTo]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.returnsTo.licence_refs],
                messageRef: 'returns_reminder_returns_to_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Returns to',
                  address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                  address_line_3: '2',
                  address_line_4: 'Privet Drive',
                  address_line_5: 'Little Whinging',
                  address_line_6: 'Surrey',
                  name: 'Mr H J Returns to',
                  returnDueDate: '30 January 2025',
                  periodEndDate: null,
                  periodStartDate: null
                },
                status: 'pending',
                templateId: 'eca3e1d0-a8a6-4eb1-b166-23891fe3a9e5'
              }
            ])
          })
        })

        describe('and the "contact_type" is for "both"', () => {
          beforeEach(() => {
            testRecipients = [{ ...recipients.licenceHolder, contact_type: 'both' }]
          })

          it('correctly transforms the recipient to a notification', () => {
            const result = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result).to.equal([
              {
                createdAt: '2025-01-01T00:00:00.000Z',
                eventId,
                licences: [recipients.licenceHolder.licence_refs],
                messageRef: 'returns_reminder_licence_holder_letter',
                messageType: 'letter',
                personalisation: {
                  address_line_1: 'Mr H J Licence holder',
                  address_line_2: '1',
                  address_line_3: 'Privet Drive',
                  address_line_4: 'Little Whinging',
                  address_line_5: 'Surrey',
                  address_line_6: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: null,
                  periodStartDate: null,
                  returnDueDate: '30 January 2025'
                },
                status: 'pending',
                templateId: '62224316-35c4-4b02-98c2-81332817f3dc'
              }
            ])
          })
        })

        describe('the "returnDueDate" property', () => {
          beforeEach(() => {
            testRecipients = [recipients.licenceHolder]
          })

          it('should be 29 days past the current date', () => {
            const [result] = NotificationsPresenter.go(testRecipients, session, eventId)

            expect(result.personalisation.returnDueDate).to.equal('30 January 2025')
          })
        })
      })
    })
  })
})
