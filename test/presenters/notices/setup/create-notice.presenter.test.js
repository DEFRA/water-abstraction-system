// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { formatDateObjectToISO } from '../../../../app/lib/dates.lib.js'
import { futureDueDate } from '../../../../app/presenters/notices/base.presenter.js'

// Thing under test
import CreateNoticePresenter from '../../../../app/presenters/notices/setup/create-notice.presenter.js'

describe('Notices - Setup - Create Notice presenter', () => {
  const issuer = 'hello@world.com'

  let noticeData
  let recipients

  describe('when the journey is for "alerts', () => {
    beforeEach(() => {
      const fixtureData = RecipientsFixture.alertsRecipients()

      recipients = [fixtureData.additionalContact, fixtureData.licenceHolder, fixtureData.primaryUser]

      noticeData = {
        alertType: 'stop',
        journey: 'alerts',
        monitoringStationId: '123',
        name: 'Water abstraction alert',
        referenceCode: 'WAA-123',
        subType: 'waterAbstractionAlerts'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateNoticePresenter(noticeData, recipients, issuer)

      expect(result).toEqual({
        issuer: 'hello@world.com',
        licences: [...recipients[0].licence_refs, ...recipients[1].licence_refs, ...recipients[2].licence_refs],
        metadata: {
          name: 'Water abstraction alert',
          options: {
            monitoringStationId: '123',
            sendingAlertType: 'stop'
          },
          recipients: 3
        },
        overallStatus: 'pending',
        referenceCode: 'WAA-123',
        status: 'completed',
        statusCounts: { cancelled: 0, error: 0, pending: 3, returned: 0, sent: 0 },
        subtype: 'waterAbstractionAlerts',
        type: 'notification'
      })
    })

    describe('the "licences" property', () => {
      it('correctly return a JSON string containing an array of all licences from all recipients', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.licences).toEqual([
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs
        ])
      })
    })

    describe('the "metadata" property', () => {
      describe('the "name" property', () => {
        it('correctly returns the "name"', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.name).toEqual('Water abstraction alert')
        })
      })

      describe('the "recipients" property', () => {
        beforeEach(() => {
          noticeData.recipients = [...Object.values(recipients)]
        })

        it('correctly returns the length of recipients', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.recipients).toEqual(3)
        })
      })

      describe('the "options" property', () => {
        describe('the "sendingAlertType" property', () => {
          it('return the noticeDatas value', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.options.sendingAlertType).toEqual('stop')
          })
        })

        describe('the "monitoringStationId" property', () => {
          it('correctly returns the length of recipients', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.options.monitoringStationId).toEqual('123')
          })
        })
      })
    })

    describe('the "subType" property', () => {
      it('correctly returns the "subType"', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.subtype).toEqual('waterAbstractionAlerts')
      })
    })
  })

  describe('when the notice type is "invitations"', () => {
    beforeEach(() => {
      const fixtureData = RecipientsFixture.recipients()

      recipients = [
        fixtureData.primaryUser,
        fixtureData.returnsUser,
        fixtureData.licenceHolder,
        fixtureData.returnsTo,
        fixtureData.licenceHolderWithMultipleLicences
      ]

      noticeData = {
        returnsPeriod: 'quarterFour',
        removeLicences: [],
        journey: 'standard',
        referenceCode: 'RINV-123',
        determinedReturnsPeriod: {
          dueDate: new Date(`2025-07-28`),
          endDate: new Date(`2025-06-30`),
          startDate: new Date(`2025-04-01`),
          summer: 'true'
        },
        name: 'Returns: invitation',
        noticeType: 'invitations',
        subType: 'returnInvitation'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateNoticePresenter(noticeData, recipients, issuer)

      expect(result).toEqual({
        issuer: 'hello@world.com',
        licences: [
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs,
          ...recipients[3].licence_refs,
          ...recipients[4].licence_refs
        ],
        metadata: {
          name: 'Returns: invitation',
          options: {
            excludeLicences: []
          },
          recipients: 5,
          returnCycle: {
            dueDate: '2025-07-28',
            endDate: '2025-06-30',
            isSummer: true,
            startDate: '2025-04-01'
          }
        },
        overallStatus: 'pending',
        referenceCode: 'RINV-123',
        status: 'completed',
        statusCounts: { cancelled: 0, error: 0, pending: 5, returned: 0, sent: 0 },
        subtype: 'returnInvitation',
        type: 'notification'
      })
    })

    describe('the "licences" property', () => {
      it('correctly return a JSON string containing an array of all licences from all recipients', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.licences).toEqual([
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs,
          ...recipients[3].licence_refs,
          ...recipients[4].licence_refs
        ])
      })
    })

    describe('the "metadata" property', () => {
      describe('the "name" property', () => {
        it('correctly returns the "name"', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.name).toEqual('Returns: invitation')
        })
      })

      describe('the "options.excludeLicences" property', () => {
        describe('when there licences excluded from the recipients list', () => {
          beforeEach(() => {
            noticeData.removeLicences = ['123', '456']
          })

          it('correctly returns the exclude licences', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.options.excludeLicences).toEqual(['123', '456'])
          })
        })

        describe('when there are no licences excluded from the recipients list', () => {
          beforeEach(() => {
            noticeData.removeLicences = []
          })

          it('correctly returns the exclude licences', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.options.excludeLicences).toEqual([])
          })
        })
      })

      describe('the "recipients" property', () => {
        beforeEach(() => {
          noticeData.recipients = [...Object.values(recipients)]
        })

        it('correctly returns the length of recipients', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.recipients).toEqual(5)
        })
      })

      describe('the "returnCycle" property', () => {
        describe('when there are "determinedReturnsPeriod"', () => {
          beforeEach(() => {
            noticeData.determinedReturnsPeriod = {
              dueDate: new Date(`2025-07-28`),
              endDate: new Date(`2025-06-30`),
              startDate: new Date(`2025-04-01`),
              summer: 'true'
            }
          })

          it('correctly returns the return cycle', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.returnCycle).toEqual({
              dueDate: '2025-07-28',
              endDate: '2025-06-30',
              isSummer: true,
              startDate: '2025-04-01'
            })
          })
        })

        describe('when there are NO "determinedReturnsPeriod"', () => {
          beforeEach(() => {
            delete noticeData.determinedReturnsPeriod
          })

          it('correctly returns the return cycle', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.returnCycle).toEqual({
              dueDate: formatDateObjectToISO(futureDueDate()),
              endDate: null,
              startDate: null
            })
          })
        })
      })
    })

    describe('the "subType" property', () => {
      it('correctly returns the "subType"', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.subtype).toEqual('returnInvitation')
      })
    })
  })

  describe('when the notice type is "reminders"', () => {
    beforeEach(() => {
      const fixtureData = RecipientsFixture.recipients()

      recipients = [
        fixtureData.primaryUser,
        fixtureData.returnsUser,
        fixtureData.licenceHolder,
        fixtureData.returnsTo,
        fixtureData.licenceHolderWithMultipleLicences
      ]

      noticeData = {
        returnsPeriod: 'quarterFour',
        removeLicences: [],
        journey: 'standard',
        referenceCode: 'RREM-123',
        determinedReturnsPeriod: {
          dueDate: new Date(`2025-07-28`),
          endDate: new Date(`2025-06-30`),
          startDate: new Date(`2025-04-01`),
          summer: 'true'
        },
        name: 'Returns: reminder',
        noticeType: 'reminders',
        subType: 'returnReminder'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateNoticePresenter(noticeData, recipients, issuer)

      expect(result).toEqual({
        issuer: 'hello@world.com',
        licences: [
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs,
          ...recipients[3].licence_refs,
          ...recipients[4].licence_refs
        ],
        metadata: {
          name: 'Returns: reminder',
          options: {
            excludeLicences: []
          },
          recipients: 5,
          returnCycle: {
            dueDate: '2025-07-28',
            endDate: '2025-06-30',
            isSummer: true,
            startDate: '2025-04-01'
          }
        },
        overallStatus: 'pending',
        referenceCode: 'RREM-123',
        status: 'completed',
        statusCounts: { cancelled: 0, error: 0, pending: 5, returned: 0, sent: 0 },
        subtype: 'returnReminder',
        type: 'notification'
      })
    })

    describe('the "licences" property', () => {
      it('correctly return a JSON string containing an array of all licences from all recipients', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.licences).toEqual([
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs,
          ...recipients[3].licence_refs,
          ...recipients[4].licence_refs
        ])
      })
    })

    describe('the "metadata" property', () => {
      describe('the "name" property', () => {
        it('correctly returns the "name"', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.name).toEqual('Returns: reminder')
        })
      })

      describe('the "options.excludeLicences" property', () => {
        describe('when there licences excluded from the recipients list', () => {
          beforeEach(() => {
            noticeData.removeLicences = ['123', '456']
          })

          it('correctly returns the exclude licences', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.options.excludeLicences).toEqual(['123', '456'])
          })
        })

        describe('when there are no licences excluded from the recipients list', () => {
          beforeEach(() => {
            noticeData.removeLicences = []
          })

          it('correctly returns the exclude licences', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.options.excludeLicences).toEqual([])
          })
        })
      })

      describe('the "recipients" property', () => {
        beforeEach(() => {
          noticeData.recipients = [...Object.values(recipients)]
        })

        it('correctly returns the length of recipients', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.recipients).toEqual(5)
        })
      })

      describe('the "returnCycle" property', () => {
        describe('when there are "determinedReturnsPeriod"', () => {
          beforeEach(() => {
            noticeData.determinedReturnsPeriod = {
              dueDate: new Date(`2025-07-28`),
              endDate: new Date(`2025-06-30`),
              startDate: new Date(`2025-04-01`),
              summer: 'true'
            }
          })

          it('correctly returns the return cycle', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.returnCycle).toEqual({
              dueDate: '2025-07-28',
              endDate: '2025-06-30',
              isSummer: true,
              startDate: '2025-04-01'
            })
          })
        })

        describe('when there are NO "determinedReturnsPeriod"', () => {
          beforeEach(() => {
            delete noticeData.determinedReturnsPeriod
          })

          it('correctly returns the return cycle', () => {
            const result = CreateNoticePresenter(noticeData, recipients, issuer)

            expect(result.metadata.returnCycle).toEqual({
              dueDate: formatDateObjectToISO(futureDueDate()),
              endDate: null,
              startDate: null
            })
          })
        })
      })
    })

    describe('the "subType" property', () => {
      it('correctly returns the "subType"', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.subtype).toEqual('returnReminder')
      })
    })
  })

  describe('when the notice type is "renewalInvitations"', () => {
    beforeEach(() => {
      const fixtureData = RecipientsFixture.recipients()

      recipients = [fixtureData.primaryUser, fixtureData.licenceHolder, fixtureData.licenceHolderWithMultipleLicences]

      noticeData = {
        expiryDate: new Date('2026-04-28'),
        journey: 'standard',
        name: 'Renewals: invitation',
        noticeType: 'renewalInvitations',
        referenceCode: 'REIN-123',
        renewalDate: new Date('2026-01-28'),
        subType: 'renewalInvitation'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateNoticePresenter(noticeData, recipients, issuer)

      expect(result).toEqual({
        issuer: 'hello@world.com',
        licences: [...recipients[0].licence_refs, ...recipients[1].licence_refs, ...recipients[2].licence_refs],
        metadata: {
          expiryDate: '2026-04-28',
          name: 'Renewals: invitation',
          recipients: 3,
          renewalDate: '2026-01-28'
        },
        overallStatus: 'pending',
        referenceCode: 'REIN-123',
        status: 'completed',
        statusCounts: { cancelled: 0, error: 0, pending: 3, returned: 0, sent: 0 },
        subtype: 'renewalInvitation',
        type: 'notification'
      })
    })

    describe('the "licences" property', () => {
      it('correctly return a JSON string containing an array of all licences from all recipients', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.licences).toEqual([
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs
        ])
      })
    })

    describe('the "metadata" property', () => {
      describe('the "name" property', () => {
        it('correctly returns the "name"', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.name).toEqual('Renewals: invitation')
        })
      })

      describe('the "recipients" property', () => {
        beforeEach(() => {
          noticeData.recipients = [...Object.values(recipients)]
        })

        it('correctly returns the length of recipients', () => {
          const result = CreateNoticePresenter(noticeData, recipients, issuer)

          expect(result.metadata.recipients).toEqual(3)
        })
      })
    })

    describe('the "subType" property', () => {
      it('correctly returns the "subType"', () => {
        const result = CreateNoticePresenter(noticeData, recipients, issuer)

        expect(result.subtype).toEqual('renewalInvitation')
      })
    })
  })
})
