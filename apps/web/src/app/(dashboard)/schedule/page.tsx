'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getScheduledPosts();
      if (res.success) {
        setScheduledPosts(res.data);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate padding days for previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Padding days for next month to complete the grid rows (typically 6 rows/42 cells)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter((post) => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatMonthName = currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Publish Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Map out your marketing schedules and track scheduled copy distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/compose"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Schedule New
          </Link>
        </div>
      </div>

      {/* Calendar Controller */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-indigo-400" />
          {formatMonthName}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] text-slate-400 hover:text-white transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Mapping calendar events...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Days of Week headers */}
          <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01] text-center py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-white/5 border-l border-t border-white/5">
            {days.map((day, idx) => {
              const posts = getPostsForDate(day.date);
              const isToday =
                new Date().toDateString() === day.date.toDateString();

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 flex flex-col justify-between transition-colors ${
                    day.isCurrentMonth ? 'bg-transparent' : 'bg-white/[0.005] text-slate-600'
                  } ${isToday ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold font-mono h-5 w-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-500 text-white font-extrabold'
                          : day.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="group flex flex-col p-1.5 rounded-lg border text-[10px] leading-tight space-y-1 bg-white/[0.02] border-white/5 transition hover:border-indigo-500/20"
                      >
                        <p className="text-slate-300 truncate font-medium">{post.content}</p>
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(post.scheduledAt).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {post.platforms.map((p: any) => (
                              <span
                                key={p.id}
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{
                                  backgroundColor:
                                    p.account.platform === 'FACEBOOK'
                                      ? '#1877f2'
                                      : p.account.platform === 'TWITTER'
                                      ? '#ffffff'
                                      : '#e60023',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
