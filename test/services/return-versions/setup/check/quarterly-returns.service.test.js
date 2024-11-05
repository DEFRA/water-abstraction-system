'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../../app/models/session.model.js')

// Thing under test
const QuarterlyReturnsService = require('../../../../../app/services/return-versions/setup/check/quarterly-returns.service.js')

describe('Return Versions Setup - Quarterly Return service', () => {
  const quarterlyReturnDate = '2025-04-01'
  const beforeQuarterlyReturnDate = '2024-03-01'

  let session

  describe('the "additionalSubmissionOptions" property', () => {
    describe('when the return version start date has changed', () => {
      describe('and the licence is for a water company', () => {
        describe('and it is a quarterly return', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({
              data: {
                licence: {
                  waterUndertaker: true
                },
                additionalSubmissionOptions: ['none'],
                returnVersionStartDate: quarterlyReturnDate,
                startDateUpdated: true
              }
            })

            session = await SessionModel.query().findById(session.id)
          })

          it('updates the session record for "additionalSubmissionOptions" to the default data', async () => {
            await QuarterlyReturnsService.go(session)

            const refreshedSession = await session.$query()

            expect(refreshedSession.additionalSubmissionOptions).to.equal(
              ['multiple-upload', 'quarterly-return-submissions'])
          })
        })

        describe('and it is not a quarterly return', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({
              data: {
                licence: {
                  waterUndertaker: true
                },
                returnVersionStartDate: beforeQuarterlyReturnDate,
                startDateUpdated: true
              }
            })

            session = await SessionModel.query().findById(session.id)
          })

          it('updates the session record for "additionalSubmissionOptions" to the default data', async () => {
            await QuarterlyReturnsService.go(session)

            const refreshedSession = await session.$query()

            expect(refreshedSession.additionalSubmissionOptions).to.equal(['multiple-upload'])
          })
        })
      })

      describe('and the licence is not for a water company', () => {
        describe('and it is a quarterly return', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({
              data: {
                licence: {
                  waterUndertaker: false
                },
                additionalSubmissionOptions: ['none'],
                returnVersionStartDate: quarterlyReturnDate,
                startDateUpdated: true
              }
            })

            session = await SessionModel.query().findById(session.id)
          })

          it('updates the session record for "additionalSubmissionOptions" to be empty', async () => {
            await QuarterlyReturnsService.go(session)

            const refreshedSession = await session.$query()

            expect(refreshedSession.additionalSubmissionOptions).to.equal([])
          })
        })

        describe('and it is not a quarterly return', () => {
          beforeEach(async () => {
            session = await SessionHelper.add({
              data: {
                licence: {
                  waterUndertaker: false
                },
                returnVersionStartDate: beforeQuarterlyReturnDate,
                startDateUpdated: true
              }
            })

            session = await SessionModel.query().findById(session.id)
          })

          it('updates the session record for "additionalSubmissionOptions" to be empty', async () => {
            await QuarterlyReturnsService.go(session)

            const refreshedSession = await session.$query()

            expect(refreshedSession.additionalSubmissionOptions).to.equal([])
          })
        })
      })
    })

    describe('when the return version start date has not changed', () => {
      describe('and there is existing session data', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              licence: {
                waterUndertaker: false
              },
              additionalSubmissionOptions: ['none'],
              returnVersionStartDate: quarterlyReturnDate,
              startDateUpdated: false
            }
          })

          session = await SessionModel.query().findById(session.id)
        })

        it('updates the session record for "additionalSubmissionOptions" to the session data', async () => {
          await QuarterlyReturnsService.go(session)

          const refreshedSession = await session.$query()

          expect(refreshedSession.additionalSubmissionOptions).to.equal(['none'])
        })
      })

      describe('and there is no existing session data', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              licence: {
                waterUndertaker: false
              },
              returnVersionStartDate: quarterlyReturnDate,
              startDateUpdated: false
            }
          })

          session = await SessionModel.query().findById(session.id)
        })

        it('updates the session record for "additionalSubmissionOptions" to the default', async () => {
          await QuarterlyReturnsService.go(session)

          const refreshedSession = await session.$query()

          expect(refreshedSession.additionalSubmissionOptions).to.equal([])
        })
      })
    })
  })

  describe('the "quarterlyReturnSubmissions" property', () => {
    describe('when the return version start date', () => {
      describe('is a quarterly return', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              licence: {
                waterUndertaker: false
              },
              returnVersionStartDate: quarterlyReturnDate
            }
          })

          session = await SessionModel.query().findById(session.id)
        })

        it('updates the session record to indicate quarterlyReturnSubmissions', async () => {
          await QuarterlyReturnsService.go(session)

          const refreshedSession = await session.$query()

          expect(refreshedSession.quarterlyReturnSubmissions).to.be.true()
        })
      })

      describe('is not a quarterly return', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              licence: {
                waterUndertaker: false
              },
              returnVersionStartDate: beforeQuarterlyReturnDate
            }
          })

          session = await SessionModel.query().findById(session.id)
        })

        it('updates the session record to indicate "quarterlyReturnSubmissions"', async () => {
          await QuarterlyReturnsService.go(session)

          const refreshedSession = await session.$query()

          expect(refreshedSession.quarterlyReturnSubmissions).to.be.false()
        })
      })
    })
  })

  describe('when the session is saved', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: {
          licence: {
            waterUndertaker: false
          },
          returnVersionStartDate: quarterlyReturnDate
        }
      })

      session = await SessionModel.query().findById(session.id)
    })

    it('updates the session record to always set "startDateUpdated" is false', async () => {
      await QuarterlyReturnsService.go(session)

      const refreshedSession = await session.$query()

      expect(refreshedSession.startDateUpdated).to.be.false()
    })
  })
})
