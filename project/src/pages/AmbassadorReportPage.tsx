import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, AmbassadorContact, PLACEHOLDER_VILLAGES, SOCIAL_ISOLATION_ACTIVITIES, INDEPENDENT_LIVING_ACTIVITIES, SUPPORTIVE_SERVICE_REFERRALS } from '../lib/supabase';
import { isDeadlinePassed, getDaysUntilDeadline } from '../lib/deadline';
import { ArrowLeft, CheckCircle2, Users, Phone, Heart, MapPin, Send, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormData {
  ambassador_id: string;
  reporting_month: string;
  seniors_served: number;
  seniors_served_first_time: number;
  social_isolation_activities: string[];
  social_isolation_other: string;
  independent_living_activities: string[];
  independent_living_other: string;
  supportive_service_referrals: string[];
  supportive_service_other: string;
  benefits_enrollment_assisted: number;
  additional_resources_needed: string;
  connected_to_village: boolean;
  village_count: number;
  village_names: string[];
  unfulfilled_requests: boolean;
  unfulfilled_explanation: string;
  seniors_referred_followup: number;
  requested_director_call: boolean;
  monthly_highlight: string;
  project_concerns: string;
}

const initialFormData: FormData = {
  ambassador_id: '',
  reporting_month: '',
  seniors_served: 0,
  seniors_served_first_time: 0,
  social_isolation_activities: [],
  social_isolation_other: '',
  independent_living_activities: [],
  independent_living_other: '',
  supportive_service_referrals: [],
  supportive_service_other: '',
  benefits_enrollment_assisted: 0,
  additional_resources_needed: '',
  connected_to_village: false,
  village_count: 0,
  village_names: [],
  unfulfilled_requests: false,
  unfulfilled_explanation: '',
  seniors_referred_followup: 0,
  requested_director_call: false,
  monthly_highlight: '',
  project_concerns: '',
};

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function AmbassadorReportPage() {
  const { user } = useAuth();
  const [ambassador, setAmbassador] = useState<AmbassadorContact | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const deadlinePassed = isDeadlinePassed();
  const daysUntilDeadline = getDaysUntilDeadline();

  useEffect(() => {
    if (user?.email) {
      loadAmbassadorInfo();
    }
  }, [user]);

  async function loadAmbassadorInfo() {
    try {
      const { data, error } = await supabase
        .from('ambassador_contacts')
        .select('*')
        .eq('email', user?.email)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (data) {
        setAmbassador(data);
        setFormData(prev => ({ ...prev, ambassador_id: data.id }));
      }
    } catch {
      setErrorMessage('Failed to load ambassador information');
    } finally {
      setLoading(false);
    }
  }

  function handleCheckboxChange(
    field: keyof FormData,
    value: string,
    checked: boolean
  ) {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      return { ...prev, [field]: newArray };
    });
  }

  function handleBooleanToggle(field: keyof FormData, value: boolean) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (deadlinePassed) {
      setErrorMessage('The submission deadline has passed. Please contact staff if you need to submit a late report.');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    try {
      const reportData = {
        ambassador_id: formData.ambassador_id,
        reporting_month: formData.reporting_month + '-01',
        seniors_served: formData.seniors_served,
        seniors_served_first_time: formData.seniors_served_first_time,
        social_isolation_activities: [
          ...formData.social_isolation_activities,
          ...(formData.social_isolation_activities.includes('Other') && formData.social_isolation_other
            ? [`Other: ${formData.social_isolation_other}`]
            : []),
        ],
        independent_living_activities: [
          ...formData.independent_living_activities,
          ...(formData.independent_living_activities.includes('Other') && formData.independent_living_other
            ? [`Other: ${formData.independent_living_other}`]
            : []),
        ],
        supportive_service_referrals: [
          ...formData.supportive_service_referrals,
          ...(formData.supportive_service_referrals.includes('Other') && formData.supportive_service_other
            ? [`Other: ${formData.supportive_service_other}`]
            : []),
        ],
        benefits_enrollment_assisted: formData.benefits_enrollment_assisted,
        additional_resources_needed: formData.additional_resources_needed || null,
        connected_to_village: formData.connected_to_village,
        village_count: formData.connected_to_village ? formData.village_count : null,
        village_names: formData.connected_to_village ? formData.village_names : [],
        unfulfilled_requests: formData.unfulfilled_requests,
        unfulfilled_explanation: formData.unfulfilled_requests ? formData.unfulfilled_explanation : null,
        seniors_referred_followup: formData.seniors_referred_followup,
        requested_director_call: formData.requested_director_call,
        monthly_highlight: formData.monthly_highlight || null,
        project_concerns: formData.project_concerns || null,
        edited_at: new Date().toISOString(),
        edited_by: user?.id,
      };

      const { error } = await supabase
        .from('aip_monthly_reports')
        .insert([reportData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData(initialFormData);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <SuccessScreen onReset={() => setSubmitStatus('idle')} />
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <Link to="/ambassador-portal" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AP Ambassador Monthly Report</h1>
            <p className="text-gray-600">Submit your monthly activities and impact</p>
          </div>
        </div>
      </div>

      {/* Deadline Warning */}
      {deadlinePassed ? (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-lg text-red-700">
              <p className="font-medium mb-1">Submission Deadline Passed</p>
              <p>The deadline for this month's report has passed. Please contact program staff if you need to submit a late report.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`mb-8 border rounded-xl p-6 ${daysUntilDeadline <= 3 ? 'bg-accent/10 border-accent/30' : 'bg-success/10 border-success/30'}`}>
          <div className="flex items-start gap-4">
            <AlertCircle className={`w-6 h-6 ${daysUntilDeadline <= 3 ? 'text-accent' : 'text-success'} flex-shrink-0 mt-0.5`} />
            <div className="text-lg">
              <p className={`font-medium mb-1 ${daysUntilDeadline <= 3 ? 'text-accent' : 'text-success'}`}>
                {daysUntilDeadline <= 3 ? 'Deadline Approaching' : 'Report Deadline'}
              </p>
              <p className="text-gray-700">
                {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining until the 10th
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Your Information */}
        <FormSection title="Your Information" icon={<Users className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Ambassador Name
              </label>
              <input
                type="text"
                className="input-field text-lg bg-gray-50"
                value={ambassador?.ambassador_name || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">
                Reporting Month *
              </label>
              <input
                type="month"
                required
                className="input-field text-lg"
                value={formData.reporting_month}
                onChange={(e) => setFormData(prev => ({ ...prev, reporting_month: e.target.value }))}
                disabled={deadlinePassed}
              />
            </div>
          </div>
        </FormSection>

        {/* Section: Seniors Served */}
        <FormSection title="Seniors Served" icon={<Heart className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Seniors served this month
              </label>
              <input
                type="number"
                min="0"
                className="input-field text-lg"
                value={formData.seniors_served}
                onChange={(e) => setFormData(prev => ({ ...prev, seniors_served: parseInt(e.target.value) || 0 }))}
                disabled={deadlinePassed}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">
                First-time seniors served this month
              </label>
              <input
                type="number"
                min="0"
                className="input-field text-lg"
                value={formData.seniors_served_first_time}
                onChange={(e) => setFormData(prev => ({ ...prev, seniors_served_first_time: parseInt(e.target.value) || 0 }))}
                disabled={deadlinePassed}
              />
            </div>
          </div>
        </FormSection>

        {/* Section: Activities to Combat Social Isolation */}
        <FormSection title="Activities to Combat Social Isolation" icon={<Users className="w-5 h-5" />}>
          <p className="text-gray-600 mb-4 text-lg">Select all activities you provided this month:</p>
          <div className="space-y-3">
            {SOCIAL_ISOLATION_ACTIVITIES.map((activity) => (
              <CheckboxField
                key={activity}
                label={activity}
                checked={formData.social_isolation_activities.includes(activity)}
                onChange={(checked) => handleCheckboxChange('social_isolation_activities', activity, checked)}
                disabled={deadlinePassed}
              />
            ))}
          </div>
          {formData.social_isolation_activities.includes('Other') && (
            <div className="mt-4 ml-8">
              <label className="block text-lg font-medium mb-2">
                Please describe other activities:
              </label>
              <input
                type="text"
                className="input-field text-lg"
                value={formData.social_isolation_other}
                onChange={(e) => setFormData(prev => ({ ...prev, social_isolation_other: e.target.value }))}
                placeholder="Describe the other activities..."
                disabled={deadlinePassed}
              />
            </div>
          )}
        </FormSection>

        {/* Section: Activities to Support Independent Living */}
        <FormSection title="Activities to Support Independent Living" icon={<MapPin className="w-5 h-5" />}>
          <p className="text-gray-600 mb-4 text-lg">Select all activities you provided this month:</p>
          <div className="space-y-3">
            {INDEPENDENT_LIVING_ACTIVITIES.map((activity) => (
              <CheckboxField
                key={activity}
                label={activity}
                checked={formData.independent_living_activities.includes(activity)}
                onChange={(checked) => handleCheckboxChange('independent_living_activities', activity, checked)}
                disabled={deadlinePassed}
              />
            ))}
          </div>
          {formData.independent_living_activities.includes('Other') && (
            <div className="mt-4 ml-8">
              <label className="block text-lg font-medium mb-2">
                Please describe other activities:
              </label>
              <input
                type="text"
                className="input-field text-lg"
                value={formData.independent_living_other}
                onChange={(e) => setFormData(prev => ({ ...prev, independent_living_other: e.target.value }))}
                placeholder="Describe the other activities..."
                disabled={deadlinePassed}
              />
            </div>
          )}
        </FormSection>

        {/* Section: Referrals to Supportive Services */}
        <FormSection title="Referrals to Supportive Services" icon={<Phone className="w-5 h-5" />}>
          <p className="text-gray-600 mb-4 text-lg">Select all referrals you made this month:</p>
          <div className="space-y-3">
            {SUPPORTIVE_SERVICE_REFERRALS.map((referral) => (
              <CheckboxField
                key={referral}
                label={referral}
                checked={formData.supportive_service_referrals.includes(referral)}
                onChange={(checked) => handleCheckboxChange('supportive_service_referrals', referral, checked)}
                disabled={deadlinePassed}
              />
            ))}
          </div>
          {formData.supportive_service_referrals.includes('Other') && (
            <div className="mt-4 ml-8">
              <label className="block text-lg font-medium mb-2">
                Please describe other referrals:
              </label>
              <input
                type="text"
                className="input-field text-lg"
                value={formData.supportive_service_other}
                onChange={(e) => setFormData(prev => ({ ...prev, supportive_service_other: e.target.value }))}
                placeholder="Describe the other referrals..."
                disabled={deadlinePassed}
              />
            </div>
          )}
        </FormSection>

        {/* Section: Benefits & Resources */}
        <FormSection title="Benefits & Resources" icon={<CheckCircle2 className="w-5 h-5" />}>
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Seniors assisted with benefits enrollment/recertification
              </label>
              <input
                type="number"
                min="0"
                className="input-field text-lg max-w-xs"
                value={formData.benefits_enrollment_assisted}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits_enrollment_assisted: parseInt(e.target.value) || 0 }))}
                disabled={deadlinePassed}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">
                Additional resources that would help support seniors
              </label>
              <textarea
                rows={4}
                className="input-field text-lg"
                value={formData.additional_resources_needed}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_resources_needed: e.target.value }))}
                placeholder="Describe any resources or support that would be helpful..."
                disabled={deadlinePassed}
              />
            </div>
          </div>
        </FormSection>

        {/* Section: Senior Villages */}
        <FormSection title="Senior Villages" icon={<MapPin className="w-5 h-5" />}>
          <div className="space-y-6">
            <ToggleField
              label="Connected a senior with a Senior Village this period?"
              checked={formData.connected_to_village}
              onChange={(checked) => handleBooleanToggle('connected_to_village', checked)}
              disabled={deadlinePassed}
            />
            {formData.connected_to_village && (
              <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-lg font-medium mb-2">
                    How many seniors?
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field text-lg max-w-xs"
                    value={formData.village_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, village_count: parseInt(e.target.value) || 0 }))}
                    disabled={deadlinePassed}
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">
                    Which village(s)?
                  </label>
                  <select
                    multiple
                    className="input-field text-lg min-h-[120px]"
                    value={formData.village_names}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({ ...prev, village_names: selected }));
                    }}
                    disabled={deadlinePassed}
                  >
                    {PLACEHOLDER_VILLAGES.map((village) => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        {/* Section: Requests & Follow-up */}
        <FormSection title="Requests & Follow-up" icon={<Phone className="w-5 h-5" />}>
          <div className="space-y-6">
            <ToggleField
              label="Any requests unable to be fulfilled?"
              checked={formData.unfulfilled_requests}
              onChange={(checked) => handleBooleanToggle('unfulfilled_requests', checked)}
              disabled={deadlinePassed}
            />
            {formData.unfulfilled_requests && (
              <div className="ml-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-lg font-medium mb-2">
                  Please explain:
                </label>
                <textarea
                  rows={4}
                  className="input-field text-lg"
                  value={formData.unfulfilled_explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, unfulfilled_explanation: e.target.value }))}
                  placeholder="Describe what requests couldn't be fulfilled..."
                  disabled={deadlinePassed}
                />
              </div>
            )}

            <div>
              <label className="block text-lg font-medium mb-2">
                Seniors referred for follow-up support
              </label>
              <input
                type="number"
                min="0"
                className="input-field text-lg max-w-xs"
                value={formData.seniors_referred_followup}
                onChange={(e) => setFormData(prev => ({ ...prev, seniors_referred_followup: parseInt(e.target.value) || 0 }))}
                disabled={deadlinePassed}
              />
            </div>

            <ToggleField
              label="Request a support call with the KCV Director?"
              checked={formData.requested_director_call}
              onChange={(checked) => handleBooleanToggle('requested_director_call', checked)}
              disabled={deadlinePassed}
            />
          </div>
        </FormSection>

        {/* Section: Wrap-up */}
        <FormSection title="Wrap-up" icon={<CheckCircle2 className="w-5 h-5" />}>
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Highlight or significant activity for the month
              </label>
              <textarea
                rows={4}
                className="input-field text-lg"
                value={formData.monthly_highlight}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_highlight: e.target.value }))}
                placeholder="Share something meaningful that happened this month..."
                disabled={deadlinePassed}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">
                Project concerns / recommendations for improvement
              </label>
              <textarea
                rows={4}
                className="input-field text-lg"
                value={formData.project_concerns}
                onChange={(e) => setFormData(prev => ({ ...prev, project_concerns: e.target.value }))}
                placeholder="Share any concerns or suggestions..."
                disabled={deadlinePassed}
              />
            </div>
          </div>
        </FormSection>

        {/* Submit Button */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <p className="font-medium">Error submitting report</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        <div className="pt-4 pb-8">
          <button
            type="submit"
            disabled={submitStatus === 'submitting' || deadlinePassed || !formData.reporting_month}
            className="btn-accent text-lg w-full md:w-auto flex items-center justify-center gap-2 min-h-[56px]"
          >
            {submitStatus === 'submitting' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Monthly Report
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div className="form-section">
      <h2 className="form-section-title flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function CheckboxField({ label, checked, onChange, disabled }: CheckboxFieldProps) {
  return (
    <label className={`flex items-center gap-4 cursor-pointer py-2 min-h-[48px] hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox-field"
        disabled={disabled}
      />
      <span className="text-lg">{label}</span>
    </label>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleField({ label, checked, onChange, disabled }: ToggleFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-lg font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative w-16 h-10 rounded-full transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
          checked ? 'bg-secondary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-lg font-medium">{checked ? 'Yes' : 'No'}</span>
    </div>
  );
}

interface SuccessScreenProps {
  onReset: () => void;
}

function SuccessScreen({ onReset }: SuccessScreenProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Report Submitted Successfully!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your dedicated service this month. Your report has been received and recorded.
        </p>
        <p className="text-base text-gray-500 mb-8">
          Your contributions make a real difference in the lives of the seniors we serve.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onReset} className="btn-primary text-lg">
            Submit Another Report
          </button>
          <Link to="/ambassador-portal" className="btn-outline text-lg">
            Return to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
