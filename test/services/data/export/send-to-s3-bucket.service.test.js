'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const mockFs = require('mock-fs')
const path = require('path')

// Things we need to stub
const {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand
} = require('@aws-sdk/client-s3')

// Thing under test
const SendToS3BucketService = require('../../../../app/services/data/export/send-to-s3-bucket.service.js')

describe('Send to S3 bucket service', () => {
  let largeFilePath
  let folderNameWithPath
  let s3Stub
  let notifierStub
  const smallFilePath = 'test/fixtures/compress-files.service.csv'
  const fakeFileName = 'FakeFolder'

  beforeEach(() => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    mockFs.restore()
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the upload size is greater than 5MB', () => {
    beforeEach(() => {
      folderNameWithPath = 'testFolder'
      largeFilePath = path.join(folderNameWithPath, 'testFile')

      mockFs({
        testFolder: {
          testFile: createString(size)
        }
      })
    })

    const size = 10 * 1024 * 1024

    describe('when successful', () => {
      beforeEach(() => {
        s3Stub = Sinon.stub(S3Client.prototype, 'send')
        s3Stub.onCall(0).resolves({ UploadId: 'UxLUb6yRZp' })
        s3Stub.onCall(1).resolves({ ETag: '9c4b515515e26034f1a0353873a2599a' })
        s3Stub.onCall(2).resolves({ ETag: '52152ae3c571b3552b66138eb19a235f' })
        s3Stub.onCall(3).resolves()
      })

      it('uploads the file to the S3 bucket', async () => {
        await SendToS3BucketService.go(largeFilePath)

        // Test that the S3 Client was called once
        expect(s3Stub.callCount).to.equal(4)

        expect(s3Stub.getCall(0).firstArg).to.be.an.instanceof(CreateMultipartUploadCommand)
        expect(s3Stub.getCall(1).firstArg).to.be.an.instanceof(UploadPartCommand)
        expect(s3Stub.getCall(2).firstArg).to.be.an.instanceof(UploadPartCommand)
        expect(s3Stub.getCall(3).firstArg).to.be.an.instanceof(CompleteMultipartUploadCommand)
      })
    })

    describe('when unsuccessful', () => {
      describe('because an invalid file name is given', () => {
        beforeEach(() => {
          s3Stub = Sinon.stub(S3Client.prototype, 'send')
        })

        it('does not upload a file to the S3 bucket', async () => {
          await expect(SendToS3BucketService.go(fakeFileName)).to.reject()

          expect(s3Stub.called).to.be.false()
        })
      })

      describe('when we can not connect to the bucket', () => {
        beforeEach(() => {
          Sinon.stub(S3Client.prototype, 'send').rejects()
        })

        it('catches the error', async () => {
          await SendToS3BucketService.go(largeFilePath)

          expect(notifierStub.omfg.calledWith(('Send to S3 errored'))).to.be.true()
        })
      })
    })
  })

  describe('when the upload size is less than 5MB', () => {
    describe('when successful', () => {
      beforeEach(() => {
        s3Stub = Sinon.stub(S3Client.prototype, 'send')
      })

      it('uploads the file to the S3 bucket', async () => {
        await SendToS3BucketService.go(smallFilePath)

        // Test that the S3 Client was called once
        expect(s3Stub.calledOnce).to.be.true()

        // Get the first call and test that it was called with PutObjectCommand
        const calledCommand = s3Stub.getCall(0).firstArg

        expect(calledCommand).to.be.an.instanceof(PutObjectCommand)
      })
    })
    describe('when unsuccessful', () => {
      describe('because an invalid file name is given', () => {
        beforeEach(() => {
          s3Stub = Sinon.stub(S3Client.prototype, 'send')
        })

        it('does not upload a file to the S3 bucket', async () => {
          await expect(SendToS3BucketService.go(fakeFileName)).to.reject()

          expect(s3Stub.called).to.be.false()
        })
      })

      describe('when we can not connect to the bucket', () => {
        beforeEach(() => {
          Sinon.stub(S3Client.prototype, 'send').rejects()
        })

        it('catches the error', async () => {
          await SendToS3BucketService.go(smallFilePath)

          expect(notifierStub.omfg.calledWith(('Send to S3 errored'))).to.be.true()
        })
      })
    })
  })
})

function createString (size) {
  return 'x'.repeat(size)
}
