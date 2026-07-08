// Test framework dependencies

// Things we need to stub
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Thing under test
import SendToS3BucketService from '../../../../app/services/jobs/export/send-to-s3-bucket.service.js'

describe('Send to S3 bucket service', () => {
  let s3Stub

  beforeEach(() => {
    // Stub the S3 Client's send method, which is used to run the 'put object' command
    s3Stub = vi.spyOn(S3Client.prototype, 'send').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when successful', () => {
    const filePath = 'test/support/fixtures/compress-files.service.csv'

    it('uploads a file to the S3 bucket', async () => {
      await SendToS3BucketService(filePath)

      // Test that the S3 Client was called once
      expect(s3Stub).toHaveBeenCalledOnce()

      // Get the first call and test that it was called with PutObjectCommand
      const calledCommand = s3Stub.getCall(0).firstArg

      expect(calledCommand).toBeInstanceOf(PutObjectCommand)
    })
  })

  describe('when unsuccessful', () => {
    describe('because an invalid file name is given', () => {
      const fileName = 'FakeFolder'

      it('does not upload a file to the S3 bucket', async () => {
        await expect(SendToS3BucketService(fileName)).rejects.toThrow()

        expect(s3Stub).not.toHaveBeenCalled()
      })
    })
  })
})
