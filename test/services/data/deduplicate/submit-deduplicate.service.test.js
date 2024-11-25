'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const DeDuplicateService = require('../../../../app/services/data/deduplicate/de-duplicate-licence.service.js')

// Thing under test
const SubmitDeduplicateService = require('../../../../app/services/data/deduplicate/submit-deduplicate.service.js')

describe('Submit Deduplicate service', () => {
  let deDuplicateServiceStub
  let payload

  beforeEach(async () => {
    deDuplicateServiceStub = Sinon.stub(DeDuplicateService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a populated payload', () => {
    beforeEach(() => {
      payload = { 'licence-ref': ' wa/01/120  ' }
    })

    it('removes whitespace and uppercases the licence reference entered and returns it', async () => {
      const result = await SubmitDeduplicateService.go(payload)

      expect(result.licenceRef).to.equal('WA/01/120')
    })

    it('calls the de-dupe service with the parsed licence reference', async () => {
      await SubmitDeduplicateService.go(payload)

      const parsedLicenceRef = deDuplicateServiceStub.args[0][0]

      expect(deDuplicateServiceStub.called).to.be.true()
      expect(deDuplicateServiceStub.calledWith(parsedLicenceRef)).to.be.true()
    })
  })

  describe('when called with a unpopulated payload', () => {
    describe('because nothing was entered by the user', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view containing an error', async () => {
        const result = await SubmitDeduplicateService.go(payload)

        expect(result.error).to.exist()
        expect(result.error).to.equal({ text: 'Enter a licence reference to de-dupe' })
      })
    })

    describe('because only whitespace was entered by the user', () => {
      beforeEach(() => {
        payload = { 'licence-ref': ' ' }
      })

      it('returns page data for the view containing an error', async () => {
        const result = await SubmitDeduplicateService.go(payload)

        expect(result.error).to.exist()
        expect(result.error).to.equal({ text: 'Enter a licence reference to de-dupe' })
      })
    })
  })
})
