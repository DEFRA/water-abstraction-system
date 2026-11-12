// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things to stub
import BillingAccountModel from 'water-abstraction-engine/models/billing-account.model.js'
import BillModel from 'water-abstraction-engine/models/bill.model.js'
import CompanyModel from 'water-abstraction-engine/models/company.model.js'
import LicenceModel from 'water-abstraction-engine/models/licence.model.js'
import MonitoringStationModel from 'water-abstraction-engine/models/monitoring-station.model.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'
import UserModel from 'water-abstraction-engine/models/user.model.js'

// Thing under test
import FetchSearchResultsDetailsService from '../../../src/services/search/fetch-search-results-details.service.js'

describe('Search - Fetch Search Results Details service', () => {
  let idsByType

  let billSpy
  let billingAccountSpy
  let licenceHolderSpy
  let licenceSpy
  let monitoringStationSpy
  let returnLogSpy
  let userSpy

  beforeEach(() => {
    idsByType = {
      bill: [1, 2],
      billingAccount: [3, 4],
      licence: [7, 8],
      licenceHolder: [5, 6],
      monitoringStation: [9, 10],
      returnLog: [11, 12],
      user: [13, 14]
    }

    billSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(BillModel, 'query').mockReturnValue({
      findByIds: billSpy,
      select: vi.fn().mockReturnThis()
    })

    billingAccountSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(BillingAccountModel, 'query').mockReturnValue({
      findByIds: billingAccountSpy,
      modifyGraph: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis()
    })

    licenceHolderSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(CompanyModel, 'query').mockReturnValue({
      findByIds: licenceHolderSpy,
      leftJoinRelated: vi.fn().mockReturnThis(),
      modifyGraph: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      whereNotNull: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis()
    })

    licenceSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(LicenceModel, 'query').mockReturnValue({
      findByIds: licenceSpy,
      modifyGraph: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis()
    })

    monitoringStationSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(MonitoringStationModel, 'query').mockReturnValue({
      findByIds: monitoringStationSpy,
      select: vi.fn().mockReturnThis()
    })

    returnLogSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
      findByIds: returnLogSpy,
      leftJoinRelated: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis()
    })

    userSpy = vi.fn().mockResolvedValue([])
    vi.spyOn(UserModel, 'query').mockReturnValue({
      findByIds: userSpy,
      modify: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns all the matching details', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({
        bill: [],
        billingAccount: [],
        licence: [],
        licenceHolder: [],
        monitoringStation: [],
        returnLog: [],
        user: []
      })
    })
  })

  describe('when an unknown type is requested', () => {
    beforeEach(() => {
      idsByType = { UNKNOWN_TYPE: [16, 17] }
    })

    it('returns no matches', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({
        UNKNOWN_TYPE: []
      })
    })
  })

  describe('when bills are requested', () => {
    beforeEach(() => {
      idsByType = { bill: [1, 2] }
    })

    it('finds the correct bills', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ bill: [] })

      expect(billSpy).toHaveBeenCalled()
      expect(billSpy.mock.calls[0][0]).toEqual([1, 2])
      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when billing accounts are requested', () => {
    beforeEach(() => {
      idsByType = { billingAccount: [3, 4] }
    })

    it('finds the correct billing accounts', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ billingAccount: [] })

      expect(billSpy).not.toHaveBeenCalled()
      expect(billingAccountSpy).toHaveBeenCalledOnce()
      expect(billingAccountSpy.mock.calls[0][0]).toEqual([3, 4])
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when licence holders are requested', () => {
    beforeEach(() => {
      idsByType = { licenceHolder: [5, 6] }
    })

    it('finds the correct licence holders', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ licenceHolder: [] })

      expect(billSpy).not.toHaveBeenCalled()
      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).toHaveBeenCalledOnce()
      expect(licenceHolderSpy.mock.calls[0][0]).toEqual([5, 6])
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when licences are requested', () => {
    beforeEach(() => {
      idsByType = { licence: [7, 8] }
    })

    it('finds the correct licences', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ licence: [] })

      expect(billSpy).not.toHaveBeenCalled()
      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).toHaveBeenCalledOnce()
      expect(licenceSpy.mock.calls[0][0]).toEqual([7, 8])
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when monitoring stations are requested', () => {
    beforeEach(() => {
      idsByType = { monitoringStation: [9, 10] }
    })

    it('finds the correct monitoring stations', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ monitoringStation: [] })

      expect(billSpy).not.toHaveBeenCalled()
      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).toHaveBeenCalledOnce()
      expect(monitoringStationSpy.mock.calls[0][0]).toEqual([9, 10])
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when return logs are requested', () => {
    beforeEach(() => {
      idsByType = { returnLog: [11, 12] }
    })

    it('finds the correct return logs', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ returnLog: [] })

      expect(billSpy).not.toHaveBeenCalled()
      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).toHaveBeenCalledOnce()
      expect(returnLogSpy.mock.calls[0][0]).toEqual([11, 12])
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when users are requested', () => {
    beforeEach(() => {
      idsByType = { user: [13, 14] }
    })

    it('finds the correct users', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ user: [] })

      expect(billSpy).not.toHaveBeenCalled()
      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).toHaveBeenCalledOnce()
    })
  })
})
