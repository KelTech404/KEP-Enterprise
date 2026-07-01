import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase, AIPMonthlyReport, AmbassadorContact } from '../lib/supabase';
import { LogOut, Users, Clock, FileText, BarChart3, Heart, MapPin, Phone, CheckCircle2, RefreshCw } from 'lucide-react';

interface AmbassadorStats {
  totalSeniorsServed: number;
  totalFirstTimeSeniors: number;
  totalBenefitsAssistance: number;
  totalConnectedToVillages: number;
  totalReferredForFollowup: number;
  socialIsolationActivities: number;
  independentLivingActivities: number;
  foodAssistance: number;
  transportationAssistance: number;
  healthWellnessActivities: number;
}

export function AmbassadorPortalPage() {
  const { user, signOut } = useAuth();
  const [ambassador, setAmbassador] = useState<AmbassadorContact | null>(null);
  const [reports, setReports] = useState<AIPMonthlyReport[]>([]);
  const [stats, setStats] = useState<AmbassadorStats>({
    totalSeniorsServed: 0,
    totalFirstTimeSeniors: 0,
    totalBenefitsAssistance: 0,
    totalConnectedToVillages: 0,
    totalReferredForFollowup: 0,
    socialIsolationActivities: 0,
    independentLivingActivities: 0,
    foodAssistance: 0,
    transportationAssistance: 0,
    healthWellnessActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadAmbassadorData();
    }
  }, [user?.email]);

  async function loadAmbassadorData() {
    setLoading(true);
    setError(null);

    try {
      // Load ambassador info
      const { data: ambassadorData, error: ambassadorError } = await supabase
        .from('ambassador_contacts')
        .select('*')
        .eq('email', user?.email)
        .eq('is_active', true)
        .single();

      if (ambassadorError) throw ambassadorError;
      setAmbassador(ambassadorData);

      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('aip_monthly_reports')
        .select('*')
        .eq('ambassador_id', ambassadorData?.id)
        .order('reporting_month', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Calculate stats
      calculateStats(reportsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(reportData: AIPMonthlyReport[]) {
    const stats: AmbassadorStats = {
      totalSeniorsServed: reportData.reduce((sum, r) => sum + r.seniors_served, 0),
      totalFirstTimeSeniors: reportData.reduce((sum, r) => sum + r.seniors_served_first_time, 0),
      totalBenefitsAssistance: reportData.reduce((sum, r) => sum + r.benefits_enrollment_assisted, 0),
      totalConnectedToVillages: reportData.reduce((sum, r) => sum + (r.connected_to_village ? r.village_count || 0 : 0), 0),
      totalReferredForFollowup: reportData.reduce((sum, r) => sum + r.seniors_referred_followup, 0),
      socialIsolationActivities: 0,
      independentLivingActivities: 0,
      foodAssistance: 0,
      transportationAssistance: 0,
      healthWellnessActivities: 0,
    };

    // Categorize activities
    reportData.forEach(report => {
      report.social_isolation_activities.forEach(activity => {
        if (activity.toLowerCase().includes('transportation')) {
          stats.transportationAssistance++;
        } else if (activity.toLowerCase().includes('wellness') || activity.toLowerCase().includes('mental')) {
          stats.healthWellnessActivities++;
        } else {
          stats.socialIsolationActivities++;
        }
      });

      report.independent_living_activities.forEach(activity => {
        if (activity.toLowerCase().includes('food') || activity.toLowerCase().includes('meal')) {
          stats.foodAssistance++;
        } else if (activity.toLowerCase().includes('transportation')) {
          stats.transportationAssistance++;
        } else if (activity.toLowerCase().includes('wellness')) {
          stats.healthWellnessActivities++;
        } else {
          stats.independentLivingActivities++;
        }
      });
    });

    setStats(stats);
  }

  function getDaysUntilDeadline() {
    const now = new Date();
    const deadline = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    if (now.getDate() > 10) {
      deadline.setMonth(deadline.getMonth() + 1);
    }
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const daysUntilDeadline = getDaysUntilDeadline();
  const isUrgent = daysUntilDeadline <= 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading your portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold">KEP Enterprise</span>
                <span className="text-xs text-secondary-100">Ambassador Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-secondary-100">
                {ambassador?.ambassador_name}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1 text-sm text-secondary-100 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Deadline Countdown */}
        <div className={`card border-l-4 ${isUrgent ? 'border-l-accent bg-accent/5' : 'border-l-success bg-success/5'} mb-6`}>
          <div className="flex items-center gap-3">
            <Clock className={`w-6 h-6 ${isUrgent ? 'text-accent' : 'text-success'}`} />
            <div>
              <h2 className={`text-lg font-semibold ${isUrgent ? 'text-accent' : 'text-success'}`}>
                {isUrgent ? 'Deadline Approaching!' : 'Monthly Report Deadline'}
              </h2>
              <p className="text-gray-700 text-lg">
                {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} until the 10th
              </p>
            </div>
          </div>
        </div>

        {/* Impact Analytics */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Impact</h2>
            </div>
            <button
              onClick={loadAmbassadorData}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <ImpactStatCard
              icon={<Heart className="w-5 h-5" />}
              label="Seniors Served"
              value={stats.totalSeniorsServed}
              color="primary"
            />
            <ImpactStatCard
              icon={<Users className="w-5 h-5" />}
              label="First-Time Seniors"
              value={stats.totalFirstTimeSeniors}
              color="secondary"
            />
            <ImpactStatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Benefits Assistance"
              value={stats.totalBenefitsAssistance}
              color="accent"
            />
            <ImpactStatCard
              icon={<MapPin className="w-5 h-5" />}
              label="Connected to Villages"
              value={stats.totalConnectedToVillages}
              color="success"
            />
          </div>

          <h3 className="font-semibold text-foreground mb-3">Activity Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ImpactStatCard
              icon={<Users className="w-5 h-5" />}
              label="Social Activities"
              value={stats.socialIsolationActivities}
              color="primary"
            />
            <ImpactStatCard
              icon={<MapPin className="w-5 h-5" />}
              label="Living Support"
              value={stats.independentLivingActivities}
              color="secondary"
            />
            <ImpactStatCard
              icon={<Heart className="w-5 h-5" />}
              label="Food Assistance"
              value={stats.foodAssistance}
              color="accent"
            />
            <ImpactStatCard
              icon={<Phone className="w-5 h-5" />}
              label="Transportation"
              value={stats.transportationAssistance}
              color="success"
            />
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Reports</h2>
            </div>
            <Link
              to="/ambassador-report"
              className="btn-accent text-sm"
            >
              Submit New Report
            </Link>
          </div>

          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reports submitted yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Seniors</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">First-Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
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
    </div>
  );
}

interface ImpactStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'secondary' | 'accent' | 'success';
}

function ImpactStatCard({ icon, label, value, color }: ImpactStatCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
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
