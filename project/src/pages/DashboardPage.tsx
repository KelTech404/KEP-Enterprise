import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, AIPReportWithAmbassador, AmbassadorContact } from '../lib/supabase';
import { LogOut, Users, UserPlus, Bell, Phone, AlertTriangle, Calendar, Heart, MapPin, BarChart3, RefreshCw, Trash2, ArrowLeft } from 'lucide-react';
type TabType = 'AP' | 'KCV' | 'KCVKH' | 'Gateway';
type ViewMode = 'dashboard' | 'newAmbassador' | 'manageAmbassadors';

interface DashboardStats {
  submissionsToday: number;
  totalSeniorsServed: number;
  totalFirstTimeSeniors: number;
  totalBenefitsAssistance: number;
  totalConnectedToVillages: number;
  totalReferredForFollowup: number;
  pendingFollowupCount: number;
}

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('AP');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [reports, setReports] = useState<AIPReportWithAmbassador[]>([]);
  const [ambassadors, setAmbassadors] = useState<AmbassadorContact[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    submissionsToday: 0,
    totalSeniorsServed: 0,
    totalFirstTimeSeniors: 0,
    totalBenefitsAssistance: 0,
    totalConnectedToVillages: 0,
    totalReferredForFollowup: 0,
    pendingFollowupCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    action: 'add' | 'delete' | 'edit';
    ambassador?: AmbassadorContact;
  }>({ show: false, action: 'add' });

  useEffect(() => {
    if (activeTab === 'AP') {
      loadAPData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (viewMode === 'manageAmbassadors') {
      loadAmbassadors();
    }
  }, [viewMode]);

  async function loadAPData() {
    setLoading(true);
    setError(null);

    try {
      // Load reports with ambassador data
      const { data: reportsData, error: reportsError } = await supabase
        .from('aip_monthly_reports')
        .select(`
          *,
          ambassador_contacts!ambassador_id (*)
        `)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const typedReports = (reportsData || []) as AIPReportWithAmbassador[];
      setReports(typedReports);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysReports = typedReports.filter(r => new Date(r.created_at) >= today);

      const pendingFollowups = typedReports.filter(
        r => r.unfulfilled_requests || r.requested_director_call
      );

      setStats({
        submissionsToday: todaysReports.length,
        totalSeniorsServed: typedReports.reduce((sum, r) => sum + r.seniors_served, 0),
        totalFirstTimeSeniors: typedReports.reduce((sum, r) => sum + r.seniors_served_first_time, 0),
        totalBenefitsAssistance: typedReports.reduce((sum, r) => sum + r.benefits_enrollment_assisted, 0),
        totalConnectedToVillages: typedReports.reduce((sum, r) => sum + (r.connected_to_village ? r.village_count || 0 : 0), 0),
        totalReferredForFollowup: typedReports.reduce((sum, r) => sum + r.seniors_referred_followup, 0),
        pendingFollowupCount: pendingFollowups.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function handleNewAmbassadorSuccess() {
    setViewMode('dashboard');
    if (activeTab === 'AP') {
      loadAPData();
    }
  }

  async function loadAmbassadors() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: ambassadorsError } = await supabase
        .from('ambassador_contacts')
        .select('*')
        .order('ambassador_name');

      if (ambassadorsError) throw ambassadorsError;
      setAmbassadors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ambassadors');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAmbassador(ambassador: AmbassadorContact) {
    setConfirmDialog({ show: true, action: 'delete', ambassador });
  }

  async function confirmDeleteAmbassador() {
    if (!confirmDialog.ambassador) return;

    try {
      const { error } = await supabase
        .from('ambassador_contacts')
        .update({ is_active: false })
        .eq('id', confirmDialog.ambassador.id);

      if (error) throw error;

      setConfirmDialog({ show: false, action: 'add' });
      loadAmbassadors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ambassador');
    }
  }

  function handleAddAmbassador() {
    setViewMode('newAmbassador');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold">K Enterprise</span>
                <span className="text-xs text-primary-100">Business Management Center</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('manageAmbassadors')}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Manage Ambassadors
              </button>
              <button
                onClick={() => setViewMode('newAmbassador')}
                className="btn-accent text-sm flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                New Ambassador
              </button>
              <div className="text-sm text-primary-100">
                {user?.email}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1 text-sm text-primary-100 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'newAmbassador' ? (
          <NewAmbassadorForm
            onCancel={() => setViewMode('dashboard')}
            onSuccess={handleNewAmbassadorSuccess}
          />
        ) : viewMode === 'manageAmbassadors' ? (
          <AmbassadorManagement
            ambassadors={ambassadors}
            loading={loading}
            error={error}
            onRefresh={loadAmbassadors}
            onDelete={handleDeleteAmbassador}
            onBack={() => setViewMode('dashboard')}
            onAddNew={handleAddAmbassador}
          />
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
              <TabButton
                active={activeTab === 'AP'}
                onClick={() => setActiveTab('AP')}
                notificationCount={activeTab !== 'AP' ? stats.pendingFollowupCount : 0}
              >
                AP
              </TabButton>
              <TabButton active={activeTab === 'KCV'} onClick={() => setActiveTab('KCV')}>
                KCV
              </TabButton>
              <TabButton active={activeTab === 'KCVKH'} onClick={() => setActiveTab('KCVKH')}>
                KCV-K-H
              </TabButton>
              <TabButton active={activeTab === 'Gateway'} onClick={() => setActiveTab('Gateway')}>
                Gateway (Afterschool)
              </TabButton>
            </div>

            {/* Tab Content */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
                {error}
              </div>
            )}

            {activeTab === 'AP' && (
              loading ? (
                <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
              ) : (
                <APDashboard
                  stats={stats}
                  reports={reports}
                  onRefresh={loadAPData}
                />
              )
            )}

            {activeTab !== 'AP' && (
              <ComingSoonPlaceholder program={activeTab} />
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.action === 'delete' ? 'Delete Ambassador' : 'Confirm Action'}
          message={
            confirmDialog.action === 'delete' && confirmDialog.ambassador
              ? `Are you sure you want to delete ${confirmDialog.ambassador.ambassador_name} from ${confirmDialog.ambassador.church}? This action cannot be undone.`
              : 'Are you sure you want to proceed?'
          }
          onConfirm={() => {
            if (confirmDialog.action === 'delete') {
              confirmDeleteAmbassador();
            } else {
              setConfirmDialog({ show: false, action: 'add' });
            }
          }}
          onCancel={() => setConfirmDialog({ show: false, action: 'add' })}
        />
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  notificationCount?: number;
}

function TabButton({ active, onClick, children, notificationCount }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 font-medium rounded-t-lg transition-all ${
        active
          ? 'bg-secondary text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
      {notificationCount && notificationCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {notificationCount}
        </span>
      )}
    </button>
  );
}

interface APDashboardProps {
  stats: DashboardStats;
  reports: AIPReportWithAmbassador[];
  onRefresh: () => void;
}

function APDashboard({ stats, reports, onRefresh }: APDashboardProps) {
  const pendingFollowups = reports.filter(
    r => r.unfulfilled_requests || r.requested_director_call
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Submissions Today"
          value={stats.submissionsToday}
          color="primary"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Seniors Served"
          value={stats.totalSeniorsServed}
          color="secondary"
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="First-Time Seniors"
          value={stats.totalFirstTimeSeniors}
          color="accent"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Benefits Assistance"
          value={stats.totalBenefitsAssistance}
          color="primary"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          label="Seniors Connected to Villages"
          value={stats.totalConnectedToVillages}
          color="secondary"
        />
        <StatCard
          icon={<Phone className="w-5 h-5" />}
          label="Referred for Follow-up"
          value={stats.totalReferredForFollowup}
          color="accent"
        />
      </div>

      {/* Ambassador Followup Request Panel */}
      {pendingFollowups.length > 0 && (
        <div className="card border-l-4 border-l-accent">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Ambassador Followup Request Received</h2>
          </div>
          <div className="space-y-3">
            {pendingFollowups.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between p-4 bg-accent/5 rounded-lg border border-accent/20"
              >
                <div>
                  <p className="font-medium">
                    {report.ambassador_contacts?.ambassador_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {report.ambassador_contacts?.church || 'Unknown Church'}
                  </p>
                  <div className="mt-2 text-sm space-y-1">
                    {report.unfulfilled_requests && (
                      <p className="text-accent-700">
                        <strong>Unfulfilled Request:</strong> {report.unfulfilled_explanation}
                      </p>
                    )}
                    {report.requested_director_call && (
                      <p className="text-secondary-700">
                        Requested a support call with KCV Director
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Submissions</h2>
          <button
            onClick={onRefresh}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No submissions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Ambassador</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Church</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Seniors</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">First-Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 20).map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {report.ambassador_contacts?.ambassador_name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      {report.ambassador_contacts?.church || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(report.reporting_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right">{report.seniors_served}</td>
                    <td className="py-3 px-4 text-right">{report.seniors_served_first_time}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'secondary' | 'accent';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
  };

  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}

interface ComingSoonPlaceholderProps {
  program: string;
}

function ComingSoonPlaceholder({ program }: ComingSoonPlaceholderProps) {
  return (
    <div className="card text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-600 mb-2">
        {program} Dashboard
      </h2>
      <p className="text-gray-500">
        Phase 2 — coming soon
      </p>
    </div>
  );
}

interface NewAmbassadorFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface AmbassadorManagementProps {
  ambassadors: AmbassadorContact[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onDelete: (ambassador: AmbassadorContact) => void;
  onBack: () => void;
  onAddNew: () => void;
}

function AmbassadorManagement({ ambassadors, loading, error, onRefresh, onDelete, onBack, onAddNew }: AmbassadorManagementProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <button onClick={onAddNew} className="btn-accent flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add New Ambassador
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ambassador Management</h2>
          <button onClick={onRefresh} className="text-sm text-primary hover:underline flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading ambassadors...</div>
        ) : ambassadors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No ambassadors found. Click "Add New Ambassador" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Church</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ambassadors.map((ambassador) => (
                  <tr key={ambassador.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{ambassador.ambassador_name}</td>
                    <td className="py-3 px-4">{ambassador.church}</td>
                    <td className="py-3 px-4">{ambassador.email}</td>
                    <td className="py-3 px-4">{ambassador.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ambassador.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ambassador.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDelete(ambassador)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Ambassador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="btn-outline">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-accent">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function NewAmbassadorForm({ onCancel, onSuccess }: NewAmbassadorFormProps) {
  const [formData, setFormData] = useState({
    ambassador_name: '',
    church: '',
    pastor: '',
    ward: '',
    phone: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PLACEHOLDER: Church list
  const churches = [
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
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('ambassador_contacts')
        .insert([{
          ambassador_name: formData.ambassador_name,
          church: formData.church,
          pastor: formData.pastor || null,
          ward: formData.ward || null,
          phone: formData.phone || null,
          email: formData.email,
        }]);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('An ambassador with this email already exists.');
        }
        throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ambassador');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          New Ambassador Setup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">
                Ambassador Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.ambassador_name}
                onChange={(e) => setFormData(prev => ({ ...prev, ambassador_name: e.target.value }))}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Church <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="select-field"
                value={formData.church}
                onChange={(e) => setFormData(prev => ({ ...prev, church: e.target.value }))}
              >
                <option value="">Select a church...</option>
                {churches.map((church) => (
                  <option key={church} value={church}>{church}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Pastor</label>
              <input
                type="text"
                className="input-field"
                value={formData.pastor}
                onChange={(e) => setFormData(prev => ({ ...prev, pastor: e.target.value }))}
                placeholder="Pastor name (optional)"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Ward</label>
              <input
                type="text"
                className="input-field"
                value={formData.ward}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                placeholder="Ward (optional)"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number (optional)"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Ambassador'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
