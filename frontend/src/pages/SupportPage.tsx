import React, { useState, useEffect } from 'react';
import {
  Headphones,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { FAQ, SupportTicket } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const SupportPage: React.FC = () => {
  const { user } = useAuth();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);

  // New ticket state
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [category, setCategory] = useState<string>('Booking');
  const [priority, setPriority] = useState<string>('Medium');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    apiClient<FAQ[]>('/support/faq').then(setFaqs).catch(() => {});
    if (user) {
      apiClient<SupportTicket[]>('/support/tickets').then(setTickets).catch(() => {});
    }
  }, [user]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await apiClient<SupportTicket>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category,
          priority,
        }),
      });
      setSuccessMsg(`Support ticket ${res.ticket_id} opened. Grievance officer will respond shortly.`);
      setSubject('');
      setMessage('');
      apiClient<SupportTicket[]>('/support/tickets').then(setTickets).catch(() => {});
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit support case. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
            24x7 RailMadad Assistance
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            Railway Support & Grievance
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
          <Headphones className="w-5 h-5" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition"
                >
                  <span className="font-bold text-xs text-[#1B254B]">{faq.question}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isExpanded && (
                  <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Support Ticket */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          Open Grievance Ticket
        </h2>

        <form onSubmit={handleSubmitTicket} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1B254B]"
              >
                <option value="Booking">Booking & Reservation</option>
                <option value="Refund">Refunds & Cancellation</option>
                <option value="Suburban">Mumbai Suburban / UTS</option>
                <option value="Cleanliness">Coach Cleanliness & Pantry</option>
                <option value="Other">General RailOne App Enquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1B254B]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Schedule delay on train 12124"
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Message
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed description of your enquiry or grievance..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Support Case'}</span>
          </button>
        </form>
      </div>

      {/* Ticket History */}
      {tickets.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
          <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
            Your Support Cases
          </h2>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{t.ticket_id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        t.status === 'Resolved' || t.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : t.status === 'In Progress' || t.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-slate-800">{t.subject}</div>
                <p className="text-slate-500 text-[11px]">{t.message}</p>
                {t.admin_response && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-900 border border-emerald-200 text-[11px]">
                    <span className="font-bold">Officer Reply:</span> {t.admin_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
