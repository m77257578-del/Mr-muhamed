import React, { useState } from 'react';
import { ParentData } from '../types';
import { apiRequest, tokens } from '../services/api';
import {
  User,
  CheckCircle,
  Video,
  FileText,
  ClipboardList,
  TrendingUp,
  Clock,
  LogOut,
  AlertCircle,
} from 'lucide-react';

interface ParentSpaceProps {
  parentData: ParentData | null;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
}

const daysLeft = (d?: string) => {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 864e5));
};

export const ParentSpace: React.FC<ParentSpaceProps> = ({
  parentData,
  onRefresh,
  onLogout,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('parent', '/api/parent/login', { phone, password });
      tokens.parent = res.token;
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'رقم الهاتف أو كلمة السر غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  // NOT LOGGED IN
  if (!parentData) {
    return (
      <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-5 sm:p-8 shadow-2xl">
        <section className="panel mx-auto max-w-xl border border-blue-500/20 bg-[#0f1b2d]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/15">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-extrabold text-white">متابعة مستوى الطالب</h2>
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
          <p className="text-xs text-slate-300 mb-4">
            ادخل برقم هاتف ابنك (الطالب) وكلمة السر المسجل بها للاطلاع على حضوره ونتائجه ومستواه.
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-500/30 p-3 text-sm font-bold text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                رقم هاتف الطالب (ابنك)
              </label>
              <input
                type="tel"
                inputMode="tel"
                dir="ltr"
                required
                placeholder="01xxxxxxxxx"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-2.5 font-extrabold text-base shadow"
            >
              {loading ? 'جاري الفتح...' : 'فتح مساحة المتابعة'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  const p = parentData.progress;

  return (
    <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-5 sm:p-8 space-y-6 shadow-2xl">
      {/* Student Profile Overview */}
      <section className="panel border border-blue-500/20 bg-[#0f1b2d]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="badge-pill bg-cyan-950/40 text-cyan-300 border-cyan-400/30 mb-2">
              مساحة ولي الأمر • تصميم ليرن ويب
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">بيانات الطالب والمتابعة</h2>
          </div>
          <button
            onClick={onLogout}
            className="btn-gray btn-sm flex items-center gap-1.5 font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="card bg-[#111f36] border border-blue-500/20">
            <h3 className="text-xs font-bold text-slate-400">اسم الطالب</h3>
            <p className="text-base font-extrabold text-white mt-1">{parentData.name}</p>
          </div>
          <div className="card bg-[#111f36] border border-blue-500/20">
            <h3 className="text-xs font-bold text-slate-400">الصف الدراسي</h3>
            <p className="text-base font-extrabold text-cyan-400 mt-1">{parentData.grade}</p>
          </div>
          <div className="card bg-[#111f36] border border-blue-500/20">
            <h3 className="text-xs font-bold text-slate-400">حالة الحساب</h3>
            <p className="text-base font-extrabold mt-1 text-emerald-400">
              {parentData.status}
            </p>
          </div>
          <div className="card bg-[#111f36] border border-blue-500/20">
            <h3 className="text-xs font-bold text-slate-400">حالة الاشتراك</h3>
            <p className="text-base font-extrabold mt-1 text-cyan-300">
              {parentData.sub
                ? `مفعّل (${daysLeft(parentData.subEnd)} يوم)`
                : 'غير مفعّل'}
            </p>
          </div>
        </div>
      </section>

      {/* Progress Breakdown */}
      <section className="panel">
        <h2 className="text-xl font-extrabold text-[#102a43] mb-4">مستوى التقدم والنشاط</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Video className="w-4 h-4 text-[#146c94]" />
              <h3 className="text-xs font-bold">فيديوهات شاهدها</h3>
            </div>
            <p className="text-lg font-extrabold text-[#102a43]">
              {p.videosWatched} من {p.videosTotal}
            </p>
          </div>

          <div className="card bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <FileText className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold">ملفات ومذكرات فتحها</h3>
            </div>
            <p className="text-lg font-extrabold text-[#102a43]">
              {p.filesOpened} من {p.filesTotal}
            </p>
          </div>

          <div className="card bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold">امتحانات حلّها</h3>
            </div>
            <p className="text-lg font-extrabold text-[#102a43]">
              {p.examsDone} من {p.examsTotal}
            </p>
          </div>

          <div className="card bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold">ملاحظات دراسية دوّنها</h3>
            </div>
            <p className="text-lg font-extrabold text-[#102a43]">{p.notes}</p>
          </div>

          <div className="card bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold">متوسط درجات الامتحانات</h3>
            </div>
            <p className="text-lg font-extrabold text-emerald-700">
              {p.average === null ? '—' : `${p.average}%`}
            </p>
          </div>

          <div className="card bg-slate-50">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <CheckCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold">التقدير العام</h3>
            </div>
            <p className="text-lg font-extrabold text-[#146c94]">{p.label || '—'}</p>
          </div>
        </div>

        {p.lastActive && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>آخر نشاط للطالب على المنصة: {new Date(p.lastActive).toLocaleString('ar-EG')}</span>
          </p>
        )}
      </section>

      {/* Exam Results */}
      <section className="panel" style={{ background: '#fffaf1' }}>
        <h2 className="text-xl font-extrabold text-[#102a43] mb-3">نتائج الامتحانات</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {parentData.results.length ? (
            parentData.results.map((r) => (
              <div key={r.id} className="card bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#102a43]">{r.examTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(r.created).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold text-[#146c94]">
                    {r.score !== null ? `${r.score} / ${r.total}` : 'بانتظار التصحيح'}
                  </p>
                  {r.label && (
                    <span className="text-[11px] font-bold text-emerald-700">{r.label}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">لا توجد نتائج امتحانات مرسلة حتى الآن.</p>
          )}
        </div>
      </section>
    </div>
  );
};
