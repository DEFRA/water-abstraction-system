'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const { S3Client, PutObjectCommand, CreateMultipartUploadCommand } = require('@aws-sdk/client-s3')
const UploadTypeService = require('../../../../app/services/data/export/upload-type.service.js')

// Thing under test
const SendToS3BucketService = require('../../../../app/services/data/export/send-to-s3-bucket.service.js')

describe.only('Send to S3 bucket service', () => {
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

    describe('and the file is larger then 5MB', () => {
      beforeEach(() => {
        Sinon.stub(UploadTypeService, 'go').returns('multipart upload')
      })

      it('uploads the file to the S3 bucket', async () => {
        await SendToS3BucketService.go(filePath)

        // Test that the S3 Client was called once
        expect(s3Stub.calledOnce).to.be.true()

        // Get the first call and test that it was called with PutObjectCommand
        const calledCommand = s3Stub.getCall(0).firstArg
        expect(calledCommand).to.be.an.instanceof(CreateMultipartUploadCommand)
      })
    })
    describe('and the file is less than 5MB', () => {
      beforeEach(() => {
        Sinon.stub(UploadTypeService, 'go').returns('single upload')
      })

      it('uploads the file to the S3 bucket', async () => {
        await SendToS3BucketService.go(filePath)

        // Test that the S3 Client was called once
        expect(s3Stub.calledOnce).to.be.true()

        // Get the first call and test that it was called with PutObjectCommand
        const calledCommand = s3Stub.getCall(0).firstArg

        expect(calledCommand).to.be.an.instanceof(PutObjectCommand)
      })
    })
  })

  describe('when unsuccessful', () => {
    describe('For a file larger then 5MB', () => {
      beforeEach(() => {
        Sinon.stub(UploadTypeService, 'go').returns('multipart upload')
      })

      describe('because an invalid file name is given', () => {
        beforeEach(() => {
          // Stub the S3 Client's send method, which is used to run the 'put object' command
          s3Stub = Sinon.stub(S3Client.prototype, 'send')
        })

        const fileName = 'FakeFolder'

        it('does not upload a file to the S3 bucket', async () => {
          await expect(SendToS3BucketService.go(fileName)).to.reject()

          expect(s3Stub.called).to.be.false()
        })
      })

      describe('when we can not connect to the bucket', () => {
        beforeEach(() => {
          Sinon.stub(S3Client.prototype, 'send').rejects()
        })

        const filePath = 'test/fixtures/compress-files.service.csv'

        it('catches the error', async () => {
          await SendToS3BucketService.go(filePath)

          expect(notifierStub.omfg.calledWith(('Send to S3 errored'))).to.be.true()
        })
      })
    })

    describe('For a file less than 5MB', () => {
      beforeEach(() => {
        Sinon.stub(UploadTypeService, 'go').returns('single upload')
      })

      describe('because an invalid file name is given', () => {
        beforeEach(() => {
          // Stub the S3 Client's send method, which is used to run the 'put object' command
          s3Stub = Sinon.stub(S3Client.prototype, 'send')
        })

        const fileName = 'FakeFolder'

        it('does not upload a file to the S3 bucket', async () => {
          await expect(SendToS3BucketService.go(fileName)).to.reject()

          expect(s3Stub.called).to.be.false()
        })
      })

      describe('when we can not connect to the bucket', () => {
        beforeEach(() => {
          Sinon.stub(S3Client.prototype, 'send').rejects()
        })

        const filePath = 'test/fixtures/compress-files.service.csv'

        it('catches the error', async () => {
          await SendToS3BucketService.go(filePath)

          expect(notifierStub.omfg.calledWith(('Send to S3 errored'))).to.be.true()
        })
      })
    })
  })
})
