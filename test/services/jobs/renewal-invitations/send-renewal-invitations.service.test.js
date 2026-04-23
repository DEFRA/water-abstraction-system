'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchRenewalRecipients = require('../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js')

// Thing under test
const SendRenewalInvitations = require('../../../../app/services/jobs/renewal-invitations/send-renewal-invitations.service.js')

describe('Jobs - Renewal Invitations - Send Renewal Invitations service', () => {
  const days = '300'

  let clock
  let expiredDate
  let todayDate

  beforeEach(() => {
    Sinon.stub(FetchRenewalRecipients, 'go').resolves([])

    todayDate = new Date('2026-04-15')

    // 300 days in the future of the test date
    expiredDate = new Date('2027-02-09')

    clock = Sinon.useFakeTimers(todayDate)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when there are renewal invitations to send', () => {
    it('returns the recipients', async () => {
      const result = await SendRenewalInvitations.go(days)

      expect(result).to.equal([])
    })

    describe('the "expiredDate"', () => {
      describe('when the the day is ', () => {
        describe('"2026-04-15"', () => {
          it('call the "FetchRenewalRecipients" with an expiry date 300 days from the test date', async () => {
            await SendRenewalInvitations.go(days)

            const actualArgs = FetchRenewalRecipients.go.getCall(0).args[0]

            expect(actualArgs).to.equal(expiredDate)
          })
        })

        describe('"06/08/2027"', () => {
          beforeEach(() => {
            todayDate = new Date('2026-10-10')

            expiredDate = new Date('2027-08-06')

            clock.setSystemTime(todayDate)
          })

          it('call the "FetchRenewalRecipients" with an expiry date 300 days from the test date', async () => {
            await SendRenewalInvitations.go(days)

            const actualArgs = FetchRenewalRecipients.go.getCall(0).args[0]

            expect(actualArgs).to.equal(expiredDate)
          })
        })
      })
    })
  })
})
