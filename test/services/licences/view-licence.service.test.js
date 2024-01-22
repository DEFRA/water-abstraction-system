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

describe.only('View Licence service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  let fetchLicenceResult

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    describe('and it does not have an expired, lapsed, or revoke date', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal(null)
      })
    })

    describe('and it has an expired date, revoked date and lapsed date all in the past on the same day', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 March 2023')
      })
    })

    describe('and it has no expired date but revoked and lapsed dates are in the past on the same day', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 March 2023')
      })
    })

    describe('and it has no lapsed date but expired and revoked dates are in the past on the same day', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 March 2023')
      })
    })

    describe('and it has no revoked date but expired and lapsed dates are in the past on the same day', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence lapsed on 7 March 2023')
      })
    })

    describe('and it only has an expired date', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence expired on 7 March 2023')
      })
    })

    describe('and it only has a lapsed date', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence lapsed on 7 March 2023')
      })
    })

    describe('and it only has a revoked date', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 March 2023')
      })
    })

    describe('and it has an expired and revoked date with expired being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        fetchLicenceResult.expiredDate = new Date('2023-02-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence expired on 7 February 2023')
      })
    })

    describe('and it has an expired and lapsed date with expired being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-02-07')
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence expired on 7 February 2023')
      })
    })

    describe('and it has an expired and lapsed date with lapsed being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        fetchLicenceResult.lapsedDate = new Date('2023-02-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence lapsed on 7 February 2023')
      })
    })

    describe('and it has an expired and revoked date with revoked being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        fetchLicenceResult.revokedDate = new Date('2023-02-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 February 2023')
      })
    })

    describe('and it has a revoked and lapsed date with lapsed being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.lapsedDate = new Date('2023-02-07')
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence lapsed on 7 February 2023')
      })
    })

    describe('and it has a revoked and lapsed date with revoked being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.revokedDate = new Date('2023-02-07')
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 February 2023')
      })
    })

    describe('and it has a revoked, expired and lapsed date with revoked being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.revokedDate = new Date('2023-02-07')
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence was revoked on 7 February 2023')
      })
    })

    describe('and it has a revoked, expired and lapsed date with expired being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        fetchLicenceResult.lapsedDate = new Date('2023-03-07')
        fetchLicenceResult.expiredDate = new Date('2023-02-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence expired on 7 February 2023')
      })
    })

    describe('and it has a revoked, expired and lapsed date with lapsed being earlier', () => {
      beforeEach(() => {
        fetchLicenceResult = _licenceData()
        fetchLicenceResult.revokedDate = new Date('2023-03-07')
        fetchLicenceResult.lapsedDate = new Date('2023-02-07')
        fetchLicenceResult.expiredDate = new Date('2023-03-07')
        Sinon.stub(FetchLicenceService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the data and format it for use in the licence summary page', async () => {
        const result = await ViewLicenceService.go(testId)

        expect(result.warning).to.equal('This licence lapsed on 7 February 2023')
      })
    })
  })
})

function _licenceData () {
  return {
    id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    licenceRef: '01/130/R01',
    region: {
      id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
      displayName: 'South West'
    },
    startDate: new Date('2013-03-07')
  }
}
