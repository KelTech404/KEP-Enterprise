import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface AmbassadorContact {
  id: string;
  ambassador_name: string;
  church: string;
  pastor: string | null;
  ward: string | null;
  phone: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIPMonthlyReport {
  id: string;
  ambassador_id: string;
  reporting_month: string;
  seniors_served: number;
  seniors_served_first_time: number;
  social_isolation_activities: string[];
  independent_living_activities: string[];
  supportive_service_referrals: string[];
  benefits_enrollment_assisted: number;
  additional_resources_needed: string | null;
  connected_to_village: boolean;
  village_count: number | null;
  village_names: string[];
  unfulfilled_requests: boolean;
  unfulfilled_explanation: string | null;
  seniors_referred_followup: number;
  requested_director_call: boolean;
  monthly_highlight: string | null;
  project_concerns: string | null;
  created_at: string;
  ambassador_contacts?: AmbassadorContact;
}

export interface AIPReportWithAmbassador extends AIPMonthlyReport {
  ambassador_contacts: AmbassadorContact;
}

// Placeholder data - clearly marked for replacement
// PLACEHOLDER_START: Church list - replace with real church names when provided
export const PLACEHOLDER_CHURCHES = [
  'Church A',
  'Church B',
  'Church C',
  'Church D',
  'Church E',
  'Church F',
  'Church G',
  'Church H',
  'Church I',
  'Church J',
  'Church K',
  'Church L',
  'Church M',
  'Church N',
] as const;
// PLACEHOLDER_END: Church list

// PLACEHOLDER_START: Senior Village list - replace with real village names when provided
export const PLACEHOLDER_VILLAGES = [
  'Village A',
  'Village B',
  'Village C',
  'Village D',
  'Village E',
] as const;
// PLACEHOLDER_END: Senior Village list

// Activity options
export const SOCIAL_ISOLATION_ACTIVITIES = [
  'Technology Assistance',
  'Check-In phone calls or Visits',
  'Group Activities (Book Clubs, Bible Study, Outings, Social Gatherings)',
  'Transportation',
  'Mental Wellness Activities',
  'Other',
] as const;

export const INDEPENDENT_LIVING_ACTIVITIES = [
  'Assistance with Housing',
  'COVID Vaccination and Testing',
  'Food Support/Meals',
  'Groceries/Shopping/Errands',
  'Personal Hygiene Support',
  'Safe-at-Home (Home Safety Adaptations)',
  'Wellness/Fitness Activities',
  'Wellness Support',
  'Other',
] as const;

export const SUPPORTIVE_SERVICE_REFERRALS = [
  'Assistance with applications (SNAP, Energy Assistance, Medicare)',
  'Referral for Home Healthcare Aide',
  'Referral to Legal Aid',
  'Referral to a Village',
  'Referral to DACL',
  'Assistance with EDP Waiver',
  'Provided General Information',
  'Wellness/Fitness Activities',
  'Wellness Support',
  'Other',
] as const;
