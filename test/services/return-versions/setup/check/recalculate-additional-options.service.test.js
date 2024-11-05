'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const RecalculateAdditionalOptions = require('../../../../../app/services/return-versions/setup/check/recalculate-additional-options.service.js')

describe.skip('Return Versions Check - Recalculate additional options', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        licence: {
          waterUndertaker: false
        }
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      await RecalculateAdditionalOptions.go(session)

      expect(session).to.equal({})
    })
  })

  // describe('the "additionalSubmissionOptions" property', () => {
  //   describe('when the return version start date', () => {
  //     describe('has been updated', () => {
  //       beforeEach(() => {
  //         session.startDateUpdated = true
  //       })
  //
  //       describe('and the return version is for a water company', () => {
  //         beforeEach(() => {
  //           session.licence.waterUndertaker = true
  //         })
  //
  //         describe('and is not a quarterly return ', () => {
  //           beforeEach(() => {
  //             session.returnVersionStartDate = '2025-03-01'
  //           })
  //
  //           it('return the water company default', () => {
  //             const result = AdditionalSubmissionOptionsPresenter.go(session)
  //
  //             expect(result.additionalSubmissionOptions).to.equal(['multiple-upload'])
  //           })
  //         })
  //
  //         describe('and is a quarterly return', () => {
  //           beforeEach(() => {
  //             session.returnVersionStartDate = '2025-04-01'
  //           })
  //
  //           it('returns the default for water company and quarterly return', () => {
  //             const result = AdditionalSubmissionOptionsPresenter.go(session)
  //
  //             expect(result.additionalSubmissionOptions).to.equal(['multiple-upload', 'quarterly-return-submissions'])
  //           })
  //         })
  //       })
  //
  //       describe('and the return version is not for a water company', () => {
  //         beforeEach(() => {
  //           session.returnVersionStartDate = '2025-03-01'
  //           session.licence.waterUndertaker = false
  //         })
  //
  //         it('return none as the default', () => {
  //           const result = AdditionalSubmissionOptionsPresenter.go(session)
  //
  //           expect(result.additionalSubmissionOptions).to.equal(['none'])
  //         })
  //       })
  //     })
  //     describe('has not been updated', () => {
  //       beforeEach(() => {
  //         session.additionalSubmissionOptions = ['none']
  //         session.startDateUpdated = false
  //       })
  //
  //       it('uses the session data', () => {
  //         const result = AdditionalSubmissionOptionsPresenter.go(session)
  //
  //         expect(result.additionalSubmissionOptions).to.equal(['none'])
  //       })
  //     })
  //   })
  //
  //   describe('the "quarterlyReturnSubmissions" property', () => {
  //     describe('when the return version is for quarterly return submissions', () => {
  //       beforeEach(() => {
  //         session.returnVersionStartDate = '2025-04-01'
  //       })
  //
  //       it('returns "quarterlyReturnSubmissions" as true', () => {
  //         const result = AdditionalSubmissionOptionsPresenter.go(session)
  //
  //         expect(result.quarterlyReturnSubmissions).to.equal(true)
  //       })
  //     })
  //
  //     describe('when the return version is not for quarterly return submissions', () => {
  //       beforeEach(() => {
  //         session.returnVersionStartDate = '2025-03-20'
  //       })
  //
  //       it('returns "quarterlyReturnSubmissions" as true', () => {
  //         const result = AdditionalSubmissionOptionsPresenter.go(session)
  //
  //         expect(result.quarterlyReturnSubmissions).to.equal(false)
  //       })
  //     })
  //   })
  // })
})
