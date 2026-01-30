'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixtures.js')
const { futureDueDate } = require('../../../../app/presenters/notices/base.presenter.js')
const { formatDateObjectToISO } = require('../../../../app/lib/dates.lib.js')

// Thing under test
const CreateNoticePresenter = require('../../../../app/presenters/notices/setup/create-notice.presenter.js')

describe('Notices - Setup - Create Notice presenter', () => {
  const issuer = 'hello@world.com'

  let recipients
  let session

  describe('when the journey is not for "alerts"', () => {
    beforeEach(() => {
      const fixtureData = RecipientsFixture.recipients()

      recipients = [
        fixtureData.primaryUser,
        fixtureData.returnsAgent,
        fixtureData.licenceHolder,
        fixtureData.returnsTo,
        fixtureData.licenceHolderWithMultipleLicences
      ]

      session = {
        returnsPeriod: 'quarterFour',
        removeLicences: [],
        journey: 'invitations',
        referenceCode: 'RINV-123',
        determinedReturnsPeriod: {
          dueDate: new Date(`2025-07-28`),
          endDate: new Date(`2025-06-30`),
          startDate: new Date(`2025-04-01`),
          summer: 'true'
        },
        subType: 'returnInvitation',
        name: 'Returns: invitation'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateNoticePresenter.go(session, recipients, issuer)

      expect(result).to.equal({
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
        const result = CreateNoticePresenter.go(session, recipients, issuer)

        expect(result.licences).to.equal([
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
          const result = CreateNoticePresenter.go(session, recipients, issuer)

          expect(result.metadata.name).to.equal('Returns: invitation')
        })
      })

      describe('the "options.excludeLicences" property', () => {
        describe('when there licences excluded from the recipients list', () => {
          beforeEach(() => {
            session.removeLicences = ['123', '456']
          })

          it('correctly returns the exclude licences', () => {
            const result = CreateNoticePresenter.go(session, recipients, issuer)

            expect(result.metadata.options.excludeLicences).to.equal(['123', '456'])
          })
        })

        describe('when there are no licences excluded from the recipients list', () => {
          beforeEach(() => {
            session.removeLicences = []
          })

          it('correctly returns the exclude licences', () => {
            const result = CreateNoticePresenter.go(session, recipients, issuer)

            expect(result.metadata.options.excludeLicences).to.equal([])
          })
        })
      })

      describe('the "recipients" property', () => {
        beforeEach(() => {
          session.recipients = [...Object.values(recipients)]
        })

        it('correctly returns the length of recipients', () => {
          const result = CreateNoticePresenter.go(session, recipients, issuer)

          expect(result.metadata.recipients).to.equal(5)
        })
      })

      describe('the "returnCycle" property', () => {
        describe('when there are "determinedReturnsPeriod"', () => {
          beforeEach(() => {
            session.determinedReturnsPeriod = {
              dueDate: new Date(`2025-07-28`),
              endDate: new Date(`2025-06-30`),
              startDate: new Date(`2025-04-01`),
              summer: 'true'
            }
          })

          it('correctly returns the return cycle', () => {
            const result = CreateNoticePresenter.go(session, recipients, issuer)

            expect(result.metadata.returnCycle).to.equal({
              dueDate: '2025-07-28',
              endDate: '2025-06-30',
              isSummer: true,
              startDate: '2025-04-01'
            })
          })
        })

        describe('when there are NO "determinedReturnsPeriod"', () => {
          beforeEach(() => {
            delete session.determinedReturnsPeriod
          })

          it('correctly returns the return cycle', () => {
            const result = CreateNoticePresenter.go(session, recipients, issuer)

            expect(result.metadata.returnCycle).to.equal({
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
        const result = CreateNoticePresenter.go(session, recipients, issuer)

        expect(result.subtype).to.equal('returnInvitation')
      })
    })
  })

  describe('when the journey is for "alerts', () => {
    beforeEach(() => {
      const fixtureData = RecipientsFixture.alertsRecipients()

      recipients = [fixtureData.additionalContact, fixtureData.licenceHolder, fixtureData.primaryUser]

      session = {
        alertType: 'stop',
        journey: 'alerts',
        monitoringStationId: '123',
        name: 'Water abstraction alert',
        referenceCode: 'WAA-123',
        subType: 'waterAbstractionAlerts'
      }
    })

    it('correctly presents the data', () => {
      const result = CreateNoticePresenter.go(session, recipients, issuer)

      expect(result).to.equal({
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
        const result = CreateNoticePresenter.go(session, recipients, issuer)

        expect(result.licences).to.equal([
          ...recipients[0].licence_refs,
          ...recipients[1].licence_refs,
          ...recipients[2].licence_refs
        ])
      })
    })

    describe('the "metadata" property', () => {
      describe('the "name" property', () => {
        it('correctly returns the "name"', () => {
          const result = CreateNoticePresenter.go(session, recipients, issuer)

          expect(result.metadata.name).to.equal('Water abstraction alert')
        })
      })

      describe('the "recipients" property', () => {
        beforeEach(() => {
          session.recipients = [...Object.values(recipients)]
        })

        it('correctly returns the length of recipients', () => {
          const result = CreateNoticePresenter.go(session, recipients, issuer)

          expect(result.metadata.recipients).to.equal(3)
        })
      })

      describe('the "options" property', () => {
        describe('the "sendingAlertType" property', () => {
          it('return the sessions value', () => {
            const result = CreateNoticePresenter.go(session, recipients, issuer)

            expect(result.metadata.options.sendingAlertType).to.equal('stop')
          })
        })

        describe('the "monitoringStationId" property', () => {
          it('correctly returns the length of recipients', () => {
            const result = CreateNoticePresenter.go(session, recipients, issuer)

            expect(result.metadata.options.monitoringStationId).to.equal('123')
          })
        })
      })
    })

    describe('the "subType" property', () => {
      it('correctly returns the "subType"', () => {
        const result = CreateNoticePresenter.go(session, recipients, issuer)

        expect(result.subtype).to.equal('waterAbstractionAlerts')
      })
    })
  })
})
