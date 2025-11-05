// Notification Components
export { default as StatusBadge } from './StatusBadge';
export { default as TypeBadge } from './TypeBadge';
export { default as ChannelBadge } from './ChannelBadge';
export { default as NotificationCard } from './NotificationCard';
export { default as AudienceSelector } from './AudienceSelector';
export { default as RichTextEditor } from './RichTextEditor';

// Types
export interface NotificationData {
  id: string;
  subject: string;
  message: string;
  type: 'system' | 'announcement' | 'reminder' | 'alert' | 'maintenance';
  status: 'sent' | 'draft' | 'scheduled' | 'failed';
  channels: ('email' | 'sms' | 'push' | 'app')[];
  audience: {
    type: 'all' | 'building' | 'unit' | 'custom';
    count: number;
    description: string;
  };
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  sentAt?: string;
  scheduledFor?: string;
  deliveryStats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  isRead?: boolean;
}

export type NotificationType =
  | 'system'
  | 'announcement'
  | 'reminder'
  | 'alert'
  | 'maintenance';
export type NotificationStatus = 'sent' | 'draft' | 'scheduled' | 'failed';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'app';
export type AudienceType = 'all' | 'building' | 'unit' | 'custom';

