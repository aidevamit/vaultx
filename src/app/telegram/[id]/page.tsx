'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TelegramAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'info' | 'error' | 'confirm', onConfirm?: () => void}>({ isOpen: false, title: '', message: '', type: 'info' });

  // Update Data Modal State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateUsername, setUpdateUsername] = useState('');
  const [updateAdPostCode, setUpdateAdPostCode] = useState('');
  const [updateAdStartDate, setUpdateAdStartDate] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch(`/api/telegrams/${unwrappedParams.id}`);
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setAccount(data);
        }
      } catch (err) {
        setError('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [unwrappedParams.id, router]);

  const handleToggleStatus = async () => {
    if (!account) return;
    setUpdating(true);
    const newStatus = account.status === 'expired' ? 'active' : 'expired';
    try {
      const res = await fetch(`/api/telegrams/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAccount({ ...account, status: newStatus });
      } else {
        setModalConfig({ isOpen: true, type: 'error', title: 'Update Failed', message: data.error || 'Failed to update status' });
      }
    } catch (error) {
      setModalConfig({ isOpen: true, type: 'error', title: 'Error', message: 'An error occurred while updating the status.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateUsername || !updateAdPostCode || !updateAdStartDate) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/telegrams/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: updateUsername,
          ad_post_code: updateAdPostCode,
          ad_start_date: updateAdStartDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdateModalOpen(false);
        const refresh = await fetch(`/api/telegrams/${account.id}`);
        const freshData = await refresh.json();
        setAccount(freshData);
        setModalConfig({ isOpen: true, type: 'info', title: 'Success', message: 'Telegram data updated successfully. Previous ad moved to history.' });
      } else {
        setModalConfig({ isOpen: true, type: 'error', title: 'Update Failed', message: data.error || 'Failed to update data' });
      }
    } catch (error) {
      setModalConfig({ isOpen: true, type: 'error', title: 'Error', message: 'An error occurred while updating data.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f5c518] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h2 className="font-bold text-lg">Error Loading Account</h2>
          <p className="text-sm mt-1">{error || 'Account not found'}</p>
        </div>
        <Link href="/" className="text-blue-500 hover:underline font-semibold">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const fullHistory = [
    { 
      id: 'current', 
      username: account.username, 
      ad_post_code: account.ad_post_code, 
      ad_start_date: account.ad_start_date, 
      ad_end_date: null, 
      status: account.status 
    },
    ...(account.history || [])
  ];

  const filteredHistory = historyDateFilter 
    ? fullHistory.filter(item => item.ad_start_date === historyDateFilter)
    : fullHistory;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans">

      {/* Top Navigation Bar */}
      <div className="bg-[#1a2332] sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors uppercase tracking-wider shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
              <span className="hover:text-slate-200 cursor-pointer transition-colors hidden sm:inline" onClick={() => router.back()}>Telegram Accounts</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-[#f5c518] font-semibold truncate max-w-[140px] sm:max-w-[200px]">{account.username}</span>
            </nav>
          </div>
          <div className="shrink-0">
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${account.status === 'expired' ? 'bg-red-900/60 text-red-300 border border-red-700/50' : 'bg-green-900/60 text-green-300 border border-green-700/50'}`}>
              ● {account.status === 'expired' ? 'Expired' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Page Title Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5c518] flex items-center justify-center shrink-0 text-slate-900 font-black text-lg sm:text-xl">
              {account.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">{account.username}</h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                {account.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setUpdateUsername(account.username || '');
                setUpdateAdPostCode('');
                setUpdateAdStartDate('');
                setUpdateModalOpen(true);
              }}
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              Update Data
            </button>
            <button
              onClick={() => {
                const isExp = account.status === 'expired';
                setModalConfig({
                  isOpen: true,
                  type: 'confirm',
                  title: isExp ? 'Reactivate Telegram Account' : 'Mark Account Expired',
                  message: `Are you sure you want to ${isExp ? 'reactivate' : 'mark as expired'} this Telegram account?`,
                  onConfirm: handleToggleStatus
                });
              }}
              disabled={updating}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 sm:px-4 py-2 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${account.status === 'expired' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'}`}
            >
              {updating ? 'Processing...' : account.status === 'expired' ? 'Reactivate' : 'Mark Expired'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex flex-col gap-6">

        {/* Detail Panels */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Ad Information Panel */}
          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#f5c518]"></div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Advertisement Information</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Post Code</span>
                <span className="text-sm font-bold text-slate-800 font-mono bg-slate-100 px-3 py-1">{account.ad_post_code || '—'}</span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</span>
                <span className="text-sm font-semibold text-slate-800">
                  {account.ad_start_date ? account.ad_start_date.split('-').reverse().join('-') : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* System Metadata Panel */}
          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-400"></div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">System Metadata</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Record ID</span>
                <span className="text-sm font-bold text-slate-800 font-mono bg-slate-100 px-3 py-1">#{account.id}</span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created On</span>
                <span className="text-sm font-semibold text-slate-800">{new Date(account.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* History Table Panel */}
        <div className="bg-white border border-slate-200 shadow-sm">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-500"></div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Advertisement History</h2>
              <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {filteredHistory.length} Records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Filter Date:</label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#f5c518] focus:border-[#f5c518] transition-all"
              />
              {historyDateFilter && (
                <button onClick={() => setHistoryDateFilter('')} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 border border-slate-300 hover:border-slate-400 transition-colors uppercase tracking-wider">Clear</button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-12">S.No</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Post Code</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length > 0 && filteredHistory[0].ad_post_code ? (
                  filteredHistory.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-medium">{index + 1}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 text-sm">{item.username}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700 bg-transparent">
                        <span className="bg-slate-100 px-2 py-1">{item.ad_post_code}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">
                        {item.ad_start_date ? item.ad_start_date.split('-').reverse().join('-') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-sm">
                        {item.ad_end_date ? (
                          item.ad_end_date.includes(' ')
                            ? `${item.ad_end_date.split(' ')[0].split('-').reverse().join('-')} ${item.ad_end_date.split(' ')[1]}`
                            : item.ad_end_date.split('-').reverse().join('-')
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.status === 'expired' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-red-50 text-red-700 border border-red-200">Expired</span>
                        ) : item.status === 'completed' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200">Completed</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <p className="text-xs font-semibold uppercase tracking-wider">No Records Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alert / Confirm Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white shadow-2xl w-full max-w-sm border border-slate-200">
            <div className={`px-6 py-4 border-b ${modalConfig.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${modalConfig.type === 'error' ? 'text-red-700' : 'text-slate-800'}`}>
                {modalConfig.title}
              </h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-slate-600 text-sm leading-relaxed">{modalConfig.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              {modalConfig.type === 'confirm' && (
                <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-300 hover:bg-slate-100 transition-colors">Cancel</button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  setModalConfig({ ...modalConfig, isOpen: false });
                }}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${modalConfig.type === 'error' ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-[#f5c518] hover:bg-[#d4a005] text-slate-900'}`}
              >
                {modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Data Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl w-full max-w-md border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Update Telegram Record</h3>
              <button onClick={() => setUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateData} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
                <input type="text" required value={updateUsername} onChange={e => setUpdateUsername(e.target.value)} placeholder="Enter username" className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all" />
                <p className="text-[10px] text-slate-400 mt-1">Pre-filled with current username.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Ad Post Code</label>
                <input type="text" required value={updateAdPostCode} onChange={e => setUpdateAdPostCode(e.target.value)} placeholder="e.g. AD-XYZ-999" className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Ad Start Date</label>
                <input type="date" required value={updateAdStartDate} onChange={e => setUpdateAdStartDate(e.target.value)} className="w-full bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all" />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setUpdateModalOpen(false)} className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 text-xs font-bold uppercase tracking-wider py-2.5 transition-all disabled:opacity-50">
                  {updating ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-slate-200 bg-white py-4 text-center">
        <p className="text-xs text-slate-400">
          Designed and developed by <a href="https://codenexin.com" target="_blank" rel="noopener noreferrer" className="text-[#d4a005] font-semibold hover:underline">Code NexIn</a>
        </p>
      </div>
    </div>
  );
}
