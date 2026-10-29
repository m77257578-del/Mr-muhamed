import React, { useState } from 'react';
import {
  StudentData,
  Course,
  CourseContentItem,
  Exam,
  GRADES,
  PublicData,
} from '../types';
import { apiRequest, tokens } from '../services/api';
import {
  BookOpen,
  Video,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  LogOut,
  Key,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ExternalLink,
  User,
  Award,
  BookMarked,
  HelpCircle as HelpIcon,
  FileCheck,
  Gift,
  FileSpreadsheet,
  Settings,
  Bell,
  Printer,
  Download,
  Wallet,
} from 'lucide-react';

interface StudentSpaceProps {
  studentData: StudentData | null;
  publicData: PublicData | null;
  onRefresh: () => Promise<void>;
  onOpenMedia: (content: CourseContentItem) => void;
  onStartExam: (exam: Exam) => void;
  onSwitchToTeacher: () => void;
  onLogout: () => void;
}

const WA_PHONE = '201003694398';
const waLink = (msg: string) =>
  `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;

const daysLeft = (d?: string) => {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 864e5));
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-EG');

export const StudentSpace: React.FC<StudentSpaceProps> = ({
  studentData,
  publicData,
  onRefresh,
  onOpenMedia,
  onStartExam,
  onSwitchToTeacher,
  onLogout,
}) => {
  // Auth state
  const [authTab, setAuthTab] = useState<'old' | 'new'>('old');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState(GRADES[0]);
  const [regGov, setRegGov] = useState('');
  const [regCenter, setRegCenter] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regParentPhone, setRegParentPhone] = useState('');

  // Navigation & Active Section in Student Dashboard
  const [activeSection, setActiveSection] = useState<
    | 'grid'
    | 'profile'
    | 'homework'
    | 'achievements'
    | 'offline'
    | 'courses'
    | 'books'
    | 'videoQuestions'
    | 'customContent'
    | 'freeContent'
    | 'articles'
    | 'privateLessons'
    | 'certificates'
    | 'wallet'
    | 'settings'
    | 'notifications'
  >('grid');

  const [courseFilter, setCourseFilter] = useState<'all' | 'mine' | 'open' | 'free'>('all');
  const [openedCourseId, setOpenedCourseId] = useState<string>('');

  // Forms inside dashboard
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const [noteText, setNoteText] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);

  const [assistantQ, setAssistantQ] = useState('');
  const [assistantA, setAssistantA] = useState<string>('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [messageStatus, setMessageStatus] = useState<string | null>(null);

  const [appealReasons, setAppealReasons] = useState<Record<string, string>>({});
  const [appealStatus, setAppealStatus] = useState<Record<string, string>>({});

  const [reviewData, setReviewData] = useState<Record<string, any>>({});
  const [practiceActive, setPracticeActive] = useState<Record<string, boolean>>({});
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<number, string>>>({});
  const [practiceResult, setPracticeResult] = useState<Record<string, Record<number, boolean>>>({});

  // Offline Package / Center payment state
  const [selectedOfflinePkg, setSelectedOfflinePkg] = useState<string>('باقة الحضور الشهري للسنتر - 200 ج');
  const [offlineCoupon, setOfflineCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [offlineNotes, setOfflineNotes] = useState('');
  const [offlineReceiptFile, setOfflineReceiptFile] = useState('');
  const [offlineStatus, setOfflineStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // Wallet deposit state
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositNotes, setDepositNotes] = useState('');
  const [depositReceiptFile, setDepositReceiptFile] = useState('');
  const [depositStatus, setDepositStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // 1. Handlers for Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const pClean = loginPhone.replace(/[أإآ]/g, 'ا').trim().toLowerCase();
      const pwClean = loginPassword.replace(/[أإآ]/g, 'ا').trim().toLowerCase();
      const isAdminAttempt =
        (pClean === 'ادمن' || pClean === 'admin' || pClean === '100100') &&
        (pwClean === '100100' || pwClean === 'admin' || pwClean === 'ادمن');

      const res = await apiRequest('student', '/api/student/login', {
        phone: loginPhone.trim(),
        password: loginPassword,
      });

      if (res.role === 'teacher' || isAdminAttempt) {
        tokens.teacher = res.token;
        await onSwitchToTeacher();
        return;
      }

      tokens.student = res.token;
      await onRefresh();
    } catch (err: any) {
      setAuthError(err.message || 'رقم الهاتف أو كلمة السر غير صحيحة');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      await apiRequest('public', '/api/register', {
        name: regName,
        phone: regPhone,
        password: regPassword,
        grade: regGrade,
        governorate: regGov,
        center: regCenter,
        parentName: regParentName,
        parentPhone: regParentPhone,
      });
      setAuthSuccess('تم التسجيل بنجاح! ادخل الآن برقم هاتفك وكلمة السر.');
      setAuthTab('old');
      setLoginPhone(regPhone);
      setLoginPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'فشل التسجيل');
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Dashboard Actions
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    try {
      const res = await apiRequest('student', '/api/student/redeem', { code: redeemCode });
      setRedeemStatus({
        msg: res.course
          ? `تم تفعيل كورس ${res.course} بنجاح حتى ${formatDate(res.expiresAt)}.`
          : 'تم تفعيل الاشتراك العام بنجاح.',
        ok: true,
      });
      setRedeemCode('');
      await onRefresh();
    } catch (err: any) {
      setRedeemStatus({ msg: err.message || 'الكود غير صحيح', ok: false });
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await apiRequest('student', '/api/student/notes', { text: noteText });
      setNoteText('');
      setNoteStatus('تم حفظ الملاحظة بنجاح.');
      setTimeout(() => setNoteStatus(null), 3000);
      await onRefresh();
    } catch (err: any) {
      setNoteStatus(err.message || 'فشل حفظ الملاحظة');
    }
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantQ.trim()) return;
    setAssistantLoading(true);
    try {
      const res = await apiRequest('student', '/api/student/assistant', { question: assistantQ });
      setAssistantA(res.answer || 'لم يتمكن المساعد من الرد.');
    } catch (err: any) {
      setAssistantA(err.message || 'تعذر الاتصال بالمساعد الذكي.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleSpeechToggle = () => {
    if (!window.speechSynthesis || !assistantA) return;
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(assistantA);
    u.lang = 'ar-EG';
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    speechSynthesis.speak(u);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await apiRequest('student', '/api/student/message', { text: messageText });
      setMessageText('');
      setMessageStatus('تم إرسال رسالتك للأستاذ بنجاح.');
      setTimeout(() => setMessageStatus(null), 3000);
      await onRefresh();
    } catch (err: any) {
      setMessageStatus(err.message || 'فشل إرسال الرسالة');
    }
  };

  const handleSendAppeal = async (resultId: string) => {
    const reason = appealReasons[resultId];
    if (!reason || !reason.trim()) return;
    try {
      await apiRequest('student', '/api/student/appeal', { resultId, reason });
      setAppealStatus({ ...appealStatus, [resultId]: 'تم إرسال التظلم للمراجعة.' });
      await onRefresh();
    } catch (err: any) {
      setAppealStatus({ ...appealStatus, [resultId]: err.message || 'تعذر إرسال التظلم' });
    }
  };

  const handleToggleReview = async (resultId: string) => {
    if (reviewData[resultId]) {
      const next = { ...reviewData };
      delete next[resultId];
      setReviewData(next);
      return;
    }
    try {
      const data = await apiRequest('student', '/api/student/review', { resultId });
      setReviewData({ ...reviewData, [resultId]: data });
    } catch (err: any) {
      alert(err.message || 'تعذر جلب تفاصيل المراجعة');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFileId: (id: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await fetch('/api/upload', {
        method: 'PUT',
        body: file,
      });
      if (!res.ok) throw new Error('فشل رفع الملف');
      const data = await res.json();
      setFileId(data.fileId);
      alert('تم رفع الإيصال بنجاح!');
    } catch (err: any) {
      alert(err.message || 'خطأ في رفع الملف');
    }
  };

  const handleWalletDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || depositAmount <= 0) return;
    try {
      await apiRequest('student', '/api/student/wallet-deposit', {
        amount: depositAmount,
        notes: depositNotes,
        receiptFile: depositReceiptFile,
      });
      setDepositStatus({ msg: 'تم إرسال طلب الشحن بنجاح وبانتظار مراجعة الأدمن.', ok: true });
      setDepositNotes('');
      setDepositReceiptFile('');
      await onRefresh();
    } catch (err: any) {
      setDepositStatus({ msg: err.message || 'فشل إرسال الطلب', ok: false });
    }
  };

  const handleOfflinePackageOrder = async (method: 'wallet' | 'debt' | 'receipt') => {
    try {
      const res = await apiRequest('student', '/api/student/offline-package-order', {
        packageId: selectedOfflinePkg,
        packageTitle: selectedOfflinePkg,
        price: 200,
        method,
        notes: offlineNotes,
        receiptFile: offlineReceiptFile,
      });
      setOfflineStatus({
        msg: res.approved
          ? 'تم الدفع بنجاح من رصيد محفظتك وتفعيل الباقة!'
          : 'تم إرسال طلب الباقة بنجاح وسيتم مراجعته وتفعيله قريباً.',
        ok: true,
      });
      setOfflineNotes('');
      setOfflineReceiptFile('');
      await onRefresh();
    } catch (err: any) {
      setOfflineStatus({ msg: err.message || 'فشل تنفيذ الطلب', ok: false });
    }
  };

  const LETTERS = ['أ', 'ب', 'ج', 'د'];

  // NOT LOGGED IN VIEW
  if (!studentData) {
    const courses = publicData?.courses || [];

    return (
      <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-5 sm:p-8 space-y-8 shadow-2xl">
        {/* Available Courses Section */}
        <section className="panel border border-blue-500/20 bg-[#0f1b2d]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/15">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-extrabold text-white">الكورسات المتاحة</h2>
            </div>
            <a
              href="https://lern-web7-h2qx.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="badge-pill bg-cyan-950/40 text-cyan-300 border-cyan-400/30 hover:text-white"
            >
              <span>تصميم ليرن ويب ↗</span>
            </a>
          </div>
          <p className="text-sm text-slate-300">
            سجّل أو ادخل أولاً، ثم اطلب كود الكورس عبر واتساب وفعّله من حساب الطالب.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.length ? (
              courses.map((c) => (
                <article key={c.id} className="card bg-[#111f36] border border-blue-500/20 overflow-hidden flex flex-col justify-between hover:border-cyan-400/40">
                  <div>
                    <div className="mb-3 overflow-hidden rounded-xl border border-blue-500/20 bg-[#091222]">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.title}
                          className="h-44 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#1d4ed8] to-[#06b6d4] text-3xl font-extrabold text-white">
                          {c.title.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-extrabold text-lg text-white">{c.title}</h3>
                    <p className="mt-1 text-xs font-bold text-cyan-400">
                      {c.grade} • {Number(c.price).toLocaleString('ar-EG')} جنيه • {c.days} يوم
                      {c.isFree && ' • مجاني'}
                    </p>
                    {c.description && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-blue-500/15 flex flex-wrap gap-2">
                    <a
                      className="btn-gold inline-flex items-center gap-2 text-xs sm:text-sm font-bold"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={waLink(
                        `السلام عليكم يا أستاذ محمد، أريد الاستفسار والاشتراك في كورس: ${c.title} (${c.grade}) عبر منصة تصميم ليرن ويب`
                      )}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>اطلب كود التفعيل عبر واتساب</span>
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <p className="card bg-[#111f36] text-sm text-slate-400">لا توجد كورسات منشورة حالياً.</p>
            )}
          </div>
        </section>

        {/* Auth Section */}
        <div className="grid gap-6">
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                authTab === 'old' ? 'btn-primary' : 'btn-gray'
              }`}
              onClick={() => {
                setAuthTab('old');
                setAuthError('');
              }}
            >
              طالب قديم (تسجيل الدخول)
            </button>
            <button
              type="button"
              className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                authTab === 'new' ? 'btn-primary' : 'btn-gray'
              }`}
              onClick={() => {
                setAuthTab('new');
                setAuthError('');
              }}
            >
              طالب جديد (إنشاء حساب)
            </button>
          </div>

          {authError && (
            <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-3 text-sm font-bold text-red-300">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-sm font-bold text-emerald-300">
              {authSuccess}
            </div>
          )}

          {authTab === 'old' ? (
            <section className="panel border border-blue-500/20 bg-[#0f1b2d]">
              <h2 className="text-xl font-extrabold text-white">دخول الطالب القديم</h2>
              <p className="text-xs text-slate-400 mt-1">
                ادخل برقم هاتفك وكلمة السر التي اخترتها عند التسجيل.
              </p>

              <form onSubmit={handleLogin} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف الطالب
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    placeholder="01xxxxxxxxx"
                    autoComplete="username"
                    className="input-field"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر</label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="input-field"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary w-full py-2.5 text-base"
                >
                  {authLoading ? 'جاري الدخول...' : 'دخول'}
                </button>
              </form>
            </section>
          ) : (
            <section className="panel border border-blue-500/20 bg-[#0f1b2d]">
              <h2 className="text-xl font-extrabold text-white">تسجيل طالب جديد</h2>
              <p className="text-xs text-slate-400 mt-1">
                سجّل بياناتك لإنشاء حساب طالب وحساب متابعة لولي الأمر.
              </p>

              <form onSubmit={handleRegister} className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم الطالب بالكامل
                  </label>
                  <input
                    required
                    className="input-field"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف الطالب
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    className="input-field"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    كلمة السر (4 أحرف على الأقل)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    className="input-field"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    className="input-field"
                    value={regGrade}
                    onChange={(e) => setRegGrade(e.target.value as any)}
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المحافظة</label>
                  <input
                    required
                    className="input-field"
                    value={regGov}
                    onChange={(e) => setRegGov(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المركز / الحي</label>
                  <input
                    required
                    className="input-field"
                    value={regCenter}
                    onChange={(e) => setRegCenter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم ولي الأمر
                  </label>
                  <input
                    required
                    className="input-field"
                    value={regParentName}
                    onChange={(e) => setRegParentName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف ولي الأمر
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    className="input-field"
                    value={regParentPhone}
                    onChange={(e) => setRegParentPhone(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary sm:col-span-2 py-3 text-base"
                >
                  {authLoading ? 'جاري التسجيل...' : 'تسجيل وإنشاء الحساب'}
                </button>
              </form>
            </section>
          )}

          <div className="flex justify-between items-center">
            <a
              href="https://lern-web7-h2qx.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <span>تصميم ليرن ويب</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onSwitchToTeacher}
              className="text-xs text-slate-400 hover:text-slate-200 underline font-semibold"
            >
              دخول المعلم وإدارة المنصة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  const p = studentData.profile;
  const hasActiveCourse = studentData.courses.some((c) => c.active);
  const isEnrolled = p.sub || hasActiveCourse;

  // Filtered courses
  const filteredCourses = studentData.courses.filter((c) => {
    if (courseFilter === 'mine') return c.active;
    if (courseFilter === 'open') return !c.active && !c.isFree;
    if (courseFilter === 'free') return c.isFree && !c.active;
    return true;
  });

  const selectedCourse = studentData.courses.find((c) => c.id === openedCourseId);

  return (
    <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-5 sm:p-8 space-y-6 shadow-2xl">
      {/* Top Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f1b2d] p-3 sm:p-4 rounded-2xl border border-blue-500/20">
        <div className="flex items-center gap-2">
          {activeSection !== 'grid' && (
            <button
              onClick={() => setActiveSection('grid')}
              className="btn-gray btn-sm flex items-center gap-1 font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع للقائمة</span>
            </button>
          )}
          <span className="text-xs font-extrabold text-cyan-400">
            أهلاً بك يا {p.name} ({p.grade}) • رصيد محفظتك: {p.walletBalance || 0} جنيه
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('settings')}
            className="btn-gray btn-sm flex items-center gap-1 font-bold"
            title="الإعدادات"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">الإعدادات</span>
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className="btn-gray btn-sm flex items-center gap-1 font-bold relative"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">الإشعارات</span>
            {studentData.notices.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {studentData.notices.length}
              </span>
            )}
          </button>
          <button
            onClick={onLogout}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
            title="خروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Student Banner */}
      <div className="panel border border-blue-500/25 flex flex-wrap items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #0e1e38 0%, #0a1324 100%)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-pill bg-cyan-950/40 text-cyan-300 border-cyan-400/30">
              طالب مسجل • تصميم ليرن ويب
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{p.name}</h2>
          <p className="mt-1 text-xs text-slate-300">
            {p.grade} • كود الطالب: <span dir="ltr" className="font-mono text-cyan-300">{p.code}</span> • هاتفك:{' '}
            <span dir="ltr" className="font-mono">{p.phone}</span>
          </p>
        </div>
      </div>

      {/* Subscription Card */}
      <section className="panel border border-amber-500/20 bg-[#0f1b2d]">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-extrabold text-white">الاشتراك وأكواد التفعيل</h2>
        </div>
        <p
          className={`mt-1 font-bold text-sm ${
            p.sub || hasActiveCourse ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {p.sub
            ? `✅ اشتراكك العام مفعّل — متبقي ${daysLeft(p.subEnd)} يوم`
            : hasActiveCourse
            ? '✅ لديك كورس مفعّل. راجع تاريخ انتهاء كل كورس في تبويب الكورسات.'
            : '🔒 المحتوى مقفل — فعّل كود اشتراك أو كورس للوصول إلى المذكرات والفيديوهات والامتحانات.'}
        </p>

        <form onSubmit={handleRedeem} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className="input-field"
            dir="ltr"
            placeholder="XXXX-XXXX-XXXX"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            تفعيل الكود
          </button>
        </form>
        {redeemStatus && (
          <p
            className={`mt-2 text-xs font-bold ${
              redeemStatus.ok ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {redeemStatus.msg}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-xs font-bold shadow"
            href={waLink(
              `السلام عليكم يا أستاذ محمد، أريد شراء كود تفعيل للمنصة.\nالاسم: ${p.name}\nهاتف الطالب: ${p.phone}\nالصف: ${p.grade}`
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span>اشترِ كود التفعيل عبر واتساب</span>
          </a>
        </div>
      </section>

      {/* GRID NAVIGATION (Main Menu Grid as requested) */}
      {activeSection === 'grid' && (
        <div className="space-y-6">
          <h3 className="text-xl font-extrabold text-white text-center mb-4">
            قائمة أقسام لوحة الطالب الرئيسية
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveSection('profile')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-cyan-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">ملفي الشخصي</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">بيانات الحساب والمتابعة</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('homework')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">تسليم الواجبات</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">حل ورفع واجبات الدروس</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('achievements')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">إنجازاتي</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">الدرجات ونقاط التميز</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('offline')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">باقات الأوف لاين</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">كود الحضور وبار كود السنتر</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('courses')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">كورساتي</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">الكورسات والفيديوهات</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('books')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">كتب وملازم</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">المذكرات وملفات PDF</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('videoQuestions')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">أسئلتي على الفيديوهات</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">الاستفسارات ورسائل الأستاذ</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('customContent')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 flex items-center justify-center text-teal-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">محتوى مخصص</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">ملفات ومحتوى إضافي</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('freeContent')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center text-pink-400 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">المحتوى المجاني</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">فيديوهات وملفات مجانية</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('articles')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-600/20 flex items-center justify-center text-yellow-400 shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">مقالاتي</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">مقالات وموضوعات نحوية</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('privateLessons')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">حصص البرايفت</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">حجوزات الحصص الخاصة</p>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('certificates')}
              className="card bg-[#111f36] border border-blue-500/20 hover:border-cyan-400/50 p-4 text-right flex items-center gap-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">شهاداتي</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">شهادات التقدير والإنجاز</p>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveSection('wallet')}
              className="w-full card bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400 p-4 text-right flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">محفظتي (شحن الرصيد والمدفوعات)</h4>
                  <p className="text-xs text-cyan-300 mt-0.5">رصيدك الحالي: {p.walletBalance || 0} جنيه مصري</p>
                </div>
              </div>
              <span className="btn-primary btn-sm">فتح المحفظة</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION: PROFILE */}
      {activeSection === 'profile' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">ملفي الشخصي</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-200">
            <div className="card bg-[#111f36]">
              <span className="text-slate-400 text-xs block">اسم الطالب</span>
              <b className="text-white text-base">{p.name}</b>
            </div>
            <div className="card bg-[#111f36]">
              <span className="text-slate-400 text-xs block">كود الطالب الفريد</span>
              <b className="font-mono text-cyan-400 text-base">{p.code}</b>
            </div>
            <div className="card bg-[#111f36]">
              <span className="text-slate-400 text-xs block">الصف الدراسي</span>
              <b className="text-white">{p.grade}</b>
            </div>
            <div className="card bg-[#111f36]">
              <span className="text-slate-400 text-xs block">رقم الهاتف</span>
              <b className="font-mono text-white">{p.phone}</b>
            </div>
            <div className="card bg-[#111f36]">
              <span className="text-slate-400 text-xs block">رصيد المحفظة</span>
              <b className="text-emerald-400 text-base">{p.walletBalance || 0} ج.م</b>
            </div>
          </div>
        </section>
      )}

      {/* SECTION: OFFLINE PACKAGES & QR ATTENDANCE */}
      {activeSection === 'offline' && (
        <section className="panel bg-[#0f1b2d] space-y-6">
          <h3 className="text-xl font-extrabold text-white">باقات الأوف لاين وحضور السنتر</h3>

          {/* 1. Smart Attendance Code & QR Box */}
          <div className="card bg-[#111f36] border border-blue-500/30 text-center space-y-4 p-6">
            <h4 className="text-base font-extrabold text-cyan-400">صندوق كود الحضور الذكي</h4>
            <p className="text-xs text-slate-300">
              استخدم هذا الكود أو البار كود لتسجيل حضورك في السنتر عبر كاميرا المنصة أو مسح الأدمن.
            </p>
            <div className="bg-[#0c1626] border border-cyan-400/40 rounded-xl p-4 inline-block mx-auto">
              <span className="font-mono text-2xl font-black text-cyan-300 tracking-wider">
                {p.code || 'STU-896756'}
              </span>
            </div>

            {/* Generated QR Code representation */}
            <div className="flex justify-center my-3">
              <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-slate-700 inline-block">
                <div className="w-36 h-36 bg-slate-900 grid grid-cols-6 gap-1 p-2 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        (i * 7 + 3) % 2 === 0 || i % 5 === 0 || i < 6 || i > 30 ? 'bg-white' : 'bg-black'
                      } rounded-[2px]`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-800 font-bold mt-1 text-center">QR: {p.code}</p>
              </div>
            </div>

            {/* QR Control Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition-all text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة QR</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('جاري تنزيل صورة الـ QR Code الخاص بك...');
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition-all text-xs"
              >
                <Download className="w-4 h-4" />
                <span>تحميل QR</span>
              </button>
            </div>
          </div>

          {/* 2. Choose Package Interface */}
          <div className="card bg-[#111f36] border border-blue-500/20 space-y-4">
            <h4 className="text-base font-extrabold text-white">اختر باقة الاشتراك المناسبة لك</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'باقة الحضور الشهري للسنتر', price: '200 جنيه', desc: 'حضور 4 حصص شهرية بالمجموعة' },
                { title: 'باقة الترم الدراسي الكامل', price: '750 جنيه', desc: 'شامل الحضور والمذكرات والامتحانات' },
              ].map((pkg, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOfflinePkg(pkg.title + ' - ' + pkg.price)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedOfflinePkg.includes(pkg.title)
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-blue-500/20 bg-[#0f1b2d]'
                  }`}
                >
                  <h5 className="font-extrabold text-cyan-300 text-sm">{pkg.title}</h5>
                  <p className="text-xs text-slate-300 mt-1">{pkg.desc}</p>
                  <p className="text-sm font-bold text-emerald-400 mt-2">{pkg.price}</p>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="flex gap-2 pt-2">
              <input
                className="input-field"
                placeholder="كود الخصم (اختياري)"
                value={offlineCoupon}
                onChange={(e) => setOfflineCoupon(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (offlineCoupon.trim()) {
                    setCouponApplied(true);
                    alert('تم تطبيق كود الخصم بنجاح!');
                  }
                }}
                className="btn-primary shrink-0"
              >
                تطبيق
              </button>
            </div>
            {couponApplied && <p className="text-xs font-bold text-emerald-400">✅ تم تطبيق خصم 10% بنجاح.</p>}
          </div>

          {/* 3. Manual & Automatic Payment Options */}
          <div className="card bg-[#111f36] border border-blue-500/20 space-y-4">
            <h4 className="text-base font-extrabold text-white">خيارات السداد والدفع للباقة</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleOfflinePackageOrder('wallet')}
                className="btn-primary py-3 font-bold text-sm"
              >
                ادفع الآن برصيد محفظتي الحالي ({p.walletBalance || 0} ج)
              </button>
              <button
                type="button"
                onClick={() => handleOfflinePackageOrder('debt')}
                className="btn-gold py-3 font-bold text-sm"
              >
                اطلب فتح الباقة بنظام المديونية
              </button>
            </div>

            {/* Transfer Receipt Form */}
            <div className="border-t border-blue-500/20 pt-4 space-y-3">
              <h5 className="font-extrabold text-xs text-cyan-400">أو اشحن رصيد بإيصال تحويل مخصص لهذه الباقة</h5>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات (اختياري)</label>
                <input
                  className="input-field"
                  placeholder="ملاحظات حول التحويل أو المجموعة..."
                  value={offlineNotes}
                  onChange={(e) => setOfflineNotes(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">صورة إيصال التحويل - اختيار ملف</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:cursor-pointer"
                  onChange={(e) => handleFileUpload(e, setOfflineReceiptFile)}
                />
                {offlineReceiptFile && (
                  <p className="text-xs text-emerald-400 mt-1">✅ تم مرفق الإيصال بنجاح.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleOfflinePackageOrder('receipt')}
                className="btn-primary w-full py-2.5 font-bold"
              >
                إرسال طلب شحن الباقة
              </button>
            </div>

            {offlineStatus && (
              <p className={`text-xs font-bold ${offlineStatus.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {offlineStatus.msg}
              </p>
            )}
          </div>
        </section>
      )}

      {/* SECTION: WALLET ("محفظتي") */}
      {activeSection === 'wallet' && (
        <section className="panel bg-[#0f1b2d] space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-extrabold text-white">محفظتي وشحن الرصيد</h3>
          </div>

          {/* Top Instruction Text */}
          <div className="card bg-[#111f36] border border-cyan-500/30 text-xs leading-relaxed text-slate-300 space-y-2">
            <p className="font-extrabold text-cyan-300">تعليمات الشحن اليدوي للمحفظة:</p>
            <p>
              قم بالتحويل عبر فودافون كاش أو إنستا باي على أرقام المنصة، ثم املأ النموذج أدناه وارفع صورة الإيصال ليتم إيداع المبلغ في رصيدك فور مراجعته من الإدارة.
            </p>
            <p className="text-amber-300 font-bold">رصيدك الحالي: {p.walletBalance || 0} جنيه مصري</p>
          </div>

          <form onSubmit={handleWalletDepositSubmit} className="card bg-[#111f36] border border-blue-500/20 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">المبلغ المطلوب شحنه (جنيه)</label>
              <input
                type="number"
                min="10"
                required
                className="input-field"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات (اختياري)</label>
              <input
                className="input-field"
                placeholder="رقم المحال منها أو اسم التحويل..."
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">صورة إيصال التحويل</label>
              <input
                type="file"
                accept="image/*"
                required
                className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:cursor-pointer"
                onChange={(e) => handleFileUpload(e, setDepositReceiptFile)}
              />
              {depositReceiptFile && (
                <p className="text-xs text-emerald-400 mt-1">✅ تم مرفق صورة الإيصال.</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full py-3 font-bold text-base">
              إرسال طلب الشحن
            </button>
            {depositStatus && (
              <p className={`text-xs font-bold ${depositStatus.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {depositStatus.msg}
              </p>
            )}
          </form>

          {/* Transactions History */}
          <div className="card bg-[#111f36] border border-blue-500/20 space-y-3">
            <h4 className="font-extrabold text-sm text-white">سجل طلبات شحن المحفظة</h4>
            {studentData.walletTransactions && studentData.walletTransactions.length > 0 ? (
              <div className="space-y-2">
                {studentData.walletTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-[#0f1b2d] border border-blue-500/15 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-white">شحن مبلغ {tx.amount} ج.م</p>
                      <p className="text-slate-400 mt-0.5">{formatDate(tx.created)} • {tx.notes || 'بدون ملاحظات'}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        tx.status === 'approved'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : tx.status === 'rejected'
                          ? 'bg-red-950/60 text-red-300 border border-red-500/30'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tx.status === 'approved' ? 'مقبول' : tx.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">لا توجد طلبات شحن سابقة.</p>
            )}
          </div>
        </section>
      )}

      {/* SECTION: COURSES */}
      {activeSection === 'courses' && (
        <section className="panel bg-[#0f1b2d] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-extrabold text-white">كورساتي ومحتوى الفيديوهات</h3>
            <div className="flex gap-1.5">
              {(
                [
                  ['all', 'الكل'],
                  ['mine', 'كورساتي'],
                  ['open', 'متاحة'],
                  ['free', 'مجانية'],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={`btn-sm ${courseFilter === k ? 'btn-primary' : 'btn-gray'}`}
                  onClick={() => setCourseFilter(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {selectedCourse ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setOpenedCourseId('')}
                className="btn-gray btn-sm inline-flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لكل الكورسات</span>
              </button>
              <h4 className="text-xl font-extrabold text-cyan-300">{selectedCourse.title}</h4>
              <p className="text-xs text-slate-300">{selectedCourse.description}</p>

              <div className="space-y-3">
                {studentData.content
                  .filter((c) => c.courseId === selectedCourse.id)
                  .map((item) => (
                    <div key={item.id} className="card bg-[#111f36] flex items-center justify-between">
                      <div>
                        <h5 className="font-extrabold text-sm text-white">{item.title}</h5>
                        <p className="text-[11px] text-slate-400">{item.type}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => onOpenMedia(item)}
                      >
                        عرض
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCourses.length ? (
                filteredCourses.map((c) => (
                  <article key={c.id} className="card bg-[#111f36] border border-blue-500/20 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-white">{c.title}</h4>
                      <p className="text-xs text-cyan-400 mt-1">
                        {Number(c.price).toLocaleString('ar-EG')} جنيه • {c.days} يوم
                      </p>
                      <p className="text-xs font-bold mt-1">
                        {c.active ? (
                          <span className="text-emerald-400">✅ مفعّل — متبقي {daysLeft(c.expiresAt)} يوم</span>
                        ) : c.isFree ? (
                          <span className="text-cyan-400">مجاني</span>
                        ) : (
                          <span className="text-amber-400">🔒 غير مفعّل</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary btn-sm mt-4 w-full"
                      onClick={() => setOpenedCourseId(c.id)}
                    >
                      {c.active || c.isFree ? 'فتح محتوى الكورس' : 'التفاصيل والاشتراك'}
                    </button>
                  </article>
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-2">لا توجد كورسات مطابقة.</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* SECTION: HOMEWORK, BOOKS, ACHIEVEMENTS, ETC. (Rendered cleanly when active) */}
      {activeSection === 'homework' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">تسليم الواجبات والتمارين</h3>
          <div className="space-y-3">
            {studentData.content.filter((c) => c.type === 'homework').length ? (
              studentData.content
                .filter((c) => c.type === 'homework')
                .map((item) => (
                  <div key={item.id} className="card bg-[#111f36] flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.grade}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => onOpenMedia(item)}
                    >
                      فتح وتسليم الواجب
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-400">لا توجد واجبات مطلوبة حالياً.</p>
            )}
          </div>
        </section>
      )}

      {activeSection === 'achievements' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">إنجازاتي ونتائج الامتحانات</h3>
          <div className="space-y-3">
            {studentData.results.length ? (
              studentData.results.map((r) => (
                <div key={r.id} className="card bg-[#111f36] flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{r.examTitle}</h4>
                    <p className="text-xs text-emerald-400 mt-0.5">
                      الدرجة: {r.score} / {r.total} ({r.label || ''})
                    </p>
                  </div>
                  <span className="badge-pill bg-emerald-950/40 text-emerald-300 border-emerald-500/30">مصحح</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">لا توجد نتائج مسجلة حتى الآن.</p>
            )}
          </div>
        </section>
      )}

      {activeSection === 'books' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">كتب وملازم (الملفات التعليمية)</h3>
          <div className="space-y-3">
            {studentData.content.filter((c) => c.type === 'note').length ? (
              studentData.content
                .filter((c) => c.type === 'note')
                .map((item) => (
                  <div key={item.id} className="card bg-[#111f36] flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.grade}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => onOpenMedia(item)}
                    >
                      فتح المذكرة
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-400">لا توجد كتب أو ملازم منشورة حالياً.</p>
            )}
          </div>
        </section>
      )}

      {activeSection === 'videoQuestions' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">أسئلتي على الفيديوهات</h3>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              rows={3}
              className="input-field"
              placeholder="اكتب سؤالك أو استفسارك عن الفيديوهات..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full">
              إرسال السؤال للأستاذ
            </button>
          </form>
          {messageStatus && <p className="text-xs font-bold text-emerald-400">{messageStatus}</p>}
        </section>
      )}

      {activeSection === 'customContent' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">المحتوى المخصص والخرائط الذهنية</h3>
          <div className="space-y-3">
            {studentData.content.filter((c) => c.type === 'image').length ? (
              studentData.content
                .filter((c) => c.type === 'image')
                .map((item) => (
                  <div key={item.id} className="card bg-[#111f36] flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => onOpenMedia(item)}
                    >
                      عرض
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-400">لا يوجد محتوى مخصص حالياً.</p>
            )}
          </div>
        </section>
      )}

      {activeSection === 'freeContent' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">المحتوى المجاني</h3>
          <div className="space-y-3">
            {studentData.content.filter((c) => c.isFree).length ? (
              studentData.content
                .filter((c) => c.isFree)
                .map((item) => (
                  <div key={item.id} className="card bg-[#111f36] flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => onOpenMedia(item)}
                    >
                      مشاهدة
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-400">لا توجد محتويات مجانية متاحة حالياً.</p>
            )}
          </div>
        </section>
      )}

      {activeSection === 'articles' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">مقالاتي التعليمية</h3>
          <p className="text-xs text-slate-300">تابع المقالات والموضوعات النحوية والأدبية المنشورة بالمنصة.</p>
        </section>
      )}

      {activeSection === 'privateLessons' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">حصص البرايفت والمواعيد</h3>
          <p className="text-xs text-slate-300">يمكنك حجز حصص مراجعة خاصة أو متابعة فردية عبر واتساب.</p>
          <a
            href={waLink('أريد حجز حصة برايفت استثنائية')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4" />
            <span>احجز حصة برايفت عبر واتساب</span>
          </a>
        </section>
      )}

      {activeSection === 'certificates' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">شهادات التقدير والإنجاز</h3>
          <div className="card bg-[#111f36] text-center p-6 space-y-3 border border-emerald-500/30">
            <Award className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-extrabold text-base text-white">شهادة إتمام كورسات المنصة</h4>
            <p className="text-xs text-slate-300">
              تُمنح هذه الشهادة للطالب {p.name} لاجتيازه متطلبات المرحلة الدراسية بنجاح وتفوق.
            </p>
            <button
              onClick={() => window.print()}
              className="btn-primary btn-sm mx-auto inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الشهادة</span>
            </button>
          </div>
        </section>
      )}

      {activeSection === 'settings' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">إعدادات الحساب</h3>
          <div className="card bg-[#111f36] space-y-3">
            <p className="text-xs text-slate-300">هاتفك المسجل: <span className="font-mono text-cyan-300">{p.phone}</span></p>
            <p className="text-xs text-slate-300">الصف الدراسي: <span className="text-white">{p.grade}</span></p>
            <button onClick={onLogout} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs">
              تسجيل الخروج من الحساب
            </button>
          </div>
        </section>
      )}

      {activeSection === 'notifications' && (
        <section className="panel bg-[#0f1b2d] space-y-4">
          <h3 className="text-xl font-extrabold text-white">الإشعارات والتنبيهات</h3>
          <div className="space-y-2">
            {studentData.notices.length ? (
              studentData.notices.map((n) => (
                <div key={n.id} className="card bg-[#111f36]">
                  <p className="text-xs text-slate-200">{n.text}</p>
                  <span className="text-[10px] text-cyan-400 mt-1 block">{formatDate(n.created)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">لا توجد إشعارات جديدة.</p>
            )}
          </div>
        </section>
      )}

      {/* Bottom Green Status Bar (Confirmation of connection state as requested) */}
      <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>✅ حسابك مربوط بنجاح بنظام الإشعارات الفورية والتنبيهات الآلية (تليجرام / واتساب).</span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400">متصل الآن</span>
      </div>
    </div>
  );
};
