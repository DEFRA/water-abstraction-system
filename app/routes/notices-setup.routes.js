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
  submitCheckNoticeType,
  submitContactType,
  submitLicence,
  submitNoticeType,
  submitPaperReturn,
  submitRecipientName,
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
  viewLicence,
  viewNoticeType,
  viewPaperReturn,
  viewPreview,
  viewPreviewCheckAlert,
  viewPreviewCheckPaperReturn,
  viewRecipientName,
  viewRemoveLicences,
  viewReturnsPeriod,
  viewSelectRecipients
} from '../controllers/notices-setup.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/notices/setup/{journey}',
    options: {
      handler: setup,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-email-address',
    options: {
      handler: viewAlertEmailAddress,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-email-address',
    options: {
      handler: submitAlertEmailAddress,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds',
    options: {
      handler: viewAlertThresholds,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds',
    options: {
      handler: submitAlertThresholds,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-type',
    options: {
      handler: viewAlertType,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/alert-type',
    options: {
      handler: submitAlertType,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/cancel',
    options: {
      handler: viewCancelAlerts,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/cancel',
    options: {
      handler: submitCancelAlerts,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches',
    options: {
      handler: viewCheckLicenceMatches,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches',
    options: {
      handler: submitCheckLicenceMatches,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/abstraction-alerts/remove-threshold/{licenceMonitoringStationId}',
    options: {
      handler: processRemoveThreshold,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/add-recipient',
    options: {
      handler: processAddRecipient,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/cancel',
    options: {
      handler: viewCancel,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/cancel',
    options: {
      handler: submitCancel,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/check',
    options: {
      handler: viewCheck,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/check',
    options: {
      handler: submitCheck,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/check-notice-type',
    options: {
      handler: viewCheckNoticeType,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/check-notice-type',
    options: {
      handler: submitCheckNoticeType,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{eventId}/confirmation',
    options: {
      handler: viewConfirmation,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications', 'hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/contact-type',
    options: {
      handler: viewContactType,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/contact-type',
    options: {
      handler: submitContactType,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/download',
    options: {
      handler: processDownloadRecipients,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/licence',
    options: {
      handler: viewLicence,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/licence',
    options: {
      handler: submitLicence,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/notice-type',
    options: {
      handler: viewNoticeType,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/notice-type',
    options: {
      handler: submitNoticeType,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/paper-return',
    options: {
      handler: viewPaperReturn,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/paper-return',
    options: {
      handler: submitPaperReturn,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}',
    options: {
      handler: viewPreview,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/alert/{licenceMonitoringStationId}',
    options: {
      handler: viewPreview,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/check-alert',
    options: {
      handler: viewPreviewCheckAlert,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/check-paper-return',
    options: {
      handler: viewPreviewCheckPaperReturn,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/preview/{contactHashId}/paper-return/{returnLogId}',
    options: {
      handler: processPreviewPaperReturn,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/recipient-name',
    options: {
      handler: viewRecipientName,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/recipient-name',
    options: {
      handler: submitRecipientName,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/remove-licences',
    options: {
      handler: viewRemoveLicences,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/remove-licences',
    options: {
      handler: submitRemoveLicences,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/returns-period',
    options: {
      handler: viewReturnsPeriod,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/returns-period',
    options: {
      handler: submitReturnsPeriod,
      auth: {
        access: {
          scope: ['bulk_return_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/setup/{sessionId}/select-recipients',
    options: {
      handler: viewSelectRecipients,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/setup/{sessionId}/select-recipients',
    options: {
      handler: submitSelectRecipients,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications']
        }
      }
    }
  }
]

export default routes
