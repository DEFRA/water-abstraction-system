'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things to stub
const BillingAccountModel = require('../../../app/models/billing-account.model.js')
const CompanyModel = require('../../../app/models/company.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const MonitoringStationModel = require('../../../app/models/monitoring-station.model.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const UserModel = require('../../../app/models/user.model.js')

// Thing under test
const FetchSearchResultsDetailsService = require('../../../app/services/search/fetch-search-results-details.service.js')

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

    billingAccountSpy = Sinon.stub().resolves([])
    Sinon.stub(BillingAccountModel, 'query').returns({
      findByIds: billingAccountSpy,
      modifyGraph: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis()
    })

    licenceHolderSpy = Sinon.stub().resolves([])
    Sinon.stub(CompanyModel, 'query').returns({
      findByIds: licenceHolderSpy,
      leftJoinRelated: Sinon.stub().returnsThis(),
      modifyGraph: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis(),
      whereNotNull: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis()
    })

    licenceSpy = Sinon.stub().resolves([])
    Sinon.stub(LicenceModel, 'query').returns({
      findByIds: licenceSpy,
      modifyGraph: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis()
    })

    monitoringStationSpy = Sinon.stub().resolves([])
    Sinon.stub(MonitoringStationModel, 'query').returns({
      findByIds: monitoringStationSpy,
      select: Sinon.stub().returnsThis()
    })

    returnLogSpy = Sinon.stub().resolves([])
    Sinon.stub(ReturnLogModel, 'query').returns({
      findByIds: returnLogSpy,
      select: Sinon.stub().returnsThis()
    })

    userSpy = Sinon.stub().resolves([])
    Sinon.stub(UserModel, 'query').returns({
      findByIds: userSpy,
      modify: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis()
    })
  })

  afterEach(() => {
    Sinon.restore()
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

      expect(billingAccountSpy.calledOnce).toBe(true)
      expect(billingAccountSpy.firstCall.args[0]).toEqual([1, 2])
      expect(licenceHolderSpy.called).toBe(false)
      expect(licenceSpy.called).toBe(false)
      expect(monitoringStationSpy.called).toBe(false)
      expect(returnLogSpy.called).toBe(false)
      expect(userSpy.called).toBe(false)
    })
  })

  describe('when licence holders are requested', () => {
    beforeEach(() => {
      idsByType = { licenceHolder: [3, 4] }
    })

    it('finds the correct licence holders', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ licenceHolder: [] })

      expect(billingAccountSpy.called).toBe(false)
      expect(licenceHolderSpy.calledOnce).toBe(true)
      expect(licenceHolderSpy.firstCall.args[0]).toEqual([3, 4])
      expect(licenceSpy.called).toBe(false)
      expect(monitoringStationSpy.called).toBe(false)
      expect(returnLogSpy.called).toBe(false)
      expect(userSpy.called).toBe(false)
    })
  })

  describe('when licences are requested', () => {
    beforeEach(() => {
      idsByType = { licence: [5, 6] }
    })

    it('finds the correct licences', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ licence: [] })

      expect(billingAccountSpy.called).toBe(false)
      expect(licenceHolderSpy.called).toBe(false)
      expect(licenceSpy.calledOnce).toBe(true)
      expect(licenceSpy.firstCall.args[0]).toEqual([5, 6])
      expect(monitoringStationSpy.called).toBe(false)
      expect(returnLogSpy.called).toBe(false)
      expect(userSpy.called).toBe(false)
    })
  })

  describe('when monitoring stations are requested', () => {
    beforeEach(() => {
      idsByType = { monitoringStation: [7, 8] }
    })

    it('finds the correct monitoring stations', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ monitoringStation: [] })

      expect(billingAccountSpy.called).toBe(false)
      expect(licenceHolderSpy.called).toBe(false)
      expect(licenceSpy.called).toBe(false)
      expect(monitoringStationSpy.calledOnce).toBe(true)
      expect(monitoringStationSpy.firstCall.args[0]).toEqual([7, 8])
      expect(returnLogSpy.called).toBe(false)
      expect(userSpy.called).toBe(false)
    })
  })

  describe('when return logs are requested', () => {
    beforeEach(() => {
      idsByType = { returnLog: [9, 10] }
    })

    it('finds the correct return logs', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ returnLog: [] })

      expect(billingAccountSpy.called).toBe(false)
      expect(licenceHolderSpy.called).toBe(false)
      expect(licenceSpy.called).toBe(false)
      expect(monitoringStationSpy.called).toBe(false)
      expect(returnLogSpy.calledOnce).toBe(true)
      expect(returnLogSpy.firstCall.args[0]).toEqual([9, 10])
      expect(userSpy.called).toBe(false)
    })
  })

  describe('when users are requested', () => {
    beforeEach(() => {
      idsByType = { user: [11, 12] }
    })

    it('finds the correct users', async () => {
      const result = await FetchSearchResultsDetailsService(idsByType)

      expect(result).toEqual({ user: [] })

      expect(billingAccountSpy.called).toBe(false)
      expect(licenceHolderSpy.called).toBe(false)
      expect(licenceSpy.called).toBe(false)
      expect(monitoringStationSpy.called).toBe(false)
      expect(returnLogSpy.called).toBe(false)
      expect(userSpy.calledOnce).toBe(true)
    })
  })
})
