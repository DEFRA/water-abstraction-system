'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

// Thing under test
const SendToS3BucketService = require('../../../app/services/db-export/send-to-s3-bucket.service.js')

describe('Send to S3 bucket service', () => {
  let s3Stub

  describe('when successful', () => {
    beforeEach(() => {
      // Stub the S3 Client's send method, which is used to run the 'put object' command
      s3Stub = Sinon.stub(S3Client.prototype, 'send')
    })

    afterEach(() => {
      Sinon.restore()
    })

    const filePath = 'test/fixtures/compress-files.service.csv'

    it('uploads a file to the S3 bucket', async () => {
      await SendToS3BucketService.go(filePath)

      // Test that the S3 Client was called once
      expect(s3Stub.calledOnce).to.be.true()

      // Get the first call and test that it was called with PutObjectCommand
      const calledCommand = s3Stub.getCall(0).firstArg
      expect(calledCommand).to.be.an.instanceof(PutObjectCommand)
    })

    it('returns true', async () => {
      const result = await SendToS3BucketService.go(filePath)

      expect(result).to.be.true()
    })
  })

  describe('when unsuccessful', () => {
    describe('because an invalid file name is given', () => {
      const fileName = 'FakeFolder'

      it('throws an error', async () => {
        const result = await expect(SendToS3BucketService.go(fileName)).to.reject()

        expect(result).to.be.an.error()
        expect(result.message).to.startWith('ENOENT')
      })
    })

    describe('because there is an issue with the upload', () => {
      beforeEach(() => {
        // Stub the S3 Client's send method, which is used to run the 'put object' command
        s3Stub = Sinon.stub(S3Client.prototype, 'send').rejects()
      })

      const filePath = 'test/fixtures/compress-files.service.csv'

      it('returns false', async () => {
        const result = await SendToS3BucketService.go(filePath)

        expect(result).to.be.false()
      })
    })
  })
})
