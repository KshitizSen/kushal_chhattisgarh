import { ArrowRight, CheckCircle2, ExternalLink, HelpCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import useAuthStore from '../../store/authStore';

const VIDEO_TUTORIAL_URL = 'https://youtu.be/cU_xTKNECqc?si=nfX0476JcEEq377E';
const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/cU_xTKNECqc?si=ot-ZwmVcWCct7ehU';

const guideContent = {
  principal: {
    roleName: 'Principal',
    introduction: 'School-level vocational training operations ko monitor aur approve karein.',
    capabilities: ['Attendance dekhna', 'Requests approve/reject karna', 'Holidays manage karna', 'Monthly reports process karna'],
    steps: [
      { title: 'Dashboard Overview', description: 'School, VT staff aur pending activity ka summary dekhein.', path: '/principal/dashboard' },
      { title: 'Attendance Status', description: 'Current aur historical VT attendance monitor karein.', path: '/principal/attendance-status' },
      { title: 'VT Requests', description: 'Registration, On Duty, Regularization, Leave aur Mobile Device requests review karke approve/reject karein.', path: '/principal/vocational-training-requests' },
      { title: 'Holiday Management', description: 'School holiday declare, update ya delete karein.', path: '/principal/holidays' },
      { title: 'Monthly Reports', description: 'Monthly report generate/download karke remarks ke saath approve ya reject karein.', path: '/principal/reports' },
    ],
  },
  vtp: {
    roleName: 'VTP',
    introduction: 'Mapped schools, vocational teachers, requests aur reports manage karein.',
    capabilities: ['VT staff manage karna', 'Requests process karna', 'Attendance monitor karna', 'Reports approve/export karna'],
    steps: [
      { title: 'Dashboard Overview', description: 'Mapped schools, vocational teachers aur trades ka overview dekhein.', path: '/vtp/dashboard' },
      { title: 'Attendance Status', description: 'VTP ke teachers ki daily attendance monitor karein.', path: '/vtp/attendance-status' },
      { title: "VT's List", description: 'Teacher add/update karein aur mobile update requests process karein.', path: '/vtp/vt-list' },
      { title: 'Schools & Trades', description: 'Mapped school aur trade records dekhein.', links: [{ label: 'Schools', path: '/vtp/schools' }, { label: 'Trades', path: '/vtp/trades' }] },
      { title: 'VT Requests', description: 'Registration, On Duty, Regularization, Leave, Device aur Mobile Updation requests handle karein.', path: '/vtp/vocational-training-requests' },
      { title: 'Monthly Reports', description: 'PDF dekhein, Excel export karein aur upstream approval ke baad final approve/reject karein.', path: '/vtp/monthly-reports' },
    ],
  },
  deo: {
    roleName: 'DEO',
    introduction: 'District-level vocational training attendance, network aur reports monitor karein.',
    capabilities: ['District attendance dekhna', 'VTP/School/VT details dekhna', 'Reports approve/reject karna', 'Reports export karna'],
    steps: [
      { title: 'District Dashboard', description: 'District-level vocational training summary dekhein.', path: '/deo/dashboard' },
      { title: 'Attendance & Approvals', description: 'Attendance overview aur report approvals monitor karein.', path: '/deo/attendance-status' },
      { title: 'District Directories', description: 'VTP, VT School aur VT Details records dekhein.', links: [{ label: 'VTPs', path: '/deo/vtps' }, { label: 'Schools', path: '/deo/vt-schools' }, { label: 'VT Details', path: '/deo/vt-teachers' }] },
      { title: 'Report Approval', description: 'Principal-approved reports ko individual, school-wise ya bulk approve/reject karein.', path: '/deo/attendance-status?view=report-approvals' },
      { title: 'Monthly Reports', description: 'Reports filter/download karein, Excel export karein aur remarks ke saath approve/reject karein.', path: '/deo/monthly-reports' },
    ],
  },
  admin: {
    roleName: 'Admin',
    introduction: 'System-level attendance, master records aur VT mapping operations control karein.',
    capabilities: ['System monitoring', 'Master records manage karna', 'Attendance track karna', 'Mapping requests process karna'],
    steps: [
      { title: 'System Dashboard', description: 'System-level operational summary dekhein.', path: '/admin/dashboard' },
      { title: 'Attendance Status', description: 'Live overview, total VTs aur approved VT reports track karein.', path: '/admin/attendance-status' },
      { title: 'Daily Check-In/Out', description: 'Date-wise attendance details dekhein aur available attendance action perform karein.', path: '/admin/daily-attendance' },
      { title: 'Schools List', description: 'Registered vocational schools monitor karein.', path: '/admin/manage-schools' },
      { title: 'Manage VTP & DEO', description: 'VTP aur DEO master records add ya update karein.', links: [{ label: 'Manage VTP', path: '/admin/manage-vtp' }, { label: 'Manage DEO', path: '/admin/manage-deo' }] },
      { title: 'Trades List', description: 'Vocational trades aur provider mapping dekhein.', path: '/admin/trades' },
      { title: 'VT Updation Approval', description: 'District, block aur school mapping-change requests process karein.', path: '/admin/vt-updation-approval' },
    ],
  },
};

const UserGuide = () => {
  const role = useAuthStore((state) => state.user?.role || state.role);
  const normalizedRole = role === 'vocational_teacher_provider' ? 'vtp' : role;
  const guide = guideContent[normalizedRole];

  if (!guide) {
    return (
      <Card className="mx-auto max-w-2xl text-center" padding="lg">
        <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Guide unavailable</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Is login role ke liye user guide available nahi hai.</p>
        <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400">
          Dashboard par jayein <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-100">{guide.roleName} User Guide</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Aap is login me kya kar sakte hain?</h1>
            <p className="mt-2 max-w-3xl text-sm text-primary-50 sm:text-base">{guide.introduction}</p>
          </div>
          <HelpCircle className="hidden h-16 w-16 shrink-0 text-white/25 sm:block" aria-hidden="true" />
        </div>
      </section>

      <Card title="Available Capabilities" padding="lg">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {guide.capabilities.map((capability) => (
            <div key={capability} className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 dark:bg-gray-800/70 dark:text-gray-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
              <span>{capability}</span>
            </div>
          ))}
        </div>
      </Card>

      <section aria-labelledby="working-steps-title">
        <div className="mb-3">
          <h2 id="working-steps-title" className="text-2xl font-bold text-gray-900 dark:text-white">Working Steps</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Neeche diye gaye steps follow karke apne modules use karein.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {guide.steps.map((step, index) => (
            <Card key={step.title} variant="elevated" hover className="h-full">
              <div className="flex h-full gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {index + 1}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">{step.description}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    {(step.links || [{ label: 'Open Module', path: step.path }]).map((link) => (
                      <Link key={link.path} to={link.path} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:text-primary-400 dark:hover:text-primary-300">
                        {link.label} <ArrowRight className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20" padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <PlayCircle className="h-10 w-10 shrink-0 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Video Tutorial</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Step-by-step video guide dekhne ke liye YouTube tutorial open karein.</p>
            </div>
          </div>
          <a href={VIDEO_TUTORIAL_URL} target="_blank" rel="noopener noreferrer" aria-label={`${guide.roleName} video tutorial YouTube par open karein`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">
            Watch on YouTube <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="mx-auto mt-5 aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-red-200 bg-black shadow-sm dark:border-red-900/60">
          <iframe
            className="h-full w-full"
            src={VIDEO_EMBED_URL}
            title={`${guide.roleName} YouTube video tutorial`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </Card>
    </div>
  );
};

export default UserGuide;
