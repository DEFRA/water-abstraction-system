// Test helpers
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import * as ReturnRequirementHelper from '../../support/helpers/return-requirement.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import VoidLicenceReturnLogsService from '../../../app/services/return-logs/void-licence-return-logs.service.js'

describe('Return Logs - Void Licence Return Logs service', () => {
  let reissuedReturnIds

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

  describe('when we are reissuing return logs because a licence end date has been added', () => {
    beforeAll(async () => {
      changeDate = new Date('2022-12-31')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has one return log on a different return cycle [A]', () => {
      beforeAll(async () => {
        differentReturnCycleReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-10-31'),
          licenceRef,
          returnCycleId: generateUUID(),
          startDate: new Date('2022-11-01')
        })
      })

      describe('and one return log for the matching return cycle that ends before the "change date" [B]', () => {
        beforeAll(async () => {
          endsBeforeTheChangeDateReturnLog = await ReturnLogHelper.add({
            endDate: new Date('2022-09-30'),
            licenceRef,
            returnCycleId
          })
        })

        describe('and one return log for the matching return cycle that is after the "change date" [C]', () => {
          beforeAll(async () => {
            returnReference = ReturnRequirementHelper.generateReference()
            endsAfterTheChangeDateReturnLog = await ReturnLogHelper.add({
              endDate: new Date('2023-03-31'),
              licenceRef,
              returnCycleId,
              returnReference
            })
          })

          describe('and now the reissued return log [D]', () => {
            beforeAll(async () => {
              reissuedReturnLog1 = await ReturnLogHelper.add({
                endDate: changeDate,
                licenceRef,
                returnCycleId,
                returnReference
              })

              reissuedReturnIds = [reissuedReturnLog1.returnId]
            })

            it('voids only the return log [C] that matches the cycle and ends after the "change date"', async () => {
              await VoidLicenceReturnLogsService(reissuedReturnIds, licenceRef, returnCycleId, changeDate)

              let returnLogBeingChecked

              returnLogBeingChecked = await differentReturnCycleReturnLog.$query()
              expect(returnLogBeingChecked.status).toEqual('due')

              returnLogBeingChecked = await endsBeforeTheChangeDateReturnLog.$query()
              expect(returnLogBeingChecked.status).toEqual('due')

              returnLogBeingChecked = await endsAfterTheChangeDateReturnLog.$query()
              expect(returnLogBeingChecked.status).toEqual('void')

              returnLogBeingChecked = await reissuedReturnLog1.$query()
              expect(reissuedReturnLog1.status).toEqual('due')
            })
          })
        })
      })
    })
  })

  describe('when we are reissuing return logs because a licence end date has been changed to a future date', () => {
    beforeAll(async () => {
      changeDate = new Date('2022-12-31')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has one return log on a different return cycle [A]', () => {
      beforeAll(async () => {
        differentReturnCycleReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-10-31'),
          licenceRef,
          returnCycleId: generateUUID(),
          startDate: new Date('2022-11-01')
        })
      })

      describe('and one return log for the matching return cycle that ends before the "change date" [B]', () => {
        beforeAll(async () => {
          endsBeforeTheChangeDateReturnLog = await ReturnLogHelper.add({
            endDate: new Date('2022-09-30'),
            licenceRef,
            returnCycleId
          })
        })

        describe('and one return log for the matching return cycle that matched the "change date" [C]', () => {
          beforeAll(async () => {
            returnReference = ReturnRequirementHelper.generateReference()
            endsAfterTheChangeDateReturnLog = await ReturnLogHelper.add({
              endDate: changeDate,
              licenceRef,
              returnCycleId,
              returnReference
            })
          })

          describe('and now the reissued return log [D]', () => {
            beforeAll(async () => {
              reissuedReturnLog1 = await ReturnLogHelper.add({
                endDate: new Date('2023-03-31'),
                licenceRef,
                returnCycleId,
                returnReference
              })

              reissuedReturnIds = [reissuedReturnLog1.returnId]
            })

            it('voids only the return log [C] that matches the cycle', async () => {
              await VoidLicenceReturnLogsService(reissuedReturnIds, licenceRef, returnCycleId, changeDate)

              let returnLogBeingChecked

              returnLogBeingChecked = await differentReturnCycleReturnLog.$query()
              expect(returnLogBeingChecked.status).toEqual('due')

              returnLogBeingChecked = await endsBeforeTheChangeDateReturnLog.$query()
              expect(returnLogBeingChecked.status).toEqual('due')

              returnLogBeingChecked = await endsAfterTheChangeDateReturnLog.$query()
              expect(returnLogBeingChecked.status).toEqual('void')

              returnLogBeingChecked = await reissuedReturnLog1.$query()
              expect(reissuedReturnLog1.status).toEqual('due')
            })
          })
        })
      })
    })
  })

  describe('when we are reissuing return logs because a return version has been superseded', () => {
    beforeAll(async () => {
      changeDate = new Date('2022-04-01')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has an existing return log for the superseded return version [A]', () => {
      beforeAll(async () => {
        existingReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-03-31'),
          licenceRef,
          returnCycleId,
          startDate: new Date('2022-04-01')
        })
      })

      describe('and now the reissued return log [B]', () => {
        beforeAll(async () => {
          returnReference = ReturnRequirementHelper.generateReference()
          reissuedReturnLog1 = await ReturnLogHelper.add({
            endDate: new Date('2023-03-31'),
            licenceRef,
            returnCycleId,
            returnReference,
            startDate: changeDate
          })

          reissuedReturnIds = [reissuedReturnLog1.returnId]
        })

        it('voids only the existing return log [A]', async () => {
          await VoidLicenceReturnLogsService(reissuedReturnIds, licenceRef, returnCycleId, changeDate)

          let returnLogBeingChecked

          returnLogBeingChecked = await existingReturnLog.$query()
          expect(returnLogBeingChecked.status).toEqual('void')

          returnLogBeingChecked = await reissuedReturnLog1.$query()
          expect(returnLogBeingChecked.status).toEqual('due')
        })
      })
    })
  })

  describe('when we are reissuing return logs because a return version has been added', () => {
    beforeAll(async () => {
      changeDate = new Date('2022-09-01')

      licenceRef = LicenceHelper.generateLicenceRef()
      returnCycleId = generateUUID()
    })

    describe('and the licence has an existing return log for the existing return version [A]', () => {
      beforeAll(async () => {
        returnReference = ReturnRequirementHelper.generateReference()

        existingReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2023-03-31'),
          licenceRef,
          returnCycleId,
          startDate: new Date('2022-04-01')
        })
      })

      describe('and now the reissued return logs [B]', () => {
        beforeAll(async () => {
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

          reissuedReturnIds = [reissuedReturnLog1.returnId, reissuedReturnLog2.returnId]
        })

        it('voids only the existing return log [A]', async () => {
          await VoidLicenceReturnLogsService(reissuedReturnIds, licenceRef, returnCycleId, changeDate)

          let returnLogBeingChecked

          returnLogBeingChecked = await existingReturnLog.$query()
          expect(returnLogBeingChecked.status).toEqual('void')

          returnLogBeingChecked = await reissuedReturnLog1.$query()
          expect(returnLogBeingChecked.status).toEqual('due')

          returnLogBeingChecked = await reissuedReturnLog2.$query()
          expect(returnLogBeingChecked.status).toEqual('due')
        })
      })
    })
  })
})
