'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const DeDuplicateLicenceService = require('../../../../app/services/data/deduplicate/de-duplicate-licence.service.js')

describe('De-duplicate Licence service', () => {
  let invalidLicence
  let licenceRef
  let validLicences

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    validLicences = []

    // Create our valid licence
    let licence = await LicenceHelper.add({ licenceRef })

    validLicences.push(licence.id)

    // Create other valid licences that will match our search. We need to ensure these do not get deleted by the service
    licence = await LicenceHelper.add({ licenceRef: generateLicenceRef() })
    validLicences.push(licence.id)
    licence = await LicenceHelper.add({ licenceRef: generateLicenceRef() })
    validLicences.push(licence.id)
  })

  describe('when there is a duplicate licence', () => {
    describe('with a space', () => {
      describe('at the start of the reference', () => {
        beforeEach(async () => {
          invalidLicence = await LicenceHelper.add({ licenceRef: ` ${licenceRef}` })
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
          invalidLicence = await LicenceHelper.add({ licenceRef: `${licenceRef} ` })
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
          invalidLicence = await LicenceHelper.add({ licenceRef: ` ${licenceRef} ` })
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
          invalidLicence = await LicenceHelper.add({ licenceRef: `\n${licenceRef}` })
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
          invalidLicence = await LicenceHelper.add({ licenceRef: `${licenceRef}\n` })
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
          invalidLicence = await LicenceHelper.add({ licenceRef: `\n${licenceRef}\n` })
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
      // NOTE: We also pondered what happens if someone enters a reference that is invalid for other reasons like
      // they put a space in the middle. We definitely have no licences with this kind of reference so it will be
      // treated in the same way as a reference that matches no licences.
      await DeDuplicateLicenceService.go('01/ 120')

      const allLicences = await LicenceModel.query().select('id')
      const allLicenceIds = allLicences.map((licence) => {
        return licence.id
      })

      expect(allLicenceIds).include(validLicences)
    })
  })
})
