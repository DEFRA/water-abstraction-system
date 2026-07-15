// Things to stub
import BillingAccountModel from '../../../app/models/billing-account.model.js'
import CompanyModel from '../../../app/models/company.model.js'
import LicenceModel from '../../../app/models/licence.model.js'
import MonitoringStationModel from '../../../app/models/monitoring-station.model.js'
import ReturnLogModel from '../../../app/models/return-log.model.js'
import UserModel from '../../../app/models/user.model.js'

// Thing under test
import FetchSearchResultsDetailsService from '../../../app/services/search/fetch-search-results-details.service.js'

describe('Search - Fetch Search Results Details service', () => {
  let idsByType

  let billingAccountSpy
  let licenceHolderSpy
  let licenceSpy
  let monitoringStationSpy
  let returnLogSpy
  let userSpy

  beforeEach(() => {
    idsByType = {
      billingAccount: [1, 2],
      licenceHolder: [3, 4],
      licence: [5, 6],
      monitoringStation: [7, 8],
      returnLog: [9, 10],
      user: [11, 12]
    }

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
        billingAccount: [],
        licenceHolder: [],
        licence: [],
        monitoringStation: [],
        returnLog: [],
        user: []
      })
    })
  })

  describe('when an unknown type is requested', () => {
    beforeEach(() => {
      idsByType = { UNKNOWN_TYPE: [13, 14] }
    })

    it('returns no matches', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({
        UNKNOWN_TYPE: []
      })
    })
  })

  describe('when billing accounts are requested', () => {
    beforeEach(() => {
      idsByType = { billingAccount: [1, 2] }
    })

    it('finds the correct billing accounts', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ billingAccount: [] })

      expect(billingAccountSpy).toHaveBeenCalledOnce()
      expect(billingAccountSpy.mock.calls[0][0]).toEqual([1, 2])
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when licence holders are requested', () => {
    beforeEach(() => {
      idsByType = { licenceHolder: [3, 4] }
    })

    it('finds the correct licence holders', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ licenceHolder: [] })

      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).toHaveBeenCalledOnce()
      expect(licenceHolderSpy.mock.calls[0][0]).toEqual([3, 4])
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when licences are requested', () => {
    beforeEach(() => {
      idsByType = { licence: [5, 6] }
    })

    it('finds the correct licences', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ licence: [] })

      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).toHaveBeenCalledOnce()
      expect(licenceSpy.mock.calls[0][0]).toEqual([5, 6])
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when monitoring stations are requested', () => {
    beforeEach(() => {
      idsByType = { monitoringStation: [7, 8] }
    })

    it('finds the correct monitoring stations', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ monitoringStation: [] })

      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).toHaveBeenCalledOnce()
      expect(monitoringStationSpy.mock.calls[0][0]).toEqual([7, 8])
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when return logs are requested', () => {
    beforeEach(() => {
      idsByType = { returnLog: [9, 10] }
    })

    it('finds the correct return logs', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ returnLog: [] })

      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).toHaveBeenCalledOnce()
      expect(returnLogSpy.mock.calls[0][0]).toEqual([9, 10])
      expect(userSpy).not.toHaveBeenCalled()
    })
  })

  describe('when users are requested', () => {
    beforeEach(() => {
      idsByType = { user: [11, 12] }
    })

    it('finds the correct users', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ user: [] })

      expect(billingAccountSpy).not.toHaveBeenCalled()
      expect(licenceHolderSpy).not.toHaveBeenCalled()
      expect(licenceSpy).not.toHaveBeenCalled()
      expect(monitoringStationSpy).not.toHaveBeenCalled()
      expect(returnLogSpy).not.toHaveBeenCalled()
      expect(userSpy).toHaveBeenCalledOnce()
    })
  })
})
