import React, { useState, useRef } from 'react';
import {
  TeacherData,
  GRADES,
  Grade,
} from '../types';
import { apiRequest, tokens, uploadFile } from '../services/api';
import {
  Shield,
  Users,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  Settings,
  PlusCircle,
  Bell,
  Key,
  Upload,
  FileQuestion,
  GraduationCap,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Lock,
  Unlock,
  LogOut,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Wallet,
  Check,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Edit,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  Bot
} from 'lucide-react';

interface TeacherSpaceProps {
  teacherData: TeacherData | null;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
  onBackToStudent: () => void;
  onUpdatePublic?: () => Promise<void>;
}

const ALL_GRADES: (Grade | 'كل الصفوف')[] = ['كل الصفوف', ...GRADES];

export const TeacherSpace: React.FC<TeacherSpaceProps> = ({
  teacherData,
  onRefresh,
  onLogout,
  onBackToStudent,
  onUpdatePublic,
}) => {
  // Auth state
  const [code, setCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Search in accounts
  const [searchQuery, setSearchQuery] = useState('');

  // Settings form
  const [settingsName, setSettingsName] = useState('');
  const [settingsPw, setSettingsPw] = useState('');
  const [settingsPayments, setSettingsPayments] = useState('');
  const [settingsMsg, setSettingsMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // New Course form
  const [cTitle, setCTitle] = useState('');
  const [cGrade, setCGrade] = useState<string>('كل الصفوف');
  const [cPrice, setCPrice] = useState<number>(100);
  const [cDays, setCDays] = useState<number>(30);
  const [cDesc, setCDesc] = useState('');
  const [cIsFree, setCIsFree] = useState(false);
  const [cMsg, setCMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Notice form
  const [nKind, setNKind] = useState<'announcement' | 'schedule'>('announcement');
  const [nText, setNText] = useState('');
  const [nGrade, setNGrade] = useState<string>('كل الصفوف');
  const [nMsg, setNMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Codes generator
  const [codeCourseId, setCodeCourseId] = useState('');
  const [codeCount, setCodeCount] = useState(1);
  const [codeDays, setCodeDays] = useState(30);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Content publisher
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'video' | 'image' | 'note' | 'homework'>('note');
  const [contentTitle, setContentTitle] = useState('');
  const [contentLink, setContentLink] = useState('');
  const [contentCourseId, setContentCourseId] = useState('');
  const [contentGrade, setContentGrade] = useState<string>('كل الصفوف');
  const [contentIsFree, setContentIsFree] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [contentMsg, setContentMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Dynamic Exam Builder
  interface QuestionItem {
    kind: 'mcq' | 'essay';
    q: string;
    options: string[];
    answer: string;
    model: string;
  }
  const [examTitle, setExamTitle] = useState('');
  const [examCourseId, setExamCourseId] = useState('');
  const [examGrade, setExamGrade] = useState<string>('كل الصفوف');
  const [examItems, setExamItems] = useState<QuestionItem[]>([
    {
      kind: 'mcq',
      q: '',
      options: ['', '', '', ''],
      answer: 'أ',
      model: '',
    },
  ]);
  const [examMsg, setExamMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Grading form
  const [gradingScores, setGradingScores] = useState<Record<string, number | string>>({});

  // Message replies
  const [messageReplies, setMessageReplies] = useState<Record<string, string>>({});

  // Appeal scores
  const [appealScores, setAppealScores] = useState<Record<string, string>>({});

  // Active Admin Section (قسمى كله فى أقسام)
  const [activeSection, setActiveSection] = useState<
    | 'all'
    | 'gateways'
    | 'recharges'
    | 'students'
    | 'courses'
    | 'content'
    | 'exams'
    | 'messages'
    | 'codes'
    | 'settings'
    | 'design'
    | 'academicColors'
    | 'studentTabs'
    | 'dashboardOrders'
    | 'mediaBank'
    | 'reviews'
    | 'notifications'
  >('all');

  // Design form state
  const [designName, setDesignName] = useState(teacherData?.name || '');
  const [designSubtitle, setDesignSubtitle] = useState(teacherData?.subtitle || '');
  const [designLogoFile, setDesignLogoFile] = useState(teacherData?.logoFile || '');
  const [designLogoSize, setDesignLogoSize] = useState(teacherData?.logoSize || 36);
  const [designBgPattern, setDesignBgPattern] = useState(teacherData?.bgPattern || 'gradient');
  const [designPrimaryColor, setDesignPrimaryColor] = useState(teacherData?.primaryColor || '#0284c7');
  const [designHeadingColor, setDesignHeadingColor] = useState(teacherData?.headingColor || '#ffffff');
  const [designTextColor, setDesignTextColor] = useState(teacherData?.textColor || '#cbd5e1');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Academic colors state
  const [academicColors, setAcademicColors] = useState<Record<string, string>>(teacherData?.academicColors || {
    examQuestionText: '#ffffff',
    examChoiceText: '#cbd5e1',
    examSelectedBorder: '#06b6d4',
    examTimerBg: '#0f172a',
    examTimerText: '#38bdf8',
    examTimerBorder: '#3b82f6',
    navBtnBg: '#1e293b',
    navBtnText: '#ffffff',
    navBtnBorder: '#475569',
    submitBtnBg: '#10b981',
    homeworkPageBg: '#0b1329',
    homeworkTitleColor: '#38bdf8',
    homeworkCardBg: '#111827',
    homeworkCardBorder: '#374151',
    homeworkNameColor: '#f9fafb',
    contentCardBg: '#1e293b',
    courseDetailsBg: '#0f172a',
    progressColor: '#10b981',
    viewDetailsBtnBg: '#0284c7'
  });

  // Student tabs visibility state
  const [studentTabs, setStudentTabs] = useState<Record<string, boolean>>(teacherData?.studentTabsVisibility || {
    homework: true,
    achievements: true,
    packages: true,
    courses: true,
    books: true,
    videoQuestions: true,
    customContent: true,
    freeContent: true,
    articles: true,
    privateLessons: true,
    certificates: true,
    wallet: true
  });

  // Media bank form state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaType, setMediaType] = useState('video');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaGroup, setMediaGroup] = useState('المجموعة أ');
  const [mediaCenter, setMediaCenter] = useState('سنتر الرئيسي');
  const [mediaGrade, setMediaGrade] = useState(GRADES[0]);
  const [mediaSemester, setMediaSemester] = useState('الترم الأول');
  const [mediaChapter, setMediaChapter] = useState('الفصل الاول');
  const [mediaLesson, setMediaLesson] = useState('');

  // Notifications config state
  const [notifTelegramToken, setNotifTelegramToken] = useState(teacherData?.notificationConfig?.telegramToken || '');
  const [notifTelegramChatId, setNotifTelegramChatId] = useState(teacherData?.notificationConfig?.telegramChatId || '');
  const [notifWhatsappPhone, setNotifWhatsappPhone] = useState(teacherData?.notificationConfig?.whatsappPhone || '');

  // Filters
  const [bookingGradeFilter, setBookingGradeFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // SYSTEM 1: Manual Gateway State
  const [gwId, setGwId] = useState('');
  const [gwTitle, setGwTitle] = useState('');
  const [gwProvider, setGwProvider] = useState('vodafone');
  const [gwAccountNumber, setGwAccountNumber] = useState('');
  const [gwAccountHolder, setGwAccountHolder] = useState('');
  const [gwInstructions, setGwInstructions] = useState('');
  const [gwActive, setGwActive] = useState(true);
  const [gwMsg, setGwMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [gwLoading, setGwLoading] = useState(false);

  // SYSTEM 2: Online Pay Toggle State
  const [onlinePayLoading, setOnlinePayLoading] = useState(false);

  // SYSTEM 5: Recharge Request Review & Zoom Modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [rejectionModalTxId, setRejectionModalTxId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rechargesFilter, setRechargesFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');

  // SYSTEM 3: Adjust Student Balance State
  const [adjustModalStudent, setAdjustModalStudent] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // System 13: Report and Export Modal State
  const [reportStudent, setReportStudent] = useState<any | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // System 1 Handlers
  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwTitle.trim() || !gwAccountNumber.trim()) {
      setGwMsg({ text: 'يرجى كتابة اسم الطريقة ورقم الحساب/المحفظة', ok: false });
      return;
    }
    setGwLoading(true);
    setGwMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/gateway', {
        id: gwId || undefined,
        title: gwTitle.trim(),
        provider: gwProvider,
        accountNumber: gwAccountNumber.trim(),
        accountHolder: gwAccountHolder.trim(),
        instructions: gwInstructions.trim(),
        active: gwActive,
      });
      setGwMsg({ text: 'تم حفظ بوابة الدفع بنجاح!', ok: true });
      setGwId('');
      setGwTitle('');
      setGwAccountNumber('');
      setGwAccountHolder('');
      setGwInstructions('');
      setGwActive(true);
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setGwMsg({ text: err.message || 'تعذر حفظ بوابة الدفع', ok: false });
    } finally {
      setGwLoading(false);
    }
  };

  const handleEditGateway = (gw: any) => {
    setGwId(gw.id);
    setGwTitle(gw.title);
    setGwProvider(gw.provider || 'vodafone');
    setGwAccountNumber(gw.accountNumber || '');
    setGwAccountHolder(gw.accountHolder || '');
    setGwInstructions(gw.instructions || '');
    setGwActive(gw.active !== false);
    setGwMsg(null);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteGateway = async (id: string) => {
    if (!confirm('هل تريد بالتأكيد إزالة طريقة الدفع هذه نهائياً؟')) return;
    try {
      await apiRequest('teacher', '/api/teacher/gateway/delete', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف طريقة الدفع');
    }
  };

  const handleToggleGateway = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/gateway/toggle', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة طريقة الدفع');
    }
  };

  // System 2 Handler
  const handleToggleOnlinePay = async () => {
    setOnlinePayLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/settings/toggle-online-pay', {});
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة الدفع الإلكتروني');
    } finally {
      setOnlinePayLoading(false);
    }
  };

  // System 5 Handlers
  const handleReviewRecharge = async (transactionId: string, action: 'approve' | 'reject', reason?: string) => {
    setReviewLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/wallet/review', {
        transactionId,
        action,
        rejectionReason: reason || rejectionReasonInput,
      });
      setRejectionModalTxId(null);
      setRejectionReasonInput('');
      await onRefresh();
      alert(action === 'approve' ? '✅ تم تأكيد الشحن وإضافة الرصيد لمحفظة الطالب وإرسال إشعار واتساب.' : '❌ تم رفض الطلب وإبلاغ الطالب عبر الواتساب.');
    } catch (err: any) {
      alert(err.message || 'تعذر معالجة الطلب');
    } finally {
      setReviewLoading(false);
    }
  };

  // System 3 Handler
  const handleAdjustStudentBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalStudent || !adjustAmount) return;
    setAdjustLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/wallet/adjust', {
        studentId: adjustModalStudent.id,
        amount: Number(adjustAmount),
        reason: adjustReason || 'تعديل رصيد يدوي من الإدارة',
      });
      setAdjustModalStudent(null);
      setAdjustAmount('');
      setAdjustReason('');
      await onRefresh();
      alert('تم تعديل رصيد محفظة الطالب بنجاح!');
    } catch (err: any) {
      alert(err.message || 'تعذر تعديل الرصيد');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Social Links state & handlers
  const [socialPlatform, setSocialPlatform] = useState('whatsapp');
  const [socialTitle, setSocialTitle] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialMsg, setSocialMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialUrl.trim()) return;
    setSocialLoading(true);
    setSocialMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/social', {
        platform: socialPlatform,
        title: socialTitle.trim() || socialPlatform,
        url: socialUrl.trim(),
      });
      setSocialTitle('');
      setSocialUrl('');
      setSocialMsg({ text: 'تم حفظ زر التواصل بنجاح!', ok: true });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setSocialMsg({ text: err.message || 'تعذر حفظ الرابط', ok: false });
    } finally {
      setSocialLoading(false);
    }
  };

  const handleDeleteSocial = async (id: string) => {
    if (!confirm('هل تريد بالتأكيد حذف هذا الرابط؟')) return;
    try {
      await apiRequest('teacher', '/api/teacher/social/delete', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الرابط');
    }
  };

  const handleToggleSocial = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/social/toggle', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة الرابط');
    }
  };

  // Init settings on load
  React.useEffect(() => {
    if (teacherData) {
      setSettingsName(teacherData.name || '');
      setSettingsPayments(
        (teacherData.payments || [])
          .map((p) => p.title + (p.details ? ' | ' + p.details : ''))
          .join('\n')
      );
    }
  }, [teacherData]);

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await apiRequest('teacher', '/api/teacher/login', { code });
      tokens.teacher = res.token;
      await onRefresh();
    } catch (err: any) {
      setAuthError(err.message || 'كود الأستاذ غير صحيح');
    } finally {
      setAuthLoading(false);
    }
  };

  // If teacherData is not loaded yet
  if (!teacherData) {
    if (tokens.teacher) {
      return (
        <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-12 text-center text-cyan-400 font-bold flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">جاري فتح لوحة إدارة المنصة...</p>
        </div>
      );
    }
    // No direct teacher login form per user instructions
    return (
      <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-8 text-center text-slate-300">
        <p className="text-sm font-bold text-red-400 mb-3">الدخول متاح فقط من نموذج تسجيل الدخول الرئيسي.</p>
        <button onClick={onBackToStudent} className="btn-primary btn-sm">
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  const pendingGradingCount = teacherData.results.filter((r) => r.status !== 'graded').length;
  const unansweredMessagesCount = teacherData.messages.filter((m) => !m.reply).length;

  // Search in accounts filter
  const qClean = searchQuery.trim().toLowerCase();
  const filteredStudents = teacherData.students.filter((s) => {
    if (!qClean) return true;
    const combined = `${s.name} ${s.phone} ${s.parentPhone || ''} ${s.parentName || ''} ${s.code || ''}`.toLowerCase();
    return combined.includes(qClean);
  });

  const filteredParents = teacherData.parents.filter((p) => {
    if (!qClean) return true;
    return (p.name || '').toLowerCase().includes(qClean) || (p.code || '').toLowerCase().includes(qClean);
  });

  // Action handlers
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    try {
      if (heroInputRef.current?.files?.[0]) {
        await uploadFile('/api/teacher/hero', heroInputRef.current.files[0]);
      }
      await apiRequest('teacher', '/api/teacher/settings', {
        name: settingsName,
        password: settingsPw,
        payments: settingsPayments,
      });
      setSettingsMsg({ text: 'تم حفظ الإعدادات بنجاح.', ok: true });
      setSettingsPw('');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setSettingsMsg({ text: err.message || 'تعذر حفظ الإعدادات', ok: false });
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/course', {
        title: cTitle,
        description: cDesc,
        grade: cGrade,
        price: cPrice,
        days: cDays,
        isFree: cIsFree,
      });
      setCMsg({ text: 'تم نشر الكورس بنجاح.', ok: true });
      setCTitle('');
      setCDesc('');
      await onRefresh();
    } catch (err: any) {
      setCMsg({ text: err.message || 'تعذر نشر الكورس', ok: false });
    }
  };

  const handleArchiveCourse = async (id: string) => {
    if (!confirm('هل أنت متأكد من إيقاف هذا الكورس؟')) return;
    try {
      await apiRequest('teacher', '/api/teacher/course/delete', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إيقاف الكورس');
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/notice', {
        kind: nKind,
        text: nText,
        grade: nGrade,
      });
      setNMsg({ text: 'تم نشر الإعلان بنجاح.', ok: true });
      setNText('');
      await onRefresh();
    } catch (err: any) {
      setNMsg({ text: err.message || 'تعذر نشر الإعلان', ok: false });
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/notice/delete', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الإعلان');
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('teacher', '/api/teacher/codes', {
        courseId: codeCourseId,
        count: codeCount,
        days: codeDays,
      });
      setGeneratedCodes(res.codes || []);
      const msg = `أكواد تفعيل ${
        res.course
          ? `كورس ${res.course.title} • السعر ${res.course.price} جنيه • المدة ${res.days} يوم`
          : `الاشتراك العام • المدة ${res.days} يوم`
      }:\n${(res.codes || []).join('\n')}`;
      setGeneratedMsg(msg);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر توليد الأكواد');
    }
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleDeleteCode = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/codes/delete', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الكود');
    }
  };

  const handlePublishContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentMsg(null);

    if (!contentTitle.trim()) {
      setContentMsg({ text: 'أدخل عنوان المحتوى', ok: false });
      return;
    }
    if (!contentFile && !contentLink.trim()) {
      setContentMsg({ text: 'اختر ملفاً من جهازك أو أدخل رابطاً', ok: false });
      return;
    }

    try {
      let meta: any = {};
      if (contentFile) {
        setUploadProgress(0);
        meta = await uploadFile('/api/teacher/upload', contentFile, (p) => {
          setUploadProgress(Math.round(p * 100));
        });
      }

      await apiRequest('teacher', '/api/teacher/content', {
        type: contentType,
        title: contentTitle,
        link: contentLink,
        courseId: contentCourseId,
        grade: contentGrade,
        isFree: contentIsFree,
        ...meta,
      });

      setContentMsg({ text: 'تم نشر المحتوى بنجاح.', ok: true });
      setContentTitle('');
      setContentLink('');
      setContentFile(null);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await onRefresh();
    } catch (err: any) {
      setUploadProgress(null);
      setContentMsg({ text: err.message || 'فشل نشر المحتوى', ok: false });
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    try {
      await apiRequest('teacher', '/api/teacher/content/delete', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف المحتوى');
    }
  };

  // Exam Builder
  const handleAddQuestion = () => {
    setExamItems([
      ...examItems,
      { kind: 'mcq', q: '', options: ['', '', '', ''], answer: 'أ', model: '' },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (examItems.length <= 1) return;
    setExamItems(examItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuestionItem>) => {
    const next = [...examItems];
    next[index] = { ...next[index], ...updates };
    setExamItems(next);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/exam', {
        title: examTitle,
        courseId: examCourseId,
        grade: examGrade,
        items: examItems,
      });
      setExamMsg({ text: 'تم نشر الامتحان بنجاح.', ok: true });
      setExamTitle('');
      setExamItems([
        { kind: 'mcq', q: '', options: ['', '', '', ''], answer: 'أ', model: '' },
      ]);
      await onRefresh();
    } catch (err: any) {
      setExamMsg({ text: err.message || 'تعذر نشر الامتحان', ok: false });
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الامتحان؟')) return;
    try {
      await apiRequest('teacher', '/api/teacher/exam/delete', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الامتحان');
    }
  };

  const handleGradeExam = async (resultId: string, total: number) => {
    const scoreVal = Number(gradingScores[resultId]);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > total) {
      alert(`الدرجة يجب أن تكون بين 0 و ${total}`);
      return;
    }
    try {
      await apiRequest('teacher', '/api/teacher/grade', { id: resultId, score: scoreVal });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الدرجة');
    }
  };

  const handleReplyMessage = async (messageId: string) => {
    const rep = messageReplies[messageId] ?? '';
    try {
      await apiRequest('teacher', '/api/teacher/reply', { id: messageId, reply: rep });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إرسال الرد');
    }
  };

  const handleReviewAppeal = async (appealId: string) => {
    const sc = appealScores[appealId] || '';
    try {
      await apiRequest('teacher', '/api/teacher/appeal', { id: appealId, score: sc });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إنهاء التظلم');
    }
  };

  // Student actions
  const handleStudentAction = async (
    id: string,
    action: 'extend' | 'block' | 'supervisor' | 'delete' | 'setpass'
  ) => {
    if (action === 'delete' && !confirm('هل أنت متأكد من حذف حساب الطالب وولي أمره؟')) return;
    let password = '';
    if (action === 'setpass') {
      const p = prompt('اكتب كلمة السر الجديدة للطالب (4 أحرف على الأقل):');
      if (!p) return;
      password = p;
    }

    try {
      await apiRequest('teacher', '/api/teacher/student', {
        id,
        action,
        days: 30,
        password,
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleParentBlock = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/parent', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة ولي الأمر');
    }
  };

  const LETTERS = ['أ', 'ب', 'ج', 'د'];

  return (
    <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-5 sm:p-8 space-y-6 shadow-2xl">
      {/* Top Banner matching the screenshot */}
      <section
        className="panel border border-blue-500/25 p-6 shadow-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f1c34 0%, #0a1324 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-500/15">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-pill bg-amber-950/40 text-amber-400 border-amber-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>المدير العام للمنظومة (Super Admin)</span>
            </span>
            <span className="badge-pill bg-blue-950/40 text-blue-300 border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>23 أقسام مسموحة من أصل 23</span>
            </span>
            <span className="badge-pill bg-emerald-950/40 text-emerald-400 border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>متصل بالخادم السحابي</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://lern-web7-h2qx.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="badge-pill bg-cyan-950/40 text-cyan-300 border-cyan-400/40 hover:text-white"
            >
              <ExternalLink className="w-3 h-3" />
              <span>فتح منصة ليرن ويب</span>
            </a>
            <button
              onClick={onBackToStudent}
              className="btn-gray btn-sm text-xs"
            >
              <span>مساحة الطالب</span>
            </button>
            <button
              onClick={onLogout}
              className="btn-red btn-sm flex items-center gap-1.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>إدارة منصة</span>
            <a
              href="https://lern-web7-h2qx.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/50"
            >
              ليرن ويب
            </a>
            <span>ونظام المحتوى الشامل</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            تحكم كامل في نشر وحجب الكورسات، الفيديوهات، الامتحانات التفاعلية، إدارة الطلاب وأولياء الأمور،
            توليد الأكواد وتتبع طلبات التعديل والاشتراكات.
          </p>
        </div>

        {/* Feature Badges from the screenshot */}
        <div className="mt-5 pt-4 border-t border-blue-500/15 flex flex-wrap gap-2 text-xs">
          <span className="badge-pill bg-blue-950/50 text-blue-300 border-blue-500/20">
            🤖 المساعد والردود الذكية
          </span>
          <a
            href="https://lern-web7-h2qx.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="badge-pill bg-cyan-950/50 text-cyan-300 border-cyan-500/30 hover:text-white hover:border-cyan-400"
          >
            🎨 تصميم ومطور المنصة الشامل ↗
          </a>
          <span className="badge-pill bg-indigo-950/50 text-indigo-300 border-indigo-500/20">
            👥 إدارة المشرفين والطلاب
          </span>
          <span className="badge-pill bg-emerald-950/50 text-emerald-300 border-emerald-500/20">
            💳 طرق الدفع والتحويل
          </span>
          <span className="badge-pill bg-purple-950/50 text-purple-300 border-purple-500/20">
            📹 فيديوهات يوتيوب والدروس
          </span>
          <span className="badge-pill bg-amber-950/50 text-amber-300 border-amber-500/20">
            🏆 الامتحانات وبنك الأسئلة
          </span>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="card bg-[#111f36] border border-blue-500/20">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold">الطلاب المسجلون</h3>
            </div>
            <p className="text-2xl font-black text-white">{teacherData.students.length}</p>
          </div>

          <div className="card bg-[#111f36] border border-blue-500/20">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold">أولياء الأمور</h3>
            </div>
            <p className="text-2xl font-black text-white">{teacherData.parents.length}</p>
          </div>

          <div className="card bg-[#111f36] border border-blue-500/20">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <FileQuestion className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold">بانتظار التصحيح</h3>
            </div>
            <p className="text-2xl font-black text-red-400">{pendingGradingCount}</p>
          </div>

          <div className="card bg-[#111f36] border border-blue-500/20">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold">رسائل بلا رد</h3>
            </div>
            <p className="text-2xl font-black text-purple-400">{unansweredMessagesCount}</p>
          </div>
        </div>
      </section>

      {/* Grid of Sections: Settings & Social Media Manager */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Settings */}
        <section
          id="admin-settings"
          className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-blue-500/15">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">إعدادات المنصة وصورة الغلاف</h3>
            </div>
            <span className="badge-pill bg-cyan-950/40 text-cyan-300 border-cyan-400/30 text-[11px]">
              لوحة التحكم
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنصة</label>
              <input
                className="input-field"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                صورة المنصة الرسمية (المعروضة بالمنتصف)
              </label>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="input-field text-xs cursor-pointer"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                اختر صورة من جهازك لتحديث صورة المنصة فوراً على الصفحة الرئيسية.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                كلمة مرور الأدمن الجديدة (12 حرفاً على الأقل)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="اتركها فارغة إن لم ترغب في التغيير"
                value={settingsPw}
                onChange={(e) => setSettingsPw(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                طرق الدفع (سطر لكل طريقة: الاسم | التفاصيل — مثال: فودافون كاش | 01000000000)
              </label>
              <textarea
                rows={3}
                className="input-field text-xs"
                value={settingsPayments}
                onChange={(e) => setSettingsPayments(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-gold w-full py-2.5 font-bold cursor-pointer">
              حفظ الإعدادات وصورة المنصة
            </button>

            {settingsMsg && (
              <p
                className={`text-xs font-bold p-2 rounded-xl text-center ${
                  settingsMsg.ok
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-950/60 text-red-300 border border-red-500/30'
                }`}
              >
                {settingsMsg.text}
              </p>
            )}
          </form>
        </section>

        {/* Social Media Links Manager: "وقابلة للتعديل من لوحة التحكم إضافة وحذف" */}
        <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-blue-500/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h3 className="font-extrabold text-lg text-white">أزرار وصفحات التواصل الاجتماعي</h3>
            </div>
            <span className="badge-pill bg-blue-950/40 text-blue-300 border-blue-500/30 text-[11px]">
              تظهر بأسفل الصفحة
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-3">
            تحكم في أزرار التواصل التي تظهر في شريط الأيقونات أسفل المنصة (إضافة، تعديل، حذف، وتفعيل).
          </p>

          {/* Form to Add New Social Link */}
          <form onSubmit={handleSaveSocial} className="space-y-2.5 p-3 rounded-xl bg-[#0a1322] border border-blue-500/20 mb-4">
            <h4 className="text-xs font-extrabold text-cyan-300">إضافة زر تواصل جديد</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">المنصة</label>
                <select
                  className="input-field text-xs py-1.5"
                  value={socialPlatform}
                  onChange={(e) => {
                    setSocialPlatform(e.target.value);
                    if (!socialTitle) setSocialTitle(e.target.value);
                  }}
                >
                  <option value="whatsapp">واتساب (WhatsApp)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="instagram">انستجرام (Instagram)</option>
                  <option value="telegram">تيليجرام (Telegram)</option>
                  <option value="youtube">يوتيوب (YouTube)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="x">إكس / تويتر (X / Twitter)</option>
                  <option value="linkedin">لينكد إن (LinkedIn)</option>
                  <option value="custom">موقع أو رابط آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">الاسم أو العنوان</label>
                <input
                  type="text"
                  placeholder="مثال: قناة التيليجرام"
                  className="input-field text-xs py-1.5"
                  value={socialTitle}
                  onChange={(e) => setSocialTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">الرابط المباشر (URL)</label>
              <input
                type="url"
                required
                dir="ltr"
                placeholder="https://..."
                className="input-field text-xs py-1.5"
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={socialLoading || !socialUrl.trim()}
              className="btn-cyan w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{socialLoading ? 'جاري الحفظ...' : 'إضافة زر التواصل'}</span>
            </button>

            {socialMsg && (
              <p
                className={`text-[11px] font-bold p-1.5 rounded-lg text-center ${
                  socialMsg.ok ? 'text-emerald-300 bg-emerald-950/50' : 'text-red-300 bg-red-950/50'
                }`}
              >
                {socialMsg.text}
              </p>
            )}
          </form>

          {/* List of current social links */}
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            <h4 className="text-xs font-extrabold text-slate-300">الأزرار الحالية ({teacherData.socialLinks?.length || 0}):</h4>
            {(teacherData.socialLinks || []).length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد أزرار تواصل مضافة حالياً.</p>
            ) : (
              (teacherData.socialLinks || []).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0a1424] border border-blue-500/20 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{s.title || s.platform}</p>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline truncate block"
                      >
                        {s.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSocial(s.id)}
                      className={`text-[10px] px-2 py-1 rounded-lg font-bold border transition-colors ${
                        s.active !== false
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {s.active !== false ? 'مفعل' : 'معطل'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSocial(s.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Publish New Course */}
        <section className="panel" style={{ background: '#f4fafb' }}>
          <div className="flex items-center gap-2 mb-3">
            <PlusCircle className="w-5 h-5 text-[#146c94]" />
            <h3 className="font-extrabold text-lg text-[#102a43]">نشر كورس جديد</h3>
          </div>
          <form onSubmit={handleCreateCourse} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الكورس</label>
              <input
                required
                className="input-field"
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
              <select
                className="input-field"
                value={cGrade}
                onChange={(e) => setCGrade(e.target.value)}
              >
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                السعر بالجنيه
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="input-field"
                value={cPrice}
                onChange={(e) => setCPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مدة الكورس بالأيام
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                required
                className="input-field"
                value={cDays}
                onChange={(e) => setCDays(Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">وصف الكورس</label>
              <textarea
                rows={2}
                className="input-field"
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="cFree"
                checked={cIsFree}
                onChange={(e) => setCIsFree(e.target.checked)}
                className="rounded text-[#146c94]"
              />
              <label htmlFor="cFree" className="text-xs font-bold text-slate-700 cursor-pointer">
                كورس مجاني متاح للجميع
              </label>
            </div>
            <button type="submit" className="btn-gold sm:col-span-2">
              نشر الكورس
            </button>
            {cMsg && (
              <p
                className={`sm:col-span-2 text-xs font-bold ${
                  cMsg.ok ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {cMsg.text}
              </p>
            )}
          </form>

          {/* List of existing courses */}
          <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-500">الكورسات المنشورة الحالية:</h4>
            <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto">
              {teacherData.courses.map((c) => (
                <div key={c.id} className="card bg-white p-2.5 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#102a43]">{c.title}</p>
                    <p className="text-slate-500">
                      {c.grade} • {c.price} ج • {c.days} يوم {c.status === 'archived' && '(مؤرشف)'}
                    </p>
                  </div>
                  {c.status === 'published' && (
                    <button
                      type="button"
                      onClick={() => handleArchiveCourse(c.id)}
                      className="btn-red btn-sm text-[10px]"
                    >
                      إيقاف
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Notices & Announcements */}
      <section className="panel" style={{ background: '#fffaf1' }}>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-amber-600" />
          <h3 className="font-extrabold text-lg text-[#102a43]">نشر إعلان أو موعد درس</h3>
        </div>
        <form onSubmit={handleCreateNotice} className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">النوع</label>
            <select
              className="input-field"
              value={nKind}
              onChange={(e) => setNKind(e.target.value as any)}
            >
              <option value="announcement">إعلان عام</option>
              <option value="schedule">موعد درس</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الصف المستهدف</label>
            <select
              className="input-field"
              value={nGrade}
              onChange={(e) => setNGrade(e.target.value)}
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">نص الإعلان</label>
            <textarea
              rows={2}
              required
              className="input-field"
              value={nText}
              onChange={(e) => setNText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary sm:col-span-3">
            نشر الإعلان
          </button>
          {nMsg && (
            <p
              className={`sm:col-span-3 text-xs font-bold ${
                nMsg.ok ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {nMsg.text}
            </p>
          )}
        </form>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto">
          {teacherData.notices.map((n) => (
            <div key={n.id} className="card bg-white p-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-[#146c94]">
                  [{n.kind === 'schedule' ? 'موعد درس' : 'إعلان'}] - {n.grade}:
                </span>
                <p className="mt-1 text-slate-700">{n.text}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteNotice(n.id)}
                className="btn-red btn-sm text-[10px]"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Activation Codes */}
      <section className="panel" style={{ background: '#f4fafb' }}>
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-[#146c94]" />
          <h3 className="font-extrabold text-lg text-[#102a43]">
            أكواد التفعيل (الدفع والاشتراكات)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          اختَر الكورس أو الاشتراك العام، وبعد استلام الدفع أرسل كود التفعيل للطالب عبر واتساب. كل
          كود يستخدم مرة واحدة فقط.
        </p>

        <form onSubmit={handleGenerateCodes} className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الكورس / الاشتراك</label>
            <select
              className="input-field"
              value={codeCourseId}
              onChange={(e) => {
                const cId = e.target.value;
                setCodeCourseId(cId);
                const found = teacherData.courses.find((x) => x.id === cId);
                if (found) setCodeDays(found.days);
              }}
            >
              <option value="">اشتراك عام</option>
              {teacherData.courses
                .filter((c) => c.status === 'published')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} • {c.days} يوم
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عدد الأكواد (1–100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              className="input-field"
              value={codeCount}
              onChange={(e) => setCodeCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المدة بالأيام</label>
            <input
              type="number"
              min="1"
              max="3650"
              className="input-field"
              value={codeDays}
              onChange={(e) => setCodeDays(Number(e.target.value))}
            />
          </div>
          <button type="submit" className="btn-gold self-end py-2.5">
            توليد الأكواد
          </button>
        </form>

        {generatedCodes.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <h4 className="text-xs font-extrabold text-[#102a43] mb-2">الأكواد المولدة حديثاً:</h4>
            <textarea
              rows={3}
              readOnly
              dir="ltr"
              className="input-field font-mono text-xs bg-white"
              value={generatedCodes.join('\n')}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCopyCodes}
                className="btn-primary btn-sm flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copyStatus ? 'تم النسخ!' : 'نسخ الأكواد'}</span>
              </button>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://wa.me/?text=${encodeURIComponent(generatedMsg)}`}
                className="btn-sm flex items-center gap-1 bg-[#25D366] text-white font-bold"
              >
                <span>إرسال عبر واتساب</span>
              </a>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-3 max-h-56 overflow-y-auto">
          <div className="card bg-white p-2 text-xs">
            <b>أكواد غير مستخدمة:</b>{' '}
            {teacherData.codes.filter((c) => c.status === 'unused').length}
          </div>
          <div className="card bg-white p-2 text-xs">
            <b>أكواد مستخدمة:</b>{' '}
            {teacherData.codes.filter((c) => c.status === 'used').length}
          </div>
          {teacherData.codes
            .slice(-30)
            .reverse()
            .map((c) => {
              const course = teacherData.courses.find((x) => x.id === c.courseId);
              return (
                <div
                  key={c.id}
                  className="card bg-white p-2 text-[11px] flex justify-between items-center"
                >
                  <div>
                    {course ? `${course.title} • ` : 'اشتراك عام • '}
                    كود ينتهي بـ <b dir="ltr">{c.hint}</b> • {c.days} يوم (
                    {c.status === 'unused' ? 'جاهز' : c.status === 'used' ? 'مستخدم' : 'ملغي'})
                  </div>
                  {c.status === 'unused' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCode(c.id)}
                      className="btn-red btn-sm text-[10px]"
                    >
                      حذف
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      {/* Publish Content */}
      <section className="panel" style={{ background: '#fffaf1' }}>
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-5 h-5 text-amber-600" />
          <h3 className="font-extrabold text-lg text-[#102a43]">
            نشر فيديو أو صورة أو مذكرة أو واجب
          </h3>
        </div>

        <form onSubmit={handlePublishContent} className="grid gap-3 md:grid-cols-2">
          {/* File Picker Fast Buttons */}
          <div className="md:col-span-2">
            <span className="block text-xs font-bold text-slate-700 mb-2">
              اضغط على نوع الملف لاختياره من جهازك:
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ['video/*', 'video', '🎬', 'فيديو'],
                  ['image/*', 'image', '🖼️', 'صورة'],
                  ['application/pdf,.pdf', 'note', '📄', 'PDF مذكرة'],
                  ['', 'note', '📎', 'أي ملف آخر'],
                ] as const
              ).map(([accept, type, emoji, text]) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => {
                    setContentType(type as any);
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = accept;
                      fileInputRef.current.click();
                    }
                  }}
                  className="card text-center hover:border-[#146c94] transition-all p-3"
                >
                  <span className="text-2xl">{emoji}</span>
                  <p className="mt-1 text-xs font-bold text-[#102a43]">{text}</p>
                </button>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setContentFile(f);
                  if (!contentTitle.trim()) {
                    setContentTitle(f.name.replace(/\.[^.]+$/, ''));
                  }
                }
              }}
            />
            {contentFile && (
              <p className="mt-2 text-xs font-bold text-[#146c94]">
                تم اختيار الملف: {contentFile.name} ({(contentFile.size / 1048576).toFixed(1)} MB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع المحتوى</label>
            <select
              className="input-field"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
            >
              <option value="video">فيديو</option>
              <option value="note">مذكرة / ملف</option>
              <option value="homework">واجب</option>
              <option value="image">صورة / خريطة ذهنية</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الكورس (اختياري)
            </label>
            <select
              className="input-field"
              value={contentCourseId}
              onChange={(e) => setContentCourseId(e.target.value)}
            >
              <option value="">محتوى عام بالمنصة</option>
              {teacherData.courses
                .filter((c) => c.status === 'published')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} • {c.days} يوم
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الصف المستهدف</label>
            <select
              className="input-field"
              value={contentGrade}
              onChange={(e) => setContentGrade(e.target.value)}
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المحتوى</label>
            <input
              required
              className="input-field"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رابط خارجي (YouTube أو رابط فيديو مباشر إن لم ترفع ملفاً)
            </label>
            <input
              type="url"
              dir="ltr"
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field"
              value={contentLink}
              onChange={(e) => setContentLink(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="contentFree"
              checked={contentIsFree}
              onChange={(e) => setContentIsFree(e.target.checked)}
              className="rounded text-[#146c94]"
            />
            <label htmlFor="contentFree" className="text-xs font-bold text-slate-700 cursor-pointer">
              محتوى مجاني ومتاح بدون اشتراك
            </label>
          </div>

          {uploadProgress !== null && (
            <div className="md:col-span-2">
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#146c94] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs font-bold text-[#146c94]">
                جاري الرفع: {uploadProgress}%
              </p>
            </div>
          )}

          <button type="submit" className="btn-primary md:col-span-2 py-2.5">
            نشر المحتوى
          </button>
          {contentMsg && (
            <p
              className={`md:col-span-2 text-xs font-bold ${
                contentMsg.ok ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {contentMsg.text}
            </p>
          )}
        </form>

        {/* Existing Content List */}
        <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
          <h4 className="text-xs font-bold text-slate-500">المحتوى المنشور حالياً:</h4>
          <div className="grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto">
            {teacherData.content.map((c) => (
              <div
                key={c.id}
                className="card bg-white p-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#102a43]">
                    {c.type === 'video'
                      ? '🎬'
                      : c.type === 'note'
                      ? '📄'
                      : c.type === 'homework'
                      ? '📝'
                      : '🖼️'}{' '}
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.grade} {c.isFree && '• مجاني'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteContent(c.id)}
                  className="btn-red btn-sm text-[10px]"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Electronic Exam Builder */}
      <section className="panel" style={{ background: '#f4fafb' }}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-[#146c94]" />
          <h3 className="font-extrabold text-lg text-[#102a43]">إنشاء امتحان إلكتروني</h3>
        </div>

        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان الامتحان
              </label>
              <input
                required
                className="input-field"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الكورس (اختياري)
              </label>
              <select
                className="input-field"
                value={examCourseId}
                onChange={(e) => setExamCourseId(e.target.value)}
              >
                <option value="">امتحان عام</option>
                {teacherData.courses
                  .filter((c) => c.status === 'published')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الصف المستهدف
              </label>
              <select
                className="input-field"
                value={examGrade}
                onChange={(e) => setExamGrade(e.target.value)}
              >
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Questions */}
          <div className="space-y-3">
            {examItems.map((item, idx) => (
              <div key={idx} className="card bg-white border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#146c94]">
                      السؤال رقم {idx + 1}
                    </span>
                    <select
                      className="input-field text-xs py-1 px-2"
                      value={item.kind}
                      onChange={(e) =>
                        handleUpdateQuestion(idx, { kind: e.target.value as any })
                      }
                    >
                      <option value="mcq">سؤال اختياري</option>
                      <option value="essay">سؤال مقالي</option>
                    </select>
                  </div>
                  {examItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="btn-red btn-sm text-[10px]"
                    >
                      حذف
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="نص السؤال..."
                  className="input-field text-xs mb-2"
                  value={item.q}
                  onChange={(e) => handleUpdateQuestion(idx, { q: e.target.value })}
                />

                {item.kind === 'mcq' ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {LETTERS.map((letter, optIdx) => (
                      <input
                        key={letter}
                        required
                        placeholder={`الاختيار ${letter}`}
                        className="input-field text-xs"
                        value={item.options[optIdx] || ''}
                        onChange={(e) => {
                          const nextOpts = [...item.options];
                          nextOpts[optIdx] = e.target.value;
                          handleUpdateQuestion(idx, { options: nextOpts });
                        }}
                      />
                    ))}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">الإجابة الصحيحة:</span>
                      <select
                        className="input-field text-xs w-32"
                        value={item.answer}
                        onChange={(e) => handleUpdateQuestion(idx, { answer: e.target.value })}
                      >
                        {LETTERS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={2}
                      placeholder="نموذج الإجابة للسؤال المقالي (للتصحيح بالذكاء الاصطناعي أو المراجعة)..."
                      className="input-field text-xs"
                      value={item.model}
                      onChange={(e) => handleUpdateQuestion(idx, { model: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="btn-gray btn-sm flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ إضافة سؤال آخر</span>
          </button>

          <button type="submit" className="btn-gold w-full py-2.5">
            نشر الامتحان
          </button>
          {examMsg && (
            <p
              className={`text-xs font-bold ${
                examMsg.ok ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {examMsg.text}
            </p>
          )}
        </form>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold text-slate-500 mb-2">الامتحانات الحالية:</h4>
          <div className="flex flex-wrap gap-2">
            {teacherData.exams.map((e) => (
              <span
                key={e.id}
                className="card bg-white text-xs py-1.5 px-3 flex items-center gap-2"
              >
                <b>{e.title}</b> ({e.questions.length} سؤال)
                <button
                  type="button"
                  onClick={() => handleDeleteExam(e.id)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grading & Replies */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grading */}
        <section className="panel" style={{ background: '#fffaf1' }}>
          <h3 className="font-extrabold text-lg text-[#102a43] mb-3">
            تصحيح إجابات الطلاب ({pendingGradingCount} بانتظار التصحيح)
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {teacherData.results.filter((r) => r.status !== 'graded').length ? (
              teacherData.results
                .filter((r) => r.status !== 'graded')
                .map((r) => (
                  <div key={r.id} className="card bg-white border p-3">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-[#146c94]">{r.examTitle}</span>
                      <span className="font-extrabold text-slate-800">{r.studentName}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap mt-1">
                      الإجابات: {r.answers.join(' | ')}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={r.total}
                        step="0.5"
                        placeholder={`الدرجة من ${r.total}`}
                        className="input-field text-xs py-1"
                        value={gradingScores[r.id] ?? ''}
                        onChange={(e) =>
                          setGradingScores({ ...gradingScores, [r.id]: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleGradeExam(r.id, r.total)}
                        className="btn-gold btn-sm shrink-0"
                      >
                        حفظ التصحيح
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-500">لا توجد إجابات بانتظار التصحيح.</p>
            )}
          </div>
        </section>

        {/* Student Messages */}
        <section className="panel" style={{ background: '#f4fafb' }}>
          <h3 className="font-extrabold text-lg text-[#102a43] mb-3">رسائل الطلاب والردود</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {teacherData.messages.length ? (
              teacherData.messages.map((m) => (
                <div key={m.id} className="card bg-white border p-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-[#102a43]">{m.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.created).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded mb-2">{m.text}</p>
                  <textarea
                    rows={2}
                    placeholder="اكتب ردك على الطالب..."
                    className="input-field text-xs mb-2"
                    value={messageReplies[m.id] ?? m.reply}
                    onChange={(e) =>
                      setMessageReplies({ ...messageReplies, [m.id]: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleReplyMessage(m.id)}
                    className="btn-primary btn-sm"
                  >
                    إرسال الرد
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">لا توجد رسائل من الطلاب.</p>
            )}
          </div>
        </section>
      </div>

      {/* Appeals */}
      <section className="panel" style={{ background: '#fffaf1' }}>
        <h3 className="font-extrabold text-lg text-[#102a43] mb-3">تظلمات الطلاب</h3>
        <div className="grid gap-3 sm:grid-cols-2 max-h-60 overflow-y-auto">
          {teacherData.appeals.length ? (
            teacherData.appeals.map((a) => (
              <div key={a.id} className="card bg-white p-3 border">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#102a43]">{a.studentName}</span>
                  <span className="text-slate-500">{a.examTitle}</span>
                </div>
                <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2 rounded">
                  السبب: {a.reason}
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  الحالة: {a.status === 'reviewed' ? 'تمت المراجعة' : 'بانتظار المراجعة'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    placeholder="الدرجة المعدلة (اختياري)..."
                    className="input-field text-xs py-1"
                    value={appealScores[a.id] ?? a.score}
                    onChange={(e) =>
                      setAppealScores({ ...appealScores, [a.id]: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleReviewAppeal(a.id)}
                    className="btn-gold btn-sm shrink-0"
                  >
                    إنهاء المراجعة
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">لا توجد تظلمات مقدمة.</p>
          )}
        </div>
      </section>

      {/* Accounts & Students Management */}
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-extrabold text-lg text-[#102a43]">إدارة الطلاب والاشتراكات</h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              className="input-field pr-9 text-xs"
              placeholder="ابحث بالاسم أو رقم الهاتف أو ولي الأمر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 max-h-[500px] overflow-y-auto">
          {filteredStudents.map((s) => {
            const hasActiveSub = s.subEnd && new Date(s.subEnd) > new Date();

            return (
              <div key={s.id} className="card bg-slate-50 border p-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#102a43]">{s.name}</h4>
                    <p className="text-slate-500 mt-0.5">
                      {s.grade} • كود: <span dir="ltr">{s.code}</span>
                    </p>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      s.status === 'blocked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {s.status === 'blocked' ? 'محجوب' : 'نشط'}
                  </span>
                </div>

                <div className="mt-2 text-slate-600 bg-white p-2 rounded border border-slate-100 space-y-0.5">
                  <p>
                    هاتف الطالب: <span dir="ltr">{s.phone}</span>
                  </p>
                  <p>
                    ولي الأمر: {s.parentName} (<span dir="ltr">{s.parentPhone}</span>)
                  </p>
                  <p>
                    العنوان: {s.governorate} • {s.center} {s.village && `• ${s.village}`}
                  </p>
                  <p>
                    الاشتراك:{' '}
                    <span
                      className={`font-bold ${
                        hasActiveSub ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {hasActiveSub
                        ? `مفعّل حتى ${new Date(s.subEnd).toLocaleDateString('ar-EG')}`
                        : 'غير مفعّل'}
                    </span>
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReportStudent(s)}
                    className="btn-gold btn-sm text-[10px] font-bold"
                  >
                    📊 تقرير الطالب
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStudentAction(s.id, 'extend')}
                    className="btn-green btn-sm text-[10px]"
                  >
                    {hasActiveSub ? '+30 يوم' : 'تفعيل 30 يوم'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStudentAction(s.id, 'block')}
                    className={`btn-sm text-[10px] ${
                      s.status === 'blocked' ? 'btn-green' : 'btn-red'
                    }`}
                  >
                    {s.status === 'blocked' ? 'فك الحجب' : 'حجب'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStudentAction(s.id, 'setpass')}
                    className="btn-gray btn-sm text-[10px]"
                  >
                    كلمة سر جديدة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStudentAction(s.id, 'supervisor')}
                    className="btn-primary btn-sm text-[10px]"
                  >
                    {s.supervisor ? 'إلغاء الإشراف' : 'ترقية لمشرف'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStudentAction(s.id, 'delete')}
                    className="btn-red btn-sm text-[10px]"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}

          {filteredParents.map((p) => (
            <div key={p.id} className="card bg-slate-50 border p-3 text-xs flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-[#102a43]">حساب ولي أمر: {p.name}</h4>
                <p className="text-slate-500">
                  كود المتابعة: <span dir="ltr">{p.code}</span> •{' '}
                  {p.status === 'blocked' ? 'محجوب' : 'نشط'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleParentBlock(p.id)}
                className={`btn-sm text-[10px] ${
                  p.status === 'blocked' ? 'btn-green' : 'btn-red'
                }`}
              >
                {p.status === 'blocked' ? 'فك الحجب' : 'حجب'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* REPORT & EXPORT MODAL */}
      {reportStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1b2d] border border-blue-500/30 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h3 className="font-black text-lg text-white">تقرير متابعة الطالب: {reportStudent.name}</h3>
              <button
                onClick={() => setReportStudent(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
              <p><b>الصف الدراسي:</b> {reportStudent.grade}</p>
              <p><b>رقم هاتف الطالب:</b> <span dir="ltr">{reportStudent.phone}</span></p>
              <p><b>اسم ولي الأمر:</b> {reportStudent.parentName || 'غير مسجل'}</p>
              <p><b>هاتف ولي الأمر:</b> <span dir="ltr">{reportStudent.parentPhone || 'غير مسجل'}</span></p>
              <p><b>حالة الاشتراك:</b> {reportStudent.subEnd && new Date(reportStudent.subEnd) > new Date() ? 'مفعّل' : 'غير مفعّل'}</p>
            </div>

            {!reportStudent.parentPhone || !reportStudent.parentPhone.trim() ? (
              <div className="rounded-xl bg-amber-950/60 border border-amber-500/50 p-3.5 text-xs font-bold text-amber-300 leading-relaxed">
                ⚠️ لا يوجد رقم ولي أمر مسجل عبر بوابة المتابعة لهذا الطالب، استخدم الواتساب أو الـ PDF.
              </div>
            ) : null}

            <div className="pt-2 flex flex-wrap gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => {
                  const phone = reportStudent.parentPhone || reportStudent.phone;
                  const text = `تقرير متابعة الطالب: ${reportStudent.name}\nالصف: ${reportStudent.grade}\nالاشتراك: ${reportStudent.subEnd && new Date(reportStudent.subEnd) > new Date() ? 'مفعّل' : 'غير مفعّل'}\nمنصة ليرن ويب التعليمية`;
                  window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="btn-primary btn-sm flex items-center gap-1.5 font-bold py-2.5 px-4 text-xs"
              >
                <span>إرسال نص واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="btn-gold btn-sm flex items-center gap-1.5 font-bold py-2.5 px-4 text-xs"
              >
                <span>توليد PDF للتقرير</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `تقرير متابعة الطالب: ${reportStudent.name} (${reportStudent.grade})`;
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="btn-cyan btn-sm flex items-center gap-1.5 font-bold py-2.5 px-4 text-xs"
              >
                <span>إرسال عبر تليجرام</span>
              </button>

              <button
                type="button"
                onClick={() => setReportStudent(null)}
                className="btn-gray btn-sm font-bold py-2.5 px-4 text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
