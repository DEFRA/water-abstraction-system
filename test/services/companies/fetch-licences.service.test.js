'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, before, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionHolderHelper = require('../../support/helpers/licence-version-holder.helper.js')
const { generateRandomInteger, generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/companies/fetch-licences.service.js')

describe('Companies - Fetch Licences service', () => {
  let anotherLicence
  let anotherLicenceVersion
  let anotherLicenceVersionHolder
  let companyId
  let licence
  let licenceVersion
  let licenceVersionHolder
  let olderLicenceVersion
  let olderLicenceVersionHolder
  let otherLicence
  let otherLicenceVersion
  let otherLicenceVersionHolder
  let pageNumber

  before(async () => {
    companyId = generateUUID()

    // This is the licence and details we expect to retrieve
    licence = await LicenceHelper.add({
      licenceRef: `02/${generateRandomInteger(10, 99)}/${generateRandomInteger(100, 999)}`
    })
    licenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 2,
      licenceId: licence.id,
      startDate: new Date('2025-04-01')
    })
    licenceVersionHolder = await LicenceVersionHolderHelper.add({
      companyId,
      derivedName: 'Kanemitsu Corporation',
      licenceVersionId: licenceVersion.id
    })

    // This is an older licence version linked to a different company. This confirms we are getting the right current
    // licence holder details
    olderLicenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 1,
      licenceId: licence.id,
      startDate: new Date('2022-01-01')
    })
    olderLicenceVersionHolder = await LicenceVersionHolderHelper.add({
      companyId: generateUUID(),
      derivedName: 'Omni Consumer Products',
      licenceVersionId: olderLicenceVersion.id
    })

    // This is another licence for the same company and details we expect to retrieve. This should appear first
    // in the results to confirm it is ordering them correctly
    anotherLicence = await LicenceHelper.add({
      licenceRef: `01/${generateRandomInteger(10, 99)}/${generateRandomInteger(100, 999)}`
    })
    anotherLicenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 1,
      licenceId: anotherLicence.id,
      startDate: new Date('2025-04-01')
    })
    anotherLicenceVersionHolder = await LicenceVersionHolderHelper.add({
      companyId,
      derivedName: 'Kanemitsu Corporation',
      licenceVersionId: anotherLicenceVersion.id
    })

    // This is a different licence linked to a different company. This confirms we are only getting licences for the
    // selected company
    otherLicence = await LicenceHelper.add()
    otherLicenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 2,
      licenceId: otherLicence.id,
      startDate: new Date('2025-04-01')
    })
    otherLicenceVersionHolder = await LicenceVersionHolderHelper.add({
      companyId: generateUUID(),
      derivedName: 'Kanemitsu Corporation',
      licenceVersionId: otherLicenceVersion.id
    })
  })

  beforeEach(() => {
    pageNumber = '1'

    // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
    // part of the full suite, and the risk our test record is returned in the second page of results.
    Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await otherLicenceVersionHolder.$query().delete()
    await otherLicenceVersion.$query().delete()
    await otherLicence.$query().delete()

    await anotherLicenceVersionHolder.$query().delete()
    await anotherLicenceVersion.$query().delete()
    await anotherLicence.$query().delete()

    await olderLicenceVersionHolder.$query().delete()
    await olderLicenceVersion.$query().delete()

    await licenceVersionHolder.$query().delete()
    await licenceVersion.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('returns licences linked to the company where it is the licence holder', async () => {
      const result = await FetchLicencesService.go(companyId, pageNumber)

      expect(result).to.equal({
        licences: [
          {
            expiredDate: null,
            id: anotherLicence.id,
            lapsedDate: null,
            licenceRef: anotherLicence.licenceRef,
            revokedDate: null,
            startDate: new Date('2022-01-01'),
            currentLicenceHolderId: anotherLicenceVersionHolder.companyId,
            currentLicenceHolder: anotherLicenceVersionHolder.derivedName
          },
          {
            expiredDate: null,
            id: licence.id,
            lapsedDate: null,
            licenceRef: licence.licenceRef,
            revokedDate: null,
            startDate: new Date('2022-01-01'),
            currentLicenceHolderId: licenceVersionHolder.companyId,
            currentLicenceHolder: licenceVersionHolder.derivedName
          }
        ],
        totalNumber: 2
      })
    })
  })
})
