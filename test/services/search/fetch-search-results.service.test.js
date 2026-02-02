'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const MonitoringStationHelper = require('../../support/helpers/monitoring-station.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchSearchResultsService = require('../../../app/services/search/fetch-search-results.service.js')

describe('Search - Fetch Search Results service', () => {
  const billingAccounts = []
  const licenceHolders = []
  const licences = []
  const monitoringStations = []
  const returnLogs = []
  const users = []

  let query
  let resultTypes
  let page

  before(async () => {
    let licence
    let licenceDocumentHeader
    let licenceHolderSeedData
    let returnLog

    // Add the billing accounts in non-alphabetical order to prove the ordering in the results

    const company = await CompanyHelper.add()
    billingAccounts.push(
      await BillingAccountHelper.add({ accountNumber: 'TESTSEARCH-Y97327242A', companyId: company.id })
    )
    billingAccounts.push(
      await BillingAccountHelper.add({ accountNumber: 'TESTSEARCH-Y97327243A', companyId: company.id })
    )
    billingAccounts.push(
      await BillingAccountHelper.add({ accountNumber: 'TESTSEARCH-Y97327241A', companyId: company.id })
    )

    // Add the licence holders in non-alphabetical order to prove the ordering in the results

    licence = await LicenceHelper.add({ licenceRef: '02/01/TESTHOLDERSEARCH01/05' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'TESTSEARCH holder 2')
    licenceHolders.push({ licence, licenceHolderSeedData })

    licence = await LicenceHelper.add({ licenceRef: '01/02/TESTHOLDERSEARCH02/06' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'TESTSEARCH holder 11')
    licenceHolders.push({ licence, licenceHolderSeedData })

    // Add the licences in non-alphabetical order to prove the ordering in the results

    licence = await LicenceHelper.add({ licenceRef: '02/01/TESTSEARCH01/05' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'Test search holder 1')
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licence.licenceRef,
      metadata: { Name: 'Test search holder 1' }
    })
    licences.push({ licence, licenceDocumentHeader, licenceHolderSeedData })

    licence = await LicenceHelper.add({ licenceRef: '01/02/TESTSEARCH02/06' })
    licenceHolderSeedData = await LicenceHolderSeeder.seed(licence.licenceRef, 'Test search holder 2')
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licence.licenceRef,
      metadata: { Name: 'Test search holder 2' }
    })
    licences.push({ licence, licenceDocumentHeader, licenceHolderSeedData })

    // Add the monitoring stations in non-alphabetical order to prove the ordering in the results
    monitoringStations.push(await MonitoringStationHelper.add({ label: 'Somewhere TESTSEARCH Station 02' }))
    monitoringStations.push(await MonitoringStationHelper.add({ label: 'Somewhere TESTSEARCH Station 03' }))
    monitoringStations.push(await MonitoringStationHelper.add({ label: 'Somewhere TESTSEARCH Station 01' }))

    const licence1 = await LicenceHelper.add({ licenceRef: 'SEARCH-TEST-1' })
    const licence2 = await LicenceHelper.add({ licenceRef: 'SEARCH-TEST-2' })
    const licence3 = await LicenceHelper.add({ licenceRef: 'SEARCH-TEST-3' })

    // Add the return logs in non-alphabetical and non-date order to prove the ordering in the results

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-01'),
      licenceRef: licence1.licenceRef,
      returnReference: 'TESTSEARCH8801100010'
    })
    returnLogs.push({ returnLog, licence: licence1 })

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-01'),
      licenceRef: licence2.licenceRef,
      returnReference: 'TESTSEARCH8801100010'
    })
    returnLogs.push({ returnLog, licence: licence2 })

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-01'),
      licenceRef: licence3.licenceRef,
      returnReference: 'TESTSEARCH6601100010'
    })
    returnLogs.push({ returnLog, licence: licence3 })

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-02'),
      licenceRef: licence1.licenceRef,
      returnReference: 'TESTSEARCH8801100010'
    })
    returnLogs.push({ returnLog, licence: licence1 })

    // Add the users in non-alphabetical order to prove the ordering in the results. We also have both internal and
    // external users to prove that only external users are returned

    users.push(await UserHelper.add({ username: 'TESTSEARCH02@wrls.gov.uk', application: 'water_vml' }))
    users.push(await UserHelper.add({ username: 'TESTSEARCH03@wrls.gov.uk' }))
    users.push(await UserHelper.add({ username: 'TESTSEARCH01@wrls.gov.uk', application: 'water_vml' }))
  })

  beforeEach(() => {
    resultTypes = ['billingAccount', 'licenceHolder', 'licence', 'monitoringStation', 'returnLog', 'user']
    page = 1
  })

  describe('when called', () => {
    beforeEach(() => {
      query = 'TESTSEARCH'
    })

    it('returns the correctly ordered matching results', async () => {
      const result = await FetchSearchResultsService.go(query, resultTypes, page)

      expect(result).to.equal({
        results: [
          {
            exact: false,
            id: licences[1].licence.id,
            type: 'licence'
          },
          {
            exact: false,
            id: licences[0].licence.id,
            type: 'licence'
          },
          {
            exact: false,
            id: licenceHolders[1].licenceHolderSeedData.companyId,
            type: 'licenceHolder'
          },
          {
            exact: false,
            id: licenceHolders[0].licenceHolderSeedData.companyId,
            type: 'licenceHolder'
          },
          {
            exact: false,
            id: monitoringStations[2].id,
            type: 'monitoringStation'
          },
          {
            exact: false,
            id: monitoringStations[0].id,
            type: 'monitoringStation'
          },
          {
            exact: false,
            id: monitoringStations[1].id,
            type: 'monitoringStation'
          },
          {
            exact: false,
            id: returnLogs[2].returnLog.id,
            type: 'returnLog'
          },
          {
            exact: false,
            id: returnLogs[3].returnLog.id,
            type: 'returnLog'
          },
          {
            exact: false,
            id: returnLogs[0].returnLog.id,
            type: 'returnLog'
          },
          {
            exact: false,
            id: returnLogs[1].returnLog.id,
            type: 'returnLog'
          },
          {
            exact: false,
            id: billingAccounts[2].id,
            type: 'billingAccount'
          },
          {
            exact: false,
            id: billingAccounts[0].id,
            type: 'billingAccount'
          },
          {
            exact: false,
            id: billingAccounts[1].id,
            type: 'billingAccount'
          },
          {
            exact: false,
            id: users[2].id,
            type: 'user'
          },
          {
            exact: false,
            id: users[0].id,
            type: 'user'
          }
        ],
        total: 17
      })
    })
  })

  describe('when called for no search results', () => {
    beforeEach(() => {
      query = '1'
      resultTypes = []
    })

    it('returns the correctly ordered matching results', async () => {
      const result = await FetchSearchResultsService.go(query, resultTypes, page)

      expect(result).to.equal({ results: [], total: 0 })
    })
  })

  describe('when multiple pages of results exist', () => {
    beforeEach(() => {
      // Set the page size to 1 to force multiple pages of results
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1)

      query = 'TESTSEARCH'
      page = 2
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('correctly returns the requested page of results', async () => {
      const result = await FetchSearchResultsService.go(query, resultTypes, page)

      expect(result).to.equal({
        results: [
          {
            exact: false,
            id: licences[0].licence.id,
            type: 'licence'
          }
        ],
        total: 17
      })
    })
  })

  describe('when searching for billing accounts', () => {
    beforeEach(() => {
      resultTypes = ['billingAccount']
    })

    describe('when matching billing accounts exist', () => {
      beforeEach(() => {
        query = 'Y9732724'
      })

      it('returns the correctly ordered matching billing accounts', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: billingAccounts[2].id,
              type: 'billingAccount'
            },
            {
              exact: false,
              id: billingAccounts[0].id,
              type: 'billingAccount'
            },
            {
              exact: false,
              id: billingAccounts[1].id,
              type: 'billingAccount'
            }
          ],
          total: 3
        })
      })
    })

    describe('when only one matching billing account exists', () => {
      beforeEach(() => {
        query = 'Y97327242'
      })

      it('returns the correct billing account', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: billingAccounts[0].id,
              type: 'billingAccount'
            }
          ],
          total: 1
        })
      })
    })

    describe('when the case of the search text does not match that of the billing account reference', () => {
      beforeEach(() => {
        query = 'y9732724'
      })

      it('still returns the correct billing accounts', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: billingAccounts[2].id,
              type: 'billingAccount'
            },
            {
              exact: false,
              id: billingAccounts[0].id,
              type: 'billingAccount'
            },
            {
              exact: false,
              id: billingAccounts[1].id,
              type: 'billingAccount'
            }
          ],
          total: 3
        })
      })
    })

    describe('when no matching billing accounts exist', () => {
      beforeEach(() => {
        query = 'Y97327249'
      })

      it('returns empty query results', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [],
          total: 0
        })
      })
    })

    describe('when searching for an exact match', () => {
      beforeEach(() => {
        query = 'TESTSEARCH-Y97327243A'
      })

      it('returns the correct billing account', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: true,
              id: billingAccounts[1].id,
              type: 'billingAccount'
            }
          ],
          total: 1
        })
      })
    })
  })

  describe('when searching for licence holders', () => {
    beforeEach(() => {
      resultTypes = ['licenceHolder']
    })

    describe('when matching licence holders exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH holder'
      })

      it('returns the correctly ordered matching licence holders', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: licenceHolders[1].licenceHolderSeedData.companyId,
              type: 'licenceHolder'
            },
            {
              exact: false,
              id: licenceHolders[0].licenceHolderSeedData.companyId,
              type: 'licenceHolder'
            }
          ],
          total: 2
        })
      })
    })

    describe('when only one matching licence holder exists', () => {
      beforeEach(() => {
        query = 'TESTSEARCH holder 1'
      })

      it('returns the correct licence holder', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: licenceHolders[1].licenceHolderSeedData.companyId,
              type: 'licenceHolder'
            }
          ],
          total: 1
        })
      })
    })

    describe('when the case of the search text does not match that of the licence holder', () => {
      beforeEach(() => {
        query = 'tEsTsEaRcH hOlDeR'
      })

      it('still returns the correct licence holders', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: licenceHolders[1].licenceHolderSeedData.companyId,
              type: 'licenceHolder'
            },
            {
              exact: false,
              id: licenceHolders[0].licenceHolderSeedData.companyId,
              type: 'licenceHolder'
            }
          ],
          total: 2
        })
      })
    })

    describe('when no matching licence holders exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH holder 99'
      })

      it('returns empty query results', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [],
          total: 0
        })
      })
    })

    describe('when searching for an exact match', () => {
      beforeEach(() => {
        query = 'TESTSEARCH holder 11'
      })

      it('returns the correct licence holder', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: true,
              id: licenceHolders[1].licenceHolderSeedData.companyId,
              type: 'licenceHolder'
            }
          ],
          total: 1
        })
      })
    })
  })

  describe('when searching for licences', () => {
    beforeEach(() => {
      resultTypes = ['licence']
    })

    describe('when matching licences exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH'
      })

      it('returns the correctly ordered matching licences', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: licences[1].licence.id,
              type: 'licence'
            },
            {
              exact: false,
              id: licences[0].licence.id,
              type: 'licence'
            }
          ],
          total: 2
        })
      })
    })

    describe('when only one matching licence exists', () => {
      beforeEach(() => {
        query = 'TESTSEARCH01'
      })

      it('returns the correct licence', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: licences[0].licence.id,
              type: 'licence'
            }
          ],
          total: 1
        })
      })
    })

    describe('when the case of the search text does not match that of the licence reference', () => {
      beforeEach(() => {
        query = 'tEsTsEaRcH'
      })

      it('still returns the correct licences', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: licences[1].licence.id,
              type: 'licence'
            },
            {
              exact: false,
              id: licences[0].licence.id,
              type: 'licence'
            }
          ],
          total: 2
        })
      })
    })

    describe('when no matching licences exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH99'
      })

      it('returns empty query results', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [],
          total: 0
        })
      })
    })

    describe('when searching for an exact match', () => {
      beforeEach(() => {
        query = '02/01/TESTSEARCH01/05'
      })

      it('returns the correct licence', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: true,
              id: licences[0].licence.id,
              type: 'licence'
            }
          ],
          total: 1
        })
      })
    })
  })

  describe('when searching for monitoring stations', () => {
    beforeEach(() => {
      resultTypes = ['monitoringStation']
    })

    describe('when matching monitoring stations exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH'
      })

      it('returns the correctly ordered matching monitoring stations', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: monitoringStations[2].id,
              type: 'monitoringStation'
            },
            {
              exact: false,
              id: monitoringStations[0].id,
              type: 'monitoringStation'
            },
            {
              exact: false,
              id: monitoringStations[1].id,
              type: 'monitoringStation'
            }
          ],
          total: 3
        })
      })
    })

    describe('when searching for an exact match', () => {
      beforeEach(() => {
        query = 'somewhere testsearch station 01'
      })

      it('returns the correct monitoring station', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: true,
              id: monitoringStations[2].id,
              type: 'monitoringStation'
            }
          ],
          total: 1
        })
      })
    })

    describe('when the case of the search text does not match that of the station label', () => {
      beforeEach(() => {
        query = 'tEsTsEaRcH'
      })

      it('still returns the correct monitoring stations', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: monitoringStations[2].id,
              type: 'monitoringStation'
            },
            {
              exact: false,
              id: monitoringStations[0].id,
              type: 'monitoringStation'
            },
            {
              exact: false,
              id: monitoringStations[1].id,
              type: 'monitoringStation'
            }
          ],
          total: 3
        })
      })
    })

    describe('when no matching monitoring stations exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH99'
      })

      it('returns empty query results', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [],
          total: 0
        })
      })
    })
  })

  describe('when searching for return logs', () => {
    beforeEach(() => {
      resultTypes = ['returnLog']
    })

    describe('when matching return logs exist', () => {
      beforeEach(() => {
        query = '01100010'
      })

      it('returns the correctly ordered matching return logs', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: returnLogs[2].returnLog.id,
              type: 'returnLog'
            },
            {
              exact: false,
              id: returnLogs[3].returnLog.id,
              type: 'returnLog'
            },
            {
              exact: false,
              id: returnLogs[0].returnLog.id,
              type: 'returnLog'
            },
            {
              exact: false,
              id: returnLogs[1].returnLog.id,
              type: 'returnLog'
            }
          ],
          total: 4
        })
      })
    })

    describe('when only one matching return log exists', () => {
      beforeEach(() => {
        query = '601100010'
      })

      it('returns the correct return log', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: returnLogs[2].returnLog.id,
              type: 'returnLog'
            }
          ],
          total: 1
        })
      })
    })

    describe('when no matching return logs exist', () => {
      beforeEach(() => {
        query = 'NON-NUMERIC'
      })

      it('returns empty query results', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [],
          total: 0
        })
      })
    })

    describe('when searching for an exact match', () => {
      beforeEach(() => {
        query = 'TESTSEARCH6601100010'
        page = 1
      })

      it('returns the correct return log', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: true,
              id: returnLogs[2].returnLog.id,
              type: 'returnLog'
            }
          ],
          total: 1
        })
      })
    })
  })

  describe('when searching for users', () => {
    beforeEach(() => {
      resultTypes = ['user']
    })

    describe('when matching users exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH'
      })

      it('returns the correctly ordered matching users', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: users[2].id,
              type: 'user'
            },
            {
              exact: false,
              id: users[0].id,
              type: 'user'
            }
          ],
          total: 3
        })
      })
    })

    describe('when only one matching user exists', () => {
      beforeEach(() => {
        query = 'TESTSEARCH02'
      })

      it('returns the correct user', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: users[0].id,
              type: 'user'
            }
          ],
          total: 1
        })
      })
    })

    describe('when the case of the search text does not match that of the username', () => {
      beforeEach(() => {
        query = 'tEsTsEaRcH'
      })

      it('still returns the correct users', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: false,
              id: users[2].id,
              type: 'user'
            },
            {
              exact: false,
              id: users[0].id,
              type: 'user'
            }
          ],
          total: 3
        })
      })
    })

    describe('when no matching users exist', () => {
      beforeEach(() => {
        query = 'TESTSEARCH99'
      })

      it('returns empty query results', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [],
          total: 0
        })
      })
    })

    describe('when searching for an exact match', () => {
      beforeEach(() => {
        query = 'TESTSEARCH01@wrls.gov.uk'
      })

      it('returns the correct user', async () => {
        const result = await FetchSearchResultsService.go(query, resultTypes, page)

        expect(result).to.equal({
          results: [
            {
              exact: true,
              id: users[2].id,
              type: 'user'
            }
          ],
          total: 1
        })
      })
    })
  })
})
