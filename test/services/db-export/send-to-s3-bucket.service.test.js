'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const path = require('path')

// Things we need to stub
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

// Thing under test
const SendToS3BucketService = require('../../../app/services/db-export/send-to-s3-bucket.service')

describe('Send to S3 bucket service', () => {
  let s3Stub
  let notifierStub

  beforeEach(() => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when successful', () => {
    beforeEach(() => {
      // Stub the S3 Client's send method, which is used to run the 'put object' command
      s3Stub = Sinon.stub(S3Client.prototype, 'send')
    })

    const filePath = 'test/fixtures/compress-files.service.csv'
    const fileName = path.basename(filePath)

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

      expect(result).to.equal(true)
    })

    it('logs a success message', async () => {
      await SendToS3BucketService.go(filePath)

      expect(notifierStub.omg.calledWith(`The file ${fileName} was uploaded successfully`)).to.be.true()
    })
  })

  describe('when unsuccessful', () => {
    describe('because an invalid file name is given', () => {
      const fileName = 'FakeFile'

      it('throws an error', async () => {
        const result = await expect(SendToS3BucketService.go(fileName)).to.reject()

        expect(result).to.be.an.error()
        expect(result.message).to.equal(`ENOENT: no such file or directory, open '${fileName}'`)
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

        expect(result).to.equal(false)
      })

      it('logs the error', async () => {
        await SendToS3BucketService.go(filePath)

        expect(notifierStub.omfg.calledWith('ERROR uploading file: Error')).to.be.true()
      })
    })
  })
})
