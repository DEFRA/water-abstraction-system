'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

// Thing under test
const SendToS3BucketService = require('../../../../app/services/jobs/export/send-to-s3-bucket.service.js')

describe('Send to S3 bucket service', () => {
  let s3Stub

  beforeEach(() => {
    // Stub the S3 Client's send method, which is used to run the 'put object' command
    s3Stub = Sinon.stub(S3Client.prototype, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when successful', () => {
    const filePath = 'test/fixtures/compress-files.service.csv'

    it('uploads a file to the S3 bucket', async () => {
      await SendToS3BucketService.go(filePath)

      // Test that the S3 Client was called once
      expect(s3Stub.calledOnce).to.be.true()

      // Get the first call and test that it was called with PutObjectCommand
      const calledCommand = s3Stub.getCall(0).firstArg

      expect(calledCommand).to.be.an.instanceof(PutObjectCommand)
    })
  })

  describe('when unsuccessful', () => {
    describe('because an invalid file name is given', () => {
      const fileName = 'FakeFolder'

      it('does not upload a file to the S3 bucket', async () => {
        await expect(SendToS3BucketService.go(fileName)).to.reject()

        expect(s3Stub.called).to.be.false()
      })
    })
  })
})
