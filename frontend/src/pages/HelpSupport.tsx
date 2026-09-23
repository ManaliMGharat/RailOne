import React, { useState } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, Phone, Mail, 
  ShieldAlert, FileText, CheckCircle2 
} from 'lucide-react';

export const HelpSupport: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the 10-digit PNR tracking work?',
      a: 'A Passenger Name Record (PNR) is a unique 10-digit identification code generated upon successful reservation. It records your train number, journey date, class, coach and berth allocation. You can enter your 10-digit PNR on the RailOne PNR Status page to check real-time confirmation status.',
    },
    {
      q: 'What is the difference between CNF, RAC, and WL?',
      a: 'CNF (Confirmed) means you have a dedicated confirmed berth/seat. RAC (Reservation Against Cancellation) guarantees travel on the train with a shared seat, upgrading to confirmed berth if cancellations occur. WL (Waitlisted) indicates you are on the waiting list; tickets can only be boarded if upgraded before chart preparation.',
    },
    {
      q: 'What are the ticket cancellation and refund policies?',
      a: 'Tickets can be cancelled online up to 4 hours before scheduled departure. Flat cancellation fees apply per passenger based on the travel class (₹60 for 2S, ₹120 for Sleeper, ₹180 for 3A/CC, ₹200 for 2A, ₹240 for 1A). The remaining balance is refunded instantly to your original payment method.',
    },
    {
      q: 'Do infants and children require separate reservations?',
      a: 'Children under 5 years of age travel free without a separate berth. For children between 5 and 11 years, full fare applies if an exclusive berth is requested, or half fare without a berth.',
    },
    {
      q: 'Which identity documents are valid for train travel in India?',
      a: 'Accepted government IDs include Aadhaar Card, Voter Identity Card, Passport, Driving License, PAN Card, or Student ID issued by recognized institutions.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-rail-50 text-rail-600 flex items-center justify-center mx-auto mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Support Center</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Find answers to frequently asked reservation questions and contact our 24x7 passenger support team.
        </p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rail-50 text-rail-600 flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">National Helpline</h3>
          <p className="text-xl font-black text-rail-700">139</p>
          <span className="text-[10px] text-slate-400 block">Toll-free 24x7 Multi-lingual</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Security & Emergency</h3>
          <p className="text-xl font-black text-rose-600">182</p>
          <span className="text-[10px] text-slate-400 block">Railway Protection Force (RPF)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Email Grievances</h3>
          <p className="text-xs font-bold text-slate-900 truncate">support@railone.local</p>
          <span className="text-[10px] text-slate-400 block">Typical response within 2 hours</span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left px-4 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
