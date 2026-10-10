export const KAFKA_TOPICS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged-in',
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
} as const;

export const KAFKA_GROUPS = {
  EMAIL_SERVICE: 'email-service-group',
  NOTIFICATION_SERVICE: 'notification-service-group',
  ANALYTICS_SERVICE: 'analytics-service-group',
} as const;