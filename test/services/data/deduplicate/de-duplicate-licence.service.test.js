'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')

// Thing under test
const DeDuplicateLicenceService = require('../../../../app/services/data/deduplicate/de-duplicate-licence.service.js')

describe('De-duplicate Licence service', () => {
  const licenceRef = '01/120'

  let invalidLicence
  let validLicences

  beforeEach(async () => {
    await DatabaseSupport.clean()

    validLicences = []

    // Create our valid licence
    let licence = await LicenceHelper.add({ licenceRef })
    validLicences.push(licence.id)

    // Create other valid licences that will match our search. We need to ensure these do not get deleted by the service
    licence = await LicenceHelper.add({ licenceRef: 'WA/01/120' })
    validLicences.push(licence.id)
    licence = await LicenceHelper.add({ licenceRef: '02/01/120/R01' })
    validLicences.push(licence.id)
  })

  describe('when there is a duplicate licence', () => {
    describe('with a space', () => {
      describe('at the start of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: ' 01/120' })
        })

        it('removes just that invalid licence', async () => {
          await DeDuplicateLicenceService.go(licenceRef)

          const allLicences = await LicenceModel.query().select('id')
          const allLicenceIds = allLicences.map((licence) => {
            return licence.id
          })

          expect(allLicenceIds).include(validLicences)
          expect(allLicenceIds).not.include(invalidLicence.id)
        })
      })

      describe('at the end of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: '01/120 ' })
        })

        it('removes just that invalid licence', async () => {
          await DeDuplicateLicenceService.go(licenceRef)

          const allLicences = await LicenceModel.query().select('id')
          const allLicenceIds = allLicences.map((licence) => {
            return licence.id
          })

          expect(allLicenceIds).include(validLicences)
          expect(allLicenceIds).not.include(invalidLicence.id)
        })
      })

      describe('at the start and end of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: ' 01/120 ' })
        })

        it('removes just that invalid licence', async () => {
          await DeDuplicateLicenceService.go(licenceRef)

          const allLicences = await LicenceModel.query().select('id')
          const allLicenceIds = allLicences.map((licence) => {
            return licence.id
          })

          expect(allLicenceIds).include(validLicences)
          expect(allLicenceIds).not.include(invalidLicence.id)
        })
      })
    })

    describe('with a newline', () => {
      describe('at the start of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: '\n01/120' })
        })

        it('removes just that invalid licence', async () => {
          await DeDuplicateLicenceService.go(licenceRef)

          const allLicences = await LicenceModel.query().select('id')
          const allLicenceIds = allLicences.map((licence) => {
            return licence.id
          })

          expect(allLicenceIds).include(validLicences)
          expect(allLicenceIds).not.include(invalidLicence.id)
        })
      })

      describe('at the end of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: '01/120\n' })
        })

        it('removes just that invalid licence', async () => {
          await DeDuplicateLicenceService.go(licenceRef)

          const allLicences = await LicenceModel.query().select('id')
          const allLicenceIds = allLicences.map((licence) => {
            return licence.id
          })

          expect(allLicenceIds).include(validLicences)
          expect(allLicenceIds).not.include(invalidLicence.id)
        })
      })

      describe('at the start and end of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: '\n01/120\n' })
        })

        it('removes just that invalid licence', async () => {
          await DeDuplicateLicenceService.go(licenceRef)

          const allLicences = await LicenceModel.query().select('id')
          const allLicenceIds = allLicences.map((licence) => {
            return licence.id
          })

          expect(allLicenceIds).include(validLicences)
          expect(allLicenceIds).not.include(invalidLicence.id)
        })
      })
    })
  })

  describe('when there is no duplicate licence', () => {
    it('removes no licences', async () => {
      await DeDuplicateLicenceService.go(licenceRef)

      const allLicences = await LicenceModel.query().select('id')
      const allLicenceIds = allLicences.map((licence) => {
        return licence.id
      })

      expect(allLicenceIds).include(validLicences)
    })
  })

  describe('when there is no matching licence', () => {
    it('removes no licences', async () => {
      await DeDuplicateLicenceService.go(licenceRef)

      const allLicences = await LicenceModel.query().select('id')
      const allLicenceIds = allLicences.map((licence) => {
        return licence.id
      })

      expect(allLicenceIds).include(validLicences)
    })
  })
})
