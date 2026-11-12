import {
  processAddRecipient,
  processDownloadRecipients,
  processPreviewPaperReturn,
  processRemoveThreshold,
  setup,
  submitAlertEmailAddress,
  submitAlertThresholds,
  submitAlertType,
  submitCancel,
  submitCancelAlerts,
  submitCheck,
  submitCheckLicenceMatches,
  submitCheckLicenceMatchesFilter,
  submitCheckNoticeType,
  submitContactType,
  submitInvitationPeriod,
  submitLicence,
  submitNoticeType,
  submitPaperReturn,
  submitRecipientName,
  submitReminderPeriod,
  submitRemoveLicences,
  submitReturnsPeriod,
  submitSelectRecipients,
  viewAlertEmailAddress,
  viewAlertThresholds,
  viewAlertType,
  viewCancel,
  viewCancelAlerts,
  viewCheck,
  viewCheckLicenceMatches,
  viewCheckNoticeType,
  viewConfirmation,
  viewContactType,
  viewInvitationPeriod,
  viewLicence,
  viewNoticeType,
  viewPaperReturn,
  viewPreview,
  viewPreviewCheckAlert,
  viewPreviewCheckPaperReturn,
  viewRecipientName,
  viewReminderPeriod,
  viewRemoveLicences,
  viewReturnsPeriod,
  viewSelectRecipients
} from '../controllers/notices-setup.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: setup
    },
    path: '/notices/setup/{journey}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewAlertEmailAddress
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-email-address'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitAlertEmailAddress
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-email-address'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewAlertThresholds
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitAlertThresholds
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewAlertType
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-type'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitAlertType
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-type'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewCancelAlerts
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitCancelAlerts
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewCheckLicenceMatches
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitCheckLicenceMatches
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitCheckLicenceMatchesFilter
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches/filter'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: processRemoveThreshold
    },
    path: '/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: processAddRecipient
    },
    path: '/notices/setup/{sessionId}/add-recipient'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: viewCancel
    },
    path: '/notices/setup/{sessionId}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: submitCancel
    },
    path: '/notices/setup/{sessionId}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: viewCheck
    },
    path: '/notices/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: submitCheck
    },
    path: '/notices/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: viewCheckNoticeType
    },
    path: '/notices/setup/{sessionId}/check-notice-type'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: submitCheckNoticeType
    },
    path: '/notices/setup/{sessionId}/check-notice-type'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications', 'hof_notifications']
        }
      },
      handler: viewConfirmation
    },
    path: '/notices/setup/{eventId}/confirmation'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: viewContactType
    },
    path: '/notices/setup/{sessionId}/contact-type'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: submitContactType
    },
    path: '/notices/setup/{sessionId}/contact-type'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: processDownloadRecipients
    },
    path: '/notices/setup/{sessionId}/download'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewInvitationPeriod
    },
    path: '/notices/setup/{sessionId}/invitation-period'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: submitInvitationPeriod
    },
    path: '/notices/setup/{sessionId}/invitation-period'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: viewLicence
    },
    path: '/notices/setup/{sessionId}/licence'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: submitLicence
    },
    path: '/notices/setup/{sessionId}/licence'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: viewNoticeType
    },
    path: '/notices/setup/{sessionId}/notice-type'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: submitNoticeType
    },
    path: '/notices/setup/{sessionId}/notice-type'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewPaperReturn
    },
    path: '/notices/setup/{sessionId}/paper-return'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: submitPaperReturn
    },
    path: '/notices/setup/{sessionId}/paper-return'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      },
      handler: viewPreview
    },
    path: '/notices/setup/{sessionId}/preview/{contactHashId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewPreview
    },
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/alert/{licenceMonitoringStationId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewPreviewCheckAlert
    },
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/check-alert'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewPreviewCheckPaperReturn
    },
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/check-paper-return'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: processPreviewPaperReturn
    },
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/paper-return/{returnLogId}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewRecipientName
    },
    path: '/notices/setup/{sessionId}/recipient-name'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: submitRecipientName
    },
    path: '/notices/setup/{sessionId}/recipient-name'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewReminderPeriod
    },
    path: '/notices/setup/{sessionId}/reminder-period'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: submitReminderPeriod
    },
    path: '/notices/setup/{sessionId}/reminder-period'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewRemoveLicences
    },
    path: '/notices/setup/{sessionId}/remove-licences'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: submitRemoveLicences
    },
    path: '/notices/setup/{sessionId}/remove-licences'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: viewReturnsPeriod
    },
    path: '/notices/setup/{sessionId}/returns-period'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      },
      handler: submitReturnsPeriod
    },
    path: '/notices/setup/{sessionId}/returns-period'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: viewSelectRecipients
    },
    path: '/notices/setup/{sessionId}/select-recipients'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      },
      handler: submitSelectRecipients
    },
    path: '/notices/setup/{sessionId}/select-recipients'
  }
]
