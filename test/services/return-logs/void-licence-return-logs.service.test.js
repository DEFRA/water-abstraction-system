'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../support/database.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')

// Thing under test
const VoidLicenceReturnLogsService = require('../../../app/services/return-logs/void-licence-return-logs.service.js')

describe('Return Logs - Void Licence Return Logs service', () => {
  let reissuedReturnLogIds

  let changeDate
  let licenceRef
  let returnCycleId
  let returnReference

  let differentReturnCycleReturnLog
  let endsBeforeTheChangeDateReturnLog
  let endsAfterTheChangeDateReturnLog
  let existingReturnLog
  let reissuedReturnLog1
  let reissuedReturnLog2

  after(async () => {
    await closeConnection()
  })

  describe('when we are reissuing return logs because a licence end date has changed', () => {
    before(async () => {
      changeDate = new Date('2022-12-31')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has one return log on a different return cycle [A]', () => {
      before(async () => {
        differentReturnCycleReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-10-31'),
          licenceRef,
          returnCycleId: generateUUID(),
          startDate: new Date('2022-11-01')
        })
      })

      describe('and one return log for the matching return cycle that ends before the "change date" [B]', () => {
        before(async () => {
          endsBeforeTheChangeDateReturnLog = await ReturnLogHelper.add({
            endDate: new Date('2022-09-30'),
            licenceRef,
            returnCycleId
          })
        })

        describe('and one return log for the matching return cycle that is after the "change date" [C]', () => {
          before(async () => {
            returnReference = ReturnRequirementHelper.generateLegacyId()
            endsAfterTheChangeDateReturnLog = await ReturnLogHelper.add({
              endDate: new Date('2023-03-31'),
              licenceRef,
              returnCycleId,
              returnReference
            })
          })

          describe('and now the reissued return log [D]', () => {
            before(async () => {
              reissuedReturnLog1 = await ReturnLogHelper.add({
                endDate: changeDate,
                licenceRef,
                returnCycleId,
                returnReference
              })

              reissuedReturnLogIds = [reissuedReturnLog1.id]
            })

            it('voids only the return log [C] that matches the cycle and ends after the "change date"', async () => {
              await VoidLicenceReturnLogsService.go(reissuedReturnLogIds, licenceRef, returnCycleId, changeDate)

              let returnLogBeingChecked

              returnLogBeingChecked = await differentReturnCycleReturnLog.$query()
              expect(returnLogBeingChecked.status).to.equal('due')

              returnLogBeingChecked = await endsBeforeTheChangeDateReturnLog.$query()
              expect(returnLogBeingChecked.status).to.equal('due')

              returnLogBeingChecked = await endsAfterTheChangeDateReturnLog.$query()
              expect(returnLogBeingChecked.status).to.equal('void')

              returnLogBeingChecked = await reissuedReturnLog1.$query()
              expect(reissuedReturnLog1.status).to.equal('due')
            })
          })
        })
      })
    })
  })

  describe('when we are reissuing return logs because a return version has been superseded', () => {
    before(async () => {
      changeDate = new Date('2022-04-01')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has an existing return log for the superseded return version [A]', () => {
      before(async () => {
        existingReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-03-31'),
          licenceRef,
          returnCycleId,
          startDate: new Date('2022-04-01')
        })
      })

      describe('and now the reissued return log [B]', () => {
        before(async () => {
          returnReference = ReturnRequirementHelper.generateLegacyId()
          reissuedReturnLog1 = await ReturnLogHelper.add({
            endDate: new Date('2023-03-31'),
            licenceRef,
            returnCycleId,
            returnReference,
            startDate: changeDate
          })

          reissuedReturnLogIds = [reissuedReturnLog1.id]
        })

        it('voids only the existing return log [A]', async () => {
          await VoidLicenceReturnLogsService.go(reissuedReturnLogIds, licenceRef, returnCycleId, changeDate)

          let returnLogBeingChecked

          returnLogBeingChecked = await existingReturnLog.$query()
          expect(returnLogBeingChecked.status).to.equal('void')

          returnLogBeingChecked = await reissuedReturnLog1.$query()
          expect(returnLogBeingChecked.status).to.equal('due')
        })
      })
    })
  })

  describe('when we are reissuing return logs because a return version has been added', () => {
    before(async () => {
      changeDate = new Date('2022-09-01')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has an existing return log for the existing return version [A]', () => {
      before(async () => {
        returnReference = ReturnRequirementHelper.generateLegacyId()

        existingReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-03-31'),
          licenceRef,
          returnCycleId,
          startDate: new Date('2022-04-01')
        })
      })

      describe('and now the reissued return logs [B]', () => {
        before(async () => {
          reissuedReturnLog1 = await ReturnLogHelper.add({
            endDate: new Date('2022-08-31'),
            licenceRef,
            returnCycleId,
            returnReference,
            startDate: new Date('2022-04-01')
          })

          reissuedReturnLog2 = await ReturnLogHelper.add({
            endDate: new Date('2023-03-31'),
            licenceRef,
            returnCycleId,
            startDate: changeDate
          })

          reissuedReturnLogIds = [reissuedReturnLog1.id, reissuedReturnLog2.id]
        })

        it('voids only the existing return log [A]', async () => {
          await VoidLicenceReturnLogsService.go(reissuedReturnLogIds, licenceRef, returnCycleId, changeDate)

          let returnLogBeingChecked

          returnLogBeingChecked = await existingReturnLog.$query()
          expect(returnLogBeingChecked.status).to.equal('void')

          returnLogBeingChecked = await reissuedReturnLog1.$query()
          expect(returnLogBeingChecked.status).to.equal('due')

          returnLogBeingChecked = await reissuedReturnLog2.$query()
          expect(returnLogBeingChecked.status).to.equal('due')
        })
      })
    })
  })
})
