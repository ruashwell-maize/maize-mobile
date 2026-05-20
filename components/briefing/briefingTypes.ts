import { COLORS } from '@/constants/theme';

export type BriefingItemType = 'update' | 'action' | 'risk' | 'decision';

export type BriefingResponse = 'acted' | 'delayed' | 'rejected';

export interface BriefingItem {
  id: string;
  type: BriefingItemType;
  title: string;
  body: string;
  project_name: string;
  urgency: 'low' | 'medium' | 'high';
  risk_consequence?: string;
  suggested_action?: string;
}

export const TYPE_CONFIG: Record<
  BriefingItemType,
  { label: string; color: string; bg: string }
> = {
  update:   { label: 'Update',   color: COLORS.ai,      bg: COLORS.aiLight },
  action:   { label: 'Action',   color: COLORS.success,  bg: COLORS.successLight },
  risk:     { label: 'Risk',     color: COLORS.amber,    bg: COLORS.amberLight },
  decision: { label: 'Decision', color: COLORS.danger,   bg: COLORS.dangerLight },
};

export const DELAY_REASONS = [
  'Waiting on more info',
  'Not the right time',
  'Need to check with someone',
  'Will handle this week',
];

export const MOCK_BRIEFING: BriefingItem[] = [
  {
    id: '1',
    type: 'action',
    title: 'Chase painter quote — overdue by 3 days',
    body: 'James Wilson (Painter) has not responded to your quote request sent Monday. The project timeline depends on this.',
    project_name: 'Kitchen Renovation',
    urgency: 'high',
    suggested_action: 'Send a follow-up message now',
  },
  {
    id: '2',
    type: 'risk',
    title: 'Plumber certificate not yet received',
    body: 'Your gas safety certificate from Smith Plumbing was due yesterday. Without it you cannot sign off the project.',
    project_name: 'Bathroom Refurb',
    urgency: 'high',
    risk_consequence: 'You will not be able to complete sign-off without this certificate.',
  },
  {
    id: '3',
    type: 'decision',
    title: 'Approve revised flooring spec',
    body: "Your contractor has submitted an alternative tile option at £12/m² (was £9/m²). Total uplift: £540. They need a decision today to keep the schedule.",
    project_name: 'Kitchen Renovation',
    urgency: 'medium',
  },
  {
    id: '4',
    type: 'update',
    title: 'Electrician work completed on schedule',
    body: 'All first-fix electrical work is done. No issues reported. Second fix is booked for next Thursday.',
    project_name: 'Extension Build',
    urgency: 'low',
  },
];
