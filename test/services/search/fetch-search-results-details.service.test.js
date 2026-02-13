'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

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
  let companySpy
  let licenceSpy
  let monitoringStationSpy
  let returnLogSpy
  let userSpy
  let userWhereInSpy

  beforeEach(() => {
    idsByType = {
      billingAccount: [1, 2],
      company: [3, 4],
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

    companySpy = Sinon.stub().resolves([])
    Sinon.stub(CompanyModel, 'query').returns({
      findByIds: companySpy,
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

    userWhereInSpy = Sinon.stub().returnsThis()

    Sinon.stub(UserModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      whereIn: userWhereInSpy,
      modify: userSpy
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns all the matching details', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({
        billingAccount: [],
        company: [],
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
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({
        UNKNOWN_TYPE: []
      })
    })
  })

  describe('when billing accounts are requested', () => {
    beforeEach(() => {
      idsByType = { billingAccount: [1, 2] }
    })

    it('finds the correct billing accounts', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({ billingAccount: [] })

      expect(billingAccountSpy.calledOnce).to.be.true()
      expect(billingAccountSpy.firstCall.args[0]).to.equal([1, 2])
      expect(companySpy.called).to.be.false()
      expect(licenceSpy.called).to.be.false()
      expect(monitoringStationSpy.called).to.be.false()
      expect(returnLogSpy.called).to.be.false()
      expect(userSpy.called).to.be.false()
    })
  })

  describe('when companies are requested', () => {
    beforeEach(() => {
      idsByType = { company: [3, 4] }
    })

    it('finds the correct companies', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({ company: [] })

      expect(billingAccountSpy.called).to.be.false()
      expect(companySpy.calledOnce).to.be.true()
      expect(companySpy.firstCall.args[0]).to.equal([3, 4])
      expect(licenceSpy.called).to.be.false()
      expect(monitoringStationSpy.called).to.be.false()
      expect(returnLogSpy.called).to.be.false()
      expect(userSpy.called).to.be.false()
    })
  })

  describe('when licences are requested', () => {
    beforeEach(() => {
      idsByType = { licence: [5, 6] }
    })

    it('finds the correct licences', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({ licence: [] })

      expect(billingAccountSpy.called).to.be.false()
      expect(companySpy.called).to.be.false()
      expect(licenceSpy.calledOnce).to.be.true()
      expect(licenceSpy.firstCall.args[0]).to.equal([5, 6])
      expect(monitoringStationSpy.called).to.be.false()
      expect(returnLogSpy.called).to.be.false()
      expect(userSpy.called).to.be.false()
    })
  })

  describe('when monitoring stations are requested', () => {
    beforeEach(() => {
      idsByType = { monitoringStation: [7, 8] }
    })

    it('finds the correct monitoring stations', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({ monitoringStation: [] })

      expect(billingAccountSpy.called).to.be.false()
      expect(companySpy.called).to.be.false()
      expect(licenceSpy.called).to.be.false()
      expect(monitoringStationSpy.calledOnce).to.be.true()
      expect(monitoringStationSpy.firstCall.args[0]).to.equal([7, 8])
      expect(returnLogSpy.called).to.be.false()
      expect(userSpy.called).to.be.false()
    })
  })

  describe('when return logs are requested', () => {
    beforeEach(() => {
      idsByType = { returnLog: [9, 10] }
    })

    it('finds the correct return logs', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({ returnLog: [] })

      expect(billingAccountSpy.called).to.be.false()
      expect(companySpy.called).to.be.false()
      expect(licenceSpy.called).to.be.false()
      expect(monitoringStationSpy.called).to.be.false()
      expect(returnLogSpy.calledOnce).to.be.true()
      expect(returnLogSpy.firstCall.args[0]).to.equal([9, 10])
      expect(userSpy.called).to.be.false()
    })
  })

  describe('when users are requested', () => {
    beforeEach(() => {
      idsByType = { user: [11, 12] }
    })

    it('finds the correct users', async () => {
      const result = await FetchSearchResultsDetailsService.go(idsByType)

      expect(result).to.equal({ user: [] })

      expect(billingAccountSpy.called).to.be.false()
      expect(companySpy.called).to.be.false()
      expect(licenceSpy.called).to.be.false()
      expect(monitoringStationSpy.called).to.be.false()
      expect(returnLogSpy.called).to.be.false()
      expect(userSpy.calledOnce).to.be.true()
      expect(userWhereInSpy.firstCall.args).to.equal(['userId', [11, 12]])
    })
  })
})
