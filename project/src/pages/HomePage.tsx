import { Link } from 'react-router-dom';
import { Users, BookOpen, Phone, Heart, LogIn, BarChart3 } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold">KEP Enterprise</span>
                <span className="text-xs sm:text-sm text-primary-100">Non-Profit Management Center</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/ambassador-login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Ambassador Login</span>
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-600 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Staff Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="whitespace-nowrap">Empowering Communities,</span><br />
              <span className="text-accent">One Connection at a Time</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-10 leading-relaxed">
              A unified platform for managing senior services, ambassador programs, and community outreach initiatives across all programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ambassador-login"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-6 h-6" />
                Ambassador Portal
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border-2 border-white/30"
              >
                <LogIn className="w-6 h-6" />
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Programs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Coordinating multiple community service programs under one unified management platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProgramCard
              icon={<Users className="w-8 h-8" />}
              title="AP Program"
              description="Age in Place Ambassador Program connecting seniors with vital community resources and support services."
              color="primary"
              active={true}
            />
            <ProgramCard
              icon={<Heart className="w-8 h-8" />}
              title="KCSV Program"
              description="Community Village program providing localized support and wellness initiatives."
              color="secondary"
              active={false}
            />
            <ProgramCard
              icon={<BookOpen className="w-8 h-8" />}
              title="KCV-K-H"
              description="Specialized neighborhood outreach and family engagement programs."
              color="accent"
              active={false}
            />
            <ProgramCard
              icon={<Phone className="w-8 h-8" />}
              title="Gateway (Afterschool)"
              description="Youth development and educational support programs for students."
              color="success"
              active={false}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamlined workflows for program support staff.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureStep
              number={1}
              title="Ambassadors Report Monthly"
              description="Ambassadors submit monthly reports through a simple, accessible form—no login required."
            />
            <FeatureStep
              number={2}
              title="Staff Reviews Submissions"
              description="Program staff access a unified dashboard to review reports, track metrics, and identify needs."
            />
            <FeatureStep
              number={3}
              title="Impact is Measured"
              description="Aggregate data across programs shows community impact and informs future initiatives."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-secondary to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">4</p>
              <p className="text-secondary-100">Active Programs</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">14</p>
              <p className="text-secondary-100">Partner Churches</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">100%</p>
              <p className="text-secondary-100">Reporting Rate</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold mb-2">24/7</p>
              <p className="text-secondary-100">Platform Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Quick Actions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access the tools you need most.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <QuickActionCard
              icon={<LogIn className="w-7 h-7" />}
              title="Ambassador Portal"
              description="Access your ambassador dashboard and submit reports"
              to="/ambassador-login"
              color="accent"
            />
            <QuickActionCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Staff Dashboard"
              description="Access program dashboards and analytics"
              to="/login"
              color="primary"
            />
            <QuickActionCard
              icon={<Users className="w-7 h-7" />}
              title="New Ambassador"
              description="Register a new ambassador (staff only)"
              to="/login"
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-bold">K Enterprise</span>
                  <span className="text-xs text-primary-200">Business Management Center</span>
                </div>
              </div>
              <p className="text-primary-200">
                KEP Non-Profit ProgramManagement Center for community service programs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-primary-200">
                <li>Age in Place Senior Care Ambassador Extension Program</li>
                <li>Kingdom Care Senior Village</li>
                <li>Kingdom Care - Knox Hill Outreach</li>
                <li>Gateway Afterschool</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-200">
                <li><Link to="/ambassador-login" className="hover:text-white transition-colors">Ambassador Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Staff Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-500 mt-8 pt-8 text-center text-primary-300">
            <p>Empowering communities through coordinated care and support.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ProgramCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'secondary' | 'accent' | 'success';
  active: boolean;
}

function ProgramCard({ icon, title, description, color, active }: ProgramCardProps) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 text-primary',
    secondary: 'from-secondary/10 to-secondary/5 border-secondary/20 text-secondary',
    accent: 'from-accent/10 to-accent/5 border-accent/20 text-accent',
    success: 'from-success/10 to-success/5 border-success/20 text-success',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 relative overflow-hidden transition-all hover:shadow-lg`}>
      {active && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-success text-white text-xs font-medium rounded-full">
          Active
        </span>
      )}
      <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

interface FeatureStepProps {
  number: number;
  title: string;
  description: string;
}

function FeatureStep({ number, title, description }: FeatureStepProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: 'primary' | 'secondary' | 'accent';
}

function QuickActionCard({ icon, title, description, to, color }: QuickActionCardProps) {
  const colorClasses = {
    primary: 'hover:border-primary hover:bg-primary/5',
    secondary: 'hover:border-secondary hover:bg-secondary/5',
    accent: 'hover:border-accent hover:bg-accent/5',
  };

  const iconColorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <Link
      to={to}
      className={`card border-2 border-gray-100 ${colorClasses[color]} transition-all group flex items-start gap-4`}
    >
      <div className={`w-12 h-12 rounded-lg ${iconColorClasses[color]} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
