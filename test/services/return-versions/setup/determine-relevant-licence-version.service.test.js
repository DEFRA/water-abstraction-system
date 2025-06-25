'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers

// Things we need to stub
const FetchRelevantLicenceVersionService = require('../../../../app/services/return-versions/setup/fetch-relevant-licence-version.service.js')

// Thing under test
const DetermineRelevantLicenceVersionService = require('../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js')

describe('Return Versions - Setup - Determine Relevant Licence Version service', () => {
  let licenceVersion
  let session

  beforeEach(() => {
    licenceVersion = { id: '87567a81-871b-437f-b712-747d8eee2885' }

    session = {
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2018-03-27',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2014-02-27',
            reason: null,
            modLogs: []
          },
          {
            id: '7e4fa51b-ff51-4516-be5e-0230f252bc64',
            startDate: '2008-04-01',
            reason: null,
            modLogs: []
          },
          {
            id: 'aab39560-5625-4cf3-8b33-d5fef4a225be',
            startDate: '1998-01-01',
            reason: null,
            modLogs: []
          }
        ],
        startDate: '1967-05-01',
        waterUndertaker: true
      },
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      returnVersionStartDate: new Date('2018-03-27')
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the user selected a start date', () => {
    describe('whose relevant licence version starts after all existing return versions', () => {
      beforeEach(() => {
        licenceVersion.startDate = new Date('2019-05-13')
        licenceVersion.endDate = null

        Sinon.stub(FetchRelevantLicenceVersionService, 'go').resolves(licenceVersion)
      })

      it('returns the relevant licence with no copyable return versions', async () => {
        const result = await DetermineRelevantLicenceVersionService.go(session)

        expect(result).to.equal({ ...licenceVersion, copyableReturnVersions: [] })
      })
    })

    describe('whose relevant licence version starts before the latest existing return version', () => {
      beforeEach(() => {
        // NOTE: The service doesn't look at `returnVersionStartDate`, but we set it to something that would result in
        // the relevant licence version being returned so as not to confuse later readers.
        session.returnVersionStartDate = new Date('2016-01-04')

        licenceVersion.startDate = new Date('2014-01-27')
        licenceVersion.endDate = new Date('2018-03-26')

        Sinon.stub(FetchRelevantLicenceVersionService, 'go').resolves(licenceVersion)
      })

      it('returns the relevant licence with latest existing return version as a copyable candidate', async () => {
        const result = await DetermineRelevantLicenceVersionService.go(session)

        expect(result).to.equal({ ...licenceVersion, copyableReturnVersions: [session.licence.returnVersions[0]] })
      })
    })

    describe('whose relevant licence version starts before and ends after multiple existing return versions start', () => {
      beforeEach(() => {
        session.returnVersionStartDate = new Date('2016-01-04')

        licenceVersion.startDate = new Date('2007-01-27')
        licenceVersion.endDate = new Date('2018-03-26')

        Sinon.stub(FetchRelevantLicenceVersionService, 'go').resolves(licenceVersion)
      })

      it('returns the relevant licence with existing return versions that start during the period as a copyable candidates', async () => {
        const result = await DetermineRelevantLicenceVersionService.go(session)

        expect(result).to.equal({
          ...licenceVersion,
          copyableReturnVersions: [session.licence.returnVersions[0], session.licence.returnVersions[1]]
        })
      })
    })

    describe('whose relevant licence version ends before all existing return versions', () => {
      beforeEach(() => {
        session.returnVersionStartDate = new Date('1997-01-04')

        licenceVersion.startDate = new Date('1995-05-13')
        licenceVersion.endDate = new Date('1997-12-31')

        Sinon.stub(FetchRelevantLicenceVersionService, 'go').resolves(licenceVersion)
      })

      it('returns the relevant licence with no copyable return versions', async () => {
        const result = await DetermineRelevantLicenceVersionService.go(session)

        expect(result).to.equal({ ...licenceVersion, copyableReturnVersions: [] })
      })
    })
  })
})
