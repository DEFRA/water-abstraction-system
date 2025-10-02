'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service.js')

describe('Licences - Fetch licence returns service', () => {
  let licence
  let returnLogs

  before(async () => {
    returnLogs = []

    licence = await LicenceHelper.add()

    let returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      metadata: { nald: { formatId: 32 } },
      returnReference: '32',
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

  after(async () => {
    await licence.$query().delete()

    for (const returnLog of returnLogs) {
      returnLog.$query().delete()
    }
  })

  describe('when the licence has return logs', () => {
    it('returns results', async () => {
      const result = await FetchLicenceReturnsService.go(licence.id, 1)

      expect(result.pagination).to.equal({
        total: 2
      })
      //  This should be ordered first by start date, then by return reference
      expect(result.returns).to.equal([
        {
          dueDate: returnLogs[1].dueDate,
          endDate: returnLogs[1].endDate,
          id: returnLogs[1].id,
          metadata: returnLogs[1].metadata,
          returnReference: returnLogs[1].returnReference,
          startDate: returnLogs[1].startDate,
          status: returnLogs[1].status
        },
        {
          dueDate: returnLogs[0].dueDate,
          endDate: returnLogs[0].endDate,
          id: returnLogs[0].id,
          metadata: returnLogs[0].metadata,
          returnReference: returnLogs[0].returnReference,
          startDate: returnLogs[0].startDate,
          status: returnLogs[0].status
        }
      ])
    })
  })
})
