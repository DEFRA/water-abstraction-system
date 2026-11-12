// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchChargeVersionsService from '../../../../src/services/bill-runs/match/fetch-charge-versions.service.js'

// Thing under test
import FetchLicencesService from '../../../../src/services/bill-runs/match/fetch-licences.service.js'

describe('Bill Runs - Match - Fetch Licences service', () => {
  const billRun = {
    billingBatchId: '41be6d72-701b-4252-90d5-2d38614b6282',
    regionId: '64924759-8142-4a08-9d1e-1e902cd9d316'
  }
  const billingPeriod = {
    endDate: new Date('2023-03-31'),
    startDate: new Date('2022-04-01')
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when at least one 2PT licence exists for the region and billing period', () => {
    const licenceHolderStub = vi.fn().mockReturnValue('Mock Licence Holder')

    const licenceOne = {
      $licenceHolder: licenceHolderStub,
      expiredDate: '2050-04-01T00:00:00.000Z',
      id: '301d4ef9-41b9-4ec9-927b-0c78d9ece5ba',
      lapsedDate: null,
      licenceRef: '11/11/11/1111',
      revokedDate: null,
      startDate: '1967-02-13T00:00:00.000Z'
    }

    describe('and there is a single licence linked to a single charge version', () => {
      beforeEach(() => {
        vi.spyOn(FetchChargeVersionsService, 'default').mockResolvedValue([
          {
            endDate: null,
            id: '9407b74d-816c-44a2-9926-73a89a9da985',
            licence: licenceOne,
            startDate: '2022-04-01T00:00:00.000Z',
            status: 'current'
          }
        ])
      })

      it('will fetch the data, format it and group the charge version by the licence', async () => {
        const result = await FetchLicencesService(billRun, billingPeriod)

        expect(result).toHaveLength(1)
        expect(result[0].id).toEqual(licenceOne.id)
        expect(result[0].licenceRef).toEqual(licenceOne.licenceRef)
        expect(result[0].startDate).toEqual(licenceOne.startDate)
        expect(result[0].expiredDate).toEqual(licenceOne.expiredDate)
        expect(result[0].lapsedDate).toEqual(licenceOne.lapsedDate)
        expect(result[0].revokedDate).toEqual(licenceOne.revokedDate)
        expect(result[0].licenceHolder).toEqual('Mock Licence Holder')

        expect(result[0].chargeVersions).toHaveLength(1)
        expect(result[0].chargeVersions[0].id).toEqual('9407b74d-816c-44a2-9926-73a89a9da985')
        expect(result[0].chargeVersions[0].startDate).toEqual('2022-04-01T00:00:00.000Z')
        expect(result[0].chargeVersions[0].endDate).toBeNull()
        expect(result[0].chargeVersions[0].status).toEqual('current')
        expect(result[0].chargeVersions[0].licence).toEqual(licenceOne)
      })
    })

    describe('and there are two licences linked to three charge versions', () => {
      const licenceTwo = {
        $licenceHolder: licenceHolderStub,
        expiredDate: null,
        id: 'd561be9a-ddbb-4442-a361-757a4d1ef46c',
        lapsedDate: null,
        licenceRef: '22/22/22/2222',
        revokedDate: null,
        startDate: '1971-02-13T00:00:00.000Z'
      }

      beforeEach(() => {
        vi.spyOn(FetchChargeVersionsService, 'default').mockResolvedValue([
          {
            endDate: null,
            id: '9407b74d-816c-44a2-9926-73a89a9da985',
            licence: licenceOne,
            startDate: '2022-10-01T00:00:00.000Z',
            status: 'current'
          },
          {
            endDate: '2022-09-30T00:00:00.000Z',
            id: 'cbab5668-21db-4fe5-9af8-9bb823d9294f',
            licence: licenceOne,
            startDate: '2022-04-01T00:00:00.000Z',
            status: 'current'
          },
          {
            endDate: null,
            id: 'efe652ba-f42c-4113-a190-f3d9d829a640',
            licence: licenceTwo,
            startDate: '2022-04-01T00:00:00.000Z',
            status: 'current'
          }
        ])
      })

      it('will fetch the data, format it and group the charge versions by the licences', async () => {
        const result = await FetchLicencesService(billRun, billingPeriod)

        expect(result).toHaveLength(2)
        expect(result[0].id).toEqual(licenceOne.id)
        expect(result[1].id).toEqual(licenceTwo.id)

        expect(result[0].chargeVersions).toHaveLength(2)
        expect(result[0].chargeVersions[0].id).toEqual('9407b74d-816c-44a2-9926-73a89a9da985')
        expect(result[0].chargeVersions[1].id).toEqual('cbab5668-21db-4fe5-9af8-9bb823d9294f')
        expect(result[1].chargeVersions).toHaveLength(1)
        expect(result[1].chargeVersions[0].id).toEqual('efe652ba-f42c-4113-a190-f3d9d829a640')
      })
    })
  })

  describe('when no 2PT licences exist for the region and billing period', () => {
    beforeEach(() => {
      vi.spyOn(FetchChargeVersionsService, 'default').mockResolvedValue([])
    })

    it('will return an empty array', async () => {
      const result = await FetchLicencesService(billRun, billingPeriod)

      expect(result).toHaveLength(0)
    })
  })
})
