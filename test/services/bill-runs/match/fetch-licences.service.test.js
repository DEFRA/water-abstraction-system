'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/match/fetch-charge-versions.service.js')

// Thing under test
const FetchLicencesService = require('../../../../app/services/bill-runs/match/fetch-licences.service.js')

describe('Bill Runs - Match - Fetch Licences service', () => {
  const billRun = {
    regionId: '64924759-8142-4a08-9d1e-1e902cd9d316',
    billingBatchId: '41be6d72-701b-4252-90d5-2d38614b6282'
  }
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when at least one 2PT licence exists for the region and billing period', () => {
    const licenceHolderStub = Sinon.stub().returns('Mock Licence Holder')

    const licenceOne = {
      id: '301d4ef9-41b9-4ec9-927b-0c78d9ece5ba',
      licenceRef: '11/11/11/1111',
      startDate: '1967-02-13T00:00:00.000Z',
      expiredDate: '2050-04-01T00:00:00.000Z',
      lapsedDate: null,
      revokedDate: null,
      $licenceHolder: licenceHolderStub
    }

    describe('and there is a single licence linked to a single charge version', () => {
      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').resolves([
          {
            id: '9407b74d-816c-44a2-9926-73a89a9da985',
            startDate: '2022-04-01T00:00:00.000Z',
            endDate: null,
            status: 'current',
            licence: licenceOne
          }
        ])
      })

      it('will fetch the data, format it and group the charge version by the licence', async () => {
        const result = await FetchLicencesService.go(billRun, billingPeriod)

        expect(result).to.have.length(1)
        expect(result[0].id).to.equal(licenceOne.id)
        expect(result[0].licenceRef).to.equal(licenceOne.licenceRef)
        expect(result[0].startDate).to.equal(licenceOne.startDate)
        expect(result[0].expiredDate).to.equal(licenceOne.expiredDate)
        expect(result[0].lapsedDate).to.equal(licenceOne.lapsedDate)
        expect(result[0].revokedDate).to.equal(licenceOne.revokedDate)
        expect(result[0].licenceHolder).to.equal('Mock Licence Holder')

        expect(result[0].chargeVersions).to.have.length(1)
        expect(result[0].chargeVersions[0].id).to.equal('9407b74d-816c-44a2-9926-73a89a9da985')
        expect(result[0].chargeVersions[0].startDate).to.equal('2022-04-01T00:00:00.000Z')
        expect(result[0].chargeVersions[0].endDate).to.equal(null)
        expect(result[0].chargeVersions[0].status).to.equal('current')
        expect(result[0].chargeVersions[0].licence).to.equal(licenceOne)
      })
    })

    describe('and there are two licences linked to three charge versions', () => {
      const licenceTwo = {
        id: 'd561be9a-ddbb-4442-a361-757a4d1ef46c',
        licenceRef: '22/22/22/2222',
        startDate: '1971-02-13T00:00:00.000Z',
        expiredDate: null,
        lapsedDate: null,
        revokedDate: null,
        $licenceHolder: licenceHolderStub
      }

      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').resolves([
          {
            id: '9407b74d-816c-44a2-9926-73a89a9da985',
            startDate: '2022-10-01T00:00:00.000Z',
            endDate: null,
            status: 'current',
            licence: licenceOne
          },
          {
            id: 'cbab5668-21db-4fe5-9af8-9bb823d9294f',
            startDate: '2022-04-01T00:00:00.000Z',
            endDate: '2022-09-30T00:00:00.000Z',
            status: 'current',
            licence: licenceOne
          },
          {
            id: 'efe652ba-f42c-4113-a190-f3d9d829a640',
            startDate: '2022-04-01T00:00:00.000Z',
            endDate: null,
            status: 'current',
            licence: licenceTwo
          }
        ])
      })

      it('will fetch the data, format it and group the charge versions by the licences', async () => {
        const result = await FetchLicencesService.go(billRun, billingPeriod)

        expect(result).to.have.length(2)
        expect(result[0].id).to.equal(licenceOne.id)
        expect(result[1].id).to.equal(licenceTwo.id)

        expect(result[0].chargeVersions).to.have.length(2)
        expect(result[0].chargeVersions[0].id).to.equal('9407b74d-816c-44a2-9926-73a89a9da985')
        expect(result[0].chargeVersions[1].id).to.equal('cbab5668-21db-4fe5-9af8-9bb823d9294f')
        expect(result[1].chargeVersions).to.have.length(1)
        expect(result[1].chargeVersions[0].id).to.equal('efe652ba-f42c-4113-a190-f3d9d829a640')
      })
    })
  })

  describe('when no 2PT licences exist for the region and billing period', () => {
    beforeEach(() => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
    })

    it('will return an empty array', async () => {
      const result = await FetchLicencesService.go(billRun, billingPeriod)

      expect(result).to.have.length(0)
    })
  })
})
