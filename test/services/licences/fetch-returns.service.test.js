// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import ReturnLogHelper from '../../support/helpers/return-log.helper.js'

// Thing under test
import FetchReturnsService from '../../../app/services/licences/fetch-returns.service.js'

describe('Licences - Fetch Returns service', () => {
  let licence
  let returnLogs

  beforeAll(async () => {
    returnLogs = []

    licence = await LicenceHelper.add()

    let returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-07-01'),
      licenceRef: licence.licenceRef,
      metadata: { nald: { formatId: 9999990 } },
      returnReference: '9999990',
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      metadata: { nald: { formatId: 9999990 } },
      returnReference: '9999990',
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      metadata: { nald: { formatId: 10334004 } },
      returnReference: '10334004',
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      metadata: { nald: { formatId: 123 } },
      returnReference: '123',
      startDate: new Date('2020-05-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)
  })

  afterAll(async () => {
    await licence.$query().delete()

    for (const returnLog of returnLogs) {
      returnLog.$query().delete()
    }
  })

  describe('when the licence has return logs', () => {
    it('returns results', async () => {
      const result = await FetchReturnsService(licence.id)

      expect(result).toEqual({
        //  This should be ordered first by start date, then by return reference, then by end date
        //
        // - 2020-05-01 - 123      - 2020-06-01
        // - 2020-02-01 - 10334004 - 2020-06-01
        // - 2020-02-01 - 9999990  - 2020-06-01
        // - 2020-02-01 - 9999990  - 2020-07-01
        //
        returns: [
          {
            dueDate: returnLogs[3].dueDate,
            endDate: returnLogs[3].endDate,
            id: returnLogs[3].id,
            metadata: returnLogs[3].metadata,
            returnId: returnLogs[3].returnId,
            returnReference: returnLogs[3].returnReference,
            startDate: returnLogs[3].startDate,
            status: returnLogs[3].status
          },
          {
            dueDate: returnLogs[2].dueDate,
            endDate: returnLogs[2].endDate,
            id: returnLogs[2].id,
            metadata: returnLogs[2].metadata,
            returnId: returnLogs[2].returnId,
            returnReference: returnLogs[2].returnReference,
            startDate: returnLogs[2].startDate,
            status: returnLogs[2].status
          },
          {
            dueDate: returnLogs[0].dueDate,
            endDate: returnLogs[0].endDate,
            id: returnLogs[0].id,
            metadata: returnLogs[0].metadata,
            returnId: returnLogs[0].returnId,
            returnReference: returnLogs[0].returnReference,
            startDate: returnLogs[0].startDate,
            status: returnLogs[0].status
          },
          {
            dueDate: returnLogs[1].dueDate,
            endDate: returnLogs[1].endDate,
            id: returnLogs[1].id,
            metadata: returnLogs[1].metadata,
            returnId: returnLogs[1].returnId,
            returnReference: returnLogs[1].returnReference,
            startDate: returnLogs[1].startDate,
            status: returnLogs[1].status
          }
        ],
        totalNumber: 4
      })
    })
  })
})
