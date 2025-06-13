'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')

// Thing under test
const CleanEmptyVoidReturnLogsService = require('../../../../app/services/jobs/clean/clean-empty-void-return-logs.service.js')

describe('Jobs - Clean - Clean Empty Void Return Logs service', () => {
  let returnLog

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the clean is successful', () => {
    describe('and there is a void return without a submission', () => {
      describe('and it was not marked as "received" before being voided', () => {
        beforeEach(async () => {
          returnLog = await ReturnLogHelper.add({ status: 'void' })
        })

        it('removes the return log', async () => {
          await CleanEmptyVoidReturnLogsService.go()

          const results = await ReturnLogModel.query().whereIn('id', [returnLog.id])

          expect(results).to.have.length(0)
        })
      })

      describe('but it was marked as "received" before being voided', () => {
        beforeEach(async () => {
          returnLog = await ReturnLogHelper.add({ status: 'void', receivedDate: new Date() })
        })

        it('does not remove the return log', async () => {
          await CleanEmptyVoidReturnLogsService.go()

          const results = await ReturnLogModel.query().whereIn('id', [returnLog.id])

          expect(results).to.have.length(1)
        })
      })
    })

    describe('when there is a void return with a submission', () => {
      beforeEach(async () => {
        returnLog = await ReturnLogHelper.add({ status: 'void' })
        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
      })

      it('does not remove the return log', async () => {
        await CleanEmptyVoidReturnLogsService.go()

        const results = await ReturnLogModel.query().whereIn('id', [returnLog.id])

        expect(results).to.have.length(1)
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      Sinon.stub(ReturnLogModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        where: Sinon.stub().returnsThis(),
        whereNotNull: Sinon.stub().returnsThis(),
        whereNotExists: Sinon.stub().rejects()
      })
    })

    it('throws an error', async () => {
      await expect(CleanEmptyVoidReturnLogsService.go()).to.reject()
    })
  })
})
