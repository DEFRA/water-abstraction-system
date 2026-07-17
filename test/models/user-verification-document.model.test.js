// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceDocumentHeaderHelper from '../support/helpers/licence-document-header.helper.js'
import LicenceDocumentHeaderModel from '../../app/models/licence-document-header.model.js'
import LicenceEntityHelper from '../support/helpers/licence-entity.helper.js'
import UserVerificationDocumentHelper from '../support/helpers/user-verification-document.helper.js'
import UserVerificationHelper from '../support/helpers/user-verification.helper.js'
import UserVerificationModel from '../../app/models/user-verification.model.js'

// Thing under test
import UserVerificationDocumentModel from '../../app/models/user-verification-document.model.js'

describe('User Verification Document model', () => {
  let testLicenceDocumentHeader
  let testCompanyEntity
  let testLicenceEntity
  let testUserVerification
  let testRecord

  beforeAll(async () => {
    testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })
    testLicenceEntity = await LicenceEntityHelper.add()
    testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add()

    testUserVerification = await UserVerificationHelper.add({
      companyEntityId: testCompanyEntity.id,
      licenceEntityId: testLicenceEntity.id
    })

    testRecord = await UserVerificationDocumentHelper.add({
      licenceDocumentHeaderId: testLicenceDocumentHeader.id,
      userVerificationId: testUserVerification.id
    })
  })

  afterAll(async () => {
    await testRecord.$query().delete()
    await testUserVerification.$query().delete()
    await testLicenceDocumentHeader.$query().delete()
    await testLicenceEntity.$query().delete()
    await testCompanyEntity.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserVerificationDocumentModel.query().findById([
        testRecord.userVerificationId,
        testRecord.licenceDocumentHeaderId
      ])

      expect(result).toBeInstanceOf(UserVerificationDocumentModel)
      expect(result.userVerificationId).toEqual(testRecord.userVerificationId)
      expect(result.licenceDocumentHeaderId).toEqual(testRecord.licenceDocumentHeaderId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence document header', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationDocumentModel.query().innerJoinRelated('licenceDocumentHeader')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document header', async () => {
        const result = await UserVerificationDocumentModel.query()
          .findById([testRecord.userVerificationId, testRecord.licenceDocumentHeaderId])
          .withGraphFetched('licenceDocumentHeader')

        expect(result).toBeInstanceOf(UserVerificationDocumentModel)
        expect(result.userVerificationId).toEqual(testRecord.userVerificationId)
        expect(result.licenceDocumentHeaderId).toEqual(testRecord.licenceDocumentHeaderId)

        expect(result.licenceDocumentHeader).toBeInstanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeader).toEqual(testLicenceDocumentHeader)
      })
    })

    describe('when linking to user verification', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationDocumentModel.query().innerJoinRelated('userVerification')

        expect(query).toBeDefined()
      })

      it('can eager load the user verification', async () => {
        const result = await UserVerificationDocumentModel.query()
          .findById([testRecord.userVerificationId, testRecord.licenceDocumentHeaderId])
          .withGraphFetched('userVerification')

        expect(result).toBeInstanceOf(UserVerificationDocumentModel)
        expect(result.userVerificationId).toEqual(testRecord.userVerificationId)
        expect(result.licenceDocumentHeaderId).toEqual(testRecord.licenceDocumentHeaderId)

        expect(result.userVerification).toBeInstanceOf(UserVerificationModel)
        expect(result.userVerification).toEqual(testUserVerification)
      })
    })
  })
})
