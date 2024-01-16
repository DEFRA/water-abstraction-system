'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

describe('View Licence service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  let fetchLicenceResult

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    describe('and it has an expired date', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.licence.expiredDate = new Date('2033-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result).to.equal({
          id: testId,
          licenceRef: '01/130/R01',
          region: 'South West',
          startDate: '7 March 2013',
          endDate: '7 March 2033'
        })
      })
    })

    describe('and it does not have an expired date', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result).to.equal({
          id: testId,
          licenceRef: '01/130/R01',
          region: 'South West',
          startDate: '7 March 2013'
        })
      })
    })
  })
})

function _licenceData () {
  return {
    licence: {
      id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
      licenceRef: '01/130/R01',
      region: {
        id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
        displayName: 'South West'
      },
      startDate: new Date('2013-03-07')
    }
  }
}
