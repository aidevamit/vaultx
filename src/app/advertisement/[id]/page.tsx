'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function AdvertisementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAddingDetails, setIsAddingDetails] = useState(false);
  const [detailsModalStep, setDetailsModalStep] = useState(1);
  const [locationText, setLocationText] = useState('');
  const [usernameText, setUsernameText] = useState('');
  const [fullNameText, setFullNameText] = useState('');
  const [accountCreateDate, setAccountCreateDate] = useState('');
  const [lastPaymentDate, setLastPaymentDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [phoneText, setPhoneText] = useState('');
  const [adsCount, setAdsCount] = useState('0');
  const [subAds, setSubAds] = useState<{adId: string, title: string}[]>([]);
  const [cardsCount, setCardsCount] = useState('0');
  const [savedCards, setSavedCards] = useState<{last4: string, expiry: string}[]>([]);
  const [detailsText, setDetailsText] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsError, setCredsError] = useState('');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const safeParseJson = (str: string | null | undefined): any[] => {
    if (!str) return [];
    try { return JSON.parse(str) || []; } catch { return []; }
  };

  useEffect(() => {
    const fetchAd = async (attempt = 0) => {
      try {
        const res = await fetch(`/api/advertisements/${unwrappedParams.id}`);
        const data = await res.json();
        
        if (res.status === 500 && attempt === 0) {
          setTimeout(() => fetchAd(1), 800);
          return;
        }
        
        if (data.error) {
          setError(data.error);
        } else {
          setAd(data);
          setDetailsText(data.details || '');
          setLocationText(data.location || '');
          setUsernameText(data.username || '');
          setFullNameText(data.full_name || '');
          setAccountCreateDate(data.account_create_date || '');
          setLastPaymentDate(data.last_payment_date || '');
          setPaymentAmount(data.payment_amount || '');
          
          if (data.phone) {
            if (data.phone.startsWith('+')) {
              const parts = data.phone.split(' ');
              if (parts.length > 1) {
                setCountryCode(parts[0].substring(1));
                setPhoneText(parts.slice(1).join(' '));
              } else {
                setPhoneText(data.phone);
              }
            } else {
              setPhoneText(data.phone);
            }
          }
          
          setAdsCount(data.ads_count || '0');
          if (data.sub_ads_json) {
            try { setSubAds(JSON.parse(data.sub_ads_json)); } catch(e){}
          }
          
          setCardsCount(data.cards_count || '0');
          if (data.cards_json) {
            try { setSavedCards(JSON.parse(data.cards_json)); } catch(e){}
          }
        }
      } catch (err) {
        setError('Failed to load advertisement details');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [unwrappedParams.id]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/advertisements/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          details: detailsText, 
          location: locationText,
          username: usernameText,
          full_name: fullNameText,
          account_create_date: accountCreateDate,
          last_payment_date: lastPaymentDate,
          payment_amount: paymentAmount,
          phone: `+${countryCode} ${phoneText}`,
          ads_count: adsCount,
          sub_ads_json: JSON.stringify(subAds),
          cards_count: cardsCount,
          cards_json: JSON.stringify(savedCards)
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAd({ 
          ...ad, 
          details: detailsText, 
          location: locationText,
          username: usernameText,
          full_name: fullNameText,
          account_create_date: accountCreateDate,
          last_payment_date: lastPaymentDate,
          payment_amount: paymentAmount,
          phone: `+${countryCode} ${phoneText}`,
          ads_count: adsCount,
          sub_ads_json: JSON.stringify(subAds),
          cards_count: cardsCount,
          cards_json: JSON.stringify(savedCards)
        });
        setIsAddingDetails(false);
        setDetailsModalStep(1);
      } else {
        setModalConfig({ isOpen: true, type: 'error', title: 'Save Failed', message: data.error || 'Failed to save details' });
      }
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'error', title: 'Error', message: 'Error saving details' });
    } finally {
      setSavingDetails(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError('');

    if (editPassword.length < 12) {
      setCredsError('Password must be at least 12 characters long.');
      return;
    }
    if (!/[A-Z]/.test(editPassword)) {
      setCredsError('Password must contain at least 1 capital letter.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(editPassword)) {
      setCredsError('Password must contain at least 1 special character.');
      return;
    }
    if (/^\s|\s$/.test(editPassword)) {
      setCredsError('Password cannot have spaces at the beginning or end.');
      return;
    }

    setSavingCreds(true);
    
    const historyEntry = {
      email: ad.title,
      password: ad.description,
      date: new Date().toISOString()
    };
    
    const existingHistory = ad.credentials_history_json ? JSON.parse(ad.credentials_history_json) : [];
    const newHistory = [historyEntry, ...existingHistory];
    
    try {
      const res = await fetch(`/api/advertisements/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editEmail,
          description: editPassword,
          credentials_history_json: JSON.stringify(newHistory)
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAd({
          ...ad,
          title: editEmail,
          description: editPassword,
          credentials_history_json: JSON.stringify(newHistory)
        });
        setIsEditingCreds(false);
        setCredsError('');
      } else {
        setCredsError(data.error || 'Failed to update credentials');
      }
    } catch (err) {
      setCredsError('Network error. Please try again.');
    } finally {
      setSavingCreds(false);
    }
  };

  const handleToggleStatus = async () => {
    const isExpired = ad.status === 'expired';
    const newStatus = isExpired ? 'active' : 'expired';
    
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/advertisements/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAd({ ...ad, status: newStatus });
      } else {
        setModalConfig({ isOpen: true, type: 'error', title: 'Update Failed', message: data.error || 'Failed to update status' });
      }
    } catch (err) {
      setModalConfig({ isOpen: true, type: 'error', title: 'Error', message: 'Error updating status' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#f5c518] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] p-4 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-4 border border-red-200 mb-4 w-full max-w-sm">
          <h2 className="font-bold text-sm uppercase tracking-wider">Error Loading Account</h2>
          <p className="text-xs mt-1">{error || 'Advertisement not found'}</p>
        </div>
        <button
          onClick={() => router.push('/?tab=advertisements')}
          className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-300 px-4 py-2 hover:bg-slate-50 transition-colors"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  const isExpired = ad.status === 'expired';

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans">
      
      {/* Top Corporate Navigation Bar */}
      <div className="bg-[#1a2332] sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => router.push('/?tab=advertisements')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors uppercase tracking-wider shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
              <span className="hover:text-slate-200 cursor-pointer transition-colors hidden sm:inline" onClick={() => router.push('/?tab=advertisements')}>Advertisements</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-[#f5c518] font-semibold truncate max-w-[140px] sm:max-w-[200px]">{ad.title}</span>
            </nav>
          </div>
          <div className="shrink-0">
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${isExpired ? 'bg-red-900/60 text-red-300 border border-red-700/50' : 'bg-green-900/60 text-green-300 border border-green-700/50'}`}>
              ● {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Page Title & Controls Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">{ad.title}</h1>
                <button 
                  onClick={() => handleCopy(ad.title, 'email')}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1 shrink-0"
                  title="Copy Email"
                >
                  {copiedField === 'email' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditEmail(ad.title);
                    setEditPassword(ad.description);
                    setIsEditingCreds(true);
                  }}
                  className="text-slate-400 hover:text-amber-600 transition-colors p-1 shrink-0"
                  title="Update Email / Password"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Primary Account Email</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setDetailsModalStep(1);
                setIsAddingDetails(true);
              }}
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              {ad.details ? 'Edit Details' : 'Add Details'}
            </button>
            <button
              onClick={() => {
                setModalConfig({
                  isOpen: true,
                  type: 'confirm',
                  title: isExpired ? 'Reactivate Advertisement' : 'Mark Advertisement Expired',
                  message: `Are you sure you want to ${isExpired ? 'reactivate' : 'mark as expired'} this advertisement?`,
                  onConfirm: handleToggleStatus
                });
              }}
              disabled={updatingStatus}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 sm:px-4 py-2 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${isExpired ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'}`}
            >
              {updatingStatus ? 'Processing...' : isExpired ? 'Reactivate' : 'Mark Expired'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 w-full flex flex-col gap-5 sm:gap-6">

        {/* Security & Account Information Panel */}
        <div className="bg-white border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#f5c518]"></div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Account Overview & Security</h2>
            </div>
            <button 
              onClick={() => {
                setEditEmail(ad.title);
                setEditPassword(ad.description);
                setIsEditingCreds(true);
              }}
              className="text-xs text-[#a88200] font-bold uppercase tracking-wider hover:underline"
            >
              Edit Credentials
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            
            {/* Status Row */}
            <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</span>
              <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${isExpired ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                ● {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>

            {/* Master Password */}
            <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Master Password</span>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 border border-slate-200 break-all">{ad.description}</span>
                <button 
                  onClick={() => handleCopy(ad.description, 'password')}
                  className="text-slate-400 hover:text-blue-600 p-1 shrink-0"
                  title="Copy Password"
                >
                  {copiedField === 'password' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Profile Details Panel */}
        <div className="bg-white border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <div className="w-1 h-4 bg-slate-400"></div>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Profile & Contact Information</h2>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="divide-y divide-slate-100">
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{ad.full_name || '—'}</span>
              </div>
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{ad.username || '—'}</span>
              </div>
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{ad.location || '—'}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</span>
                <span className="text-xs sm:text-sm font-mono font-semibold text-slate-800">{ad.phone || '—'}</span>
              </div>
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Created On</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {ad.account_create_date ? ad.account_create_date.split('-').reverse().join('-') : '—'}
                </span>
              </div>
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Payment</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {ad.payment_amount ? <span className="text-[#a88200] font-bold">£{ad.payment_amount}</span> : ''}
                  {ad.payment_amount && ad.last_payment_date ? ' on ' : ''}
                  {ad.last_payment_date ? ad.last_payment_date.split('-').reverse().join('-') : ad.payment_amount ? '' : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ads on Account Table Panel */}
        {safeParseJson(ad.sub_ads_json).length > 0 && (
          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#f5c518]"></div>
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Ads on Account</h2>
              </div>
              <span className="bg-slate-200 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5">
                Total: {ad.ads_count}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[340px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 w-10 text-center">#</th>
                    <th className="px-4 sm:px-5 py-3 w-36 font-bold">Ad ID</th>
                    <th className="px-4 sm:px-5 py-3 font-bold">Ad Title</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeParseJson(ad.sub_ads_json).map((sa: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-5 py-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-800 font-mono font-bold bg-slate-50/50">{sa.adId || '—'}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-900 font-semibold">{sa.title || 'Untitled Ad'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Saved Payment Cards Panel */}
        {safeParseJson(ad.cards_json).length > 0 && (
          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-slate-600"></div>
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Saved Payment Cards</h2>
              </div>
              <span className="bg-slate-200 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5">
                Total: {ad.cards_count}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[320px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 w-10 text-center">#</th>
                    <th className="px-4 sm:px-5 py-3 font-bold">Card Number</th>
                    <th className="px-4 sm:px-5 py-3 font-bold">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeParseJson(ad.cards_json).map((card: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-5 py-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-900 font-mono font-bold tracking-widest">
                        •••• •••• •••• {card.last4 || 'XXXX'}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-slate-700 font-mono font-semibold">{card.expiry || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Extra Description Panel */}
        {ad.details && (
          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-400"></div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Additional Description & Notes</h2>
            </div>
            <div className="p-4 sm:p-5 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap bg-slate-50/30">
              {ad.details}
            </div>
          </div>
        )}

        {/* Credentials History Table */}
        {safeParseJson(ad.credentials_history_json).length > 0 && (
          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-500"></div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Email & Password Change History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[450px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 w-44 font-bold">Changed On</th>
                    <th className="px-4 sm:px-5 py-3 font-bold">Previous Email</th>
                    <th className="px-4 sm:px-5 py-3 font-bold">Previous Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeParseJson(ad.credentials_history_json).map((history: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-5 py-3 text-slate-500 font-medium">
                        {new Date(history.date).toLocaleDateString('en-GB')} {new Date(history.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-slate-800 font-semibold">{history.email}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-800 font-mono bg-slate-50/50">{history.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* In-Page Alert / Confirm Modal (Center Screen) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white shadow-2xl w-full max-w-sm border border-slate-200">
            <div className={`px-6 py-4 border-b ${modalConfig.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${modalConfig.type === 'error' ? 'text-red-700' : 'text-slate-800'}`}>
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

      {/* Edit Details Multi-step Modal */}
      {isAddingDetails && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-[#1a2332] text-white">
                 <h3 className="font-bold text-xs uppercase tracking-widest text-[#f5c518] flex items-center gap-2">
                   {ad.details ? 'Edit Account Details' : 'Add Account Details'}
                 </h3>
                 <button onClick={() => setIsAddingDetails(false)} className="text-slate-400 hover:text-white transition-colors">
                   ✕
                 </button>
             </div>
             
             <form onSubmit={(e) => {
               e.preventDefault();
               if (detailsModalStep < 9) {
                 setDetailsModalStep(detailsModalStep + 1);
               } else {
                 handleSaveDetails(e);
               }
             }} className="p-6">
               
               {detailsModalStep === 1 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Location of Advertisement</label>
                   <input
                     type="text"
                     required
                     value={locationText}
                     onChange={e => setLocationText(e.target.value)}
                     placeholder="e.g. Mumbai, India"
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                   />
                 </div>
               )}

               {detailsModalStep === 2 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Username</label>
                   <input
                     type="text"
                     required
                     value={usernameText}
                     onChange={e => setUsernameText(e.target.value)}
                     placeholder="Enter username"
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                   />
                 </div>
               )}

               {detailsModalStep === 3 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Full Name</label>
                   <input
                     type="text"
                     required
                     value={fullNameText}
                     onChange={e => setFullNameText(e.target.value)}
                     placeholder="Enter full name"
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                   />
                 </div>
               )}

               {detailsModalStep === 4 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Account Create Date</label>
                   <input
                     type="date"
                     required
                     value={accountCreateDate}
                     onChange={e => setAccountCreateDate(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                   />
                 </div>
               )}

               {detailsModalStep === 5 && (
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Last Payment Date</label>
                     <input
                       type="date"
                       required
                       value={lastPaymentDate}
                       onChange={e => setLastPaymentDate(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Payment Amount (£)</label>
                     <input
                       type="number"
                       required
                       value={paymentAmount}
                       onChange={e => setPaymentAmount(e.target.value)}
                       placeholder="e.g. 50"
                       className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                     />
                   </div>
                 </div>
               )}

               {detailsModalStep === 6 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Phone Number</label>
                   <div className="flex border border-slate-300 bg-slate-50">
                     <div className="flex items-center pl-3 pr-1 bg-slate-200 text-slate-700 font-bold text-xs">
                       +
                     </div>
                     <input
                       type="text"
                       required
                       value={countryCode}
                       onChange={e => setCountryCode(e.target.value)}
                       className="w-12 bg-slate-100 px-1 py-2 text-xs outline-none border-r border-slate-300 text-slate-800 font-bold text-center"
                       placeholder="91"
                     />
                     <input
                       type="text"
                       required
                       value={phoneText}
                       onChange={e => setPhoneText(e.target.value)}
                       placeholder="e.g. 9876543210"
                       className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                     />
                   </div>
                 </div>
               )}

               {detailsModalStep === 7 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Number of Ads on Account</label>
                   <input
                     type="number"
                     min="0"
                     required
                     value={adsCount}
                     onChange={e => {
                       const val = e.target.value;
                       setAdsCount(val);
                       const count = parseInt(val);
                       if (!isNaN(count) && count >= 0) {
                         const maxCount = Math.min(count, 50);
                         const newSubAds = [...subAds];
                         if (newSubAds.length < maxCount) {
                           while(newSubAds.length < maxCount) newSubAds.push({adId: '', title: ''});
                         } else if (newSubAds.length > maxCount) {
                           newSubAds.length = maxCount;
                         }
                         setSubAds(newSubAds);
                       }
                     }}
                     placeholder="e.g. 1, 2"
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none mb-3"
                   />

                   {subAds.length > 0 && (
                     <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                       {subAds.map((sa, idx) => (
                         <div key={idx} className="bg-slate-50 border border-slate-200 p-3 flex flex-col gap-2">
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Ad #{idx + 1}</p>
                           <input type="text" required placeholder="Ad ID" value={sa.adId} onChange={e => {
                             const newAds = [...subAds]; newAds[idx].adId = e.target.value; setSubAds(newAds);
                           }} className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none"/>
                           <input type="text" required placeholder="Ad Title" value={sa.title} onChange={e => {
                             const newAds = [...subAds]; newAds[idx].title = e.target.value; setSubAds(newAds);
                           }} className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none"/>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}

               {detailsModalStep === 8 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Number of Saved Cards</label>
                   <input
                     type="number"
                     min="0"
                     required
                     value={cardsCount}
                     onChange={e => {
                       const val = e.target.value;
                       setCardsCount(val);
                       const count = parseInt(val);
                       if (!isNaN(count) && count >= 0) {
                         const maxCount = Math.min(count, 50);
                         const newCards = [...savedCards];
                         if (newCards.length < maxCount) {
                           while(newCards.length < maxCount) newCards.push({last4: '', expiry: ''});
                         } else if (newCards.length > maxCount) {
                           newCards.length = maxCount;
                         }
                         setSavedCards(newCards);
                       }
                     }}
                     placeholder="e.g. 1"
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none mb-3"
                   />

                   {savedCards.length > 0 && (
                     <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                       {savedCards.map((card, idx) => (
                         <div key={idx} className="bg-slate-50 border border-slate-200 p-3 flex flex-col gap-2">
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Card #{idx + 1}</p>
                           <input type="text" minLength={4} maxLength={4} pattern="\d{4}" inputMode="numeric" required placeholder="Last 4 Digits (e.g. 1234)" value={card.last4} onChange={e => {
                             const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                             const newCards = [...savedCards]; newCards[idx].last4 = val; setSavedCards(newCards);
                           }} className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none"/>
                           <input type="text" minLength={5} maxLength={5} pattern="\d{2}/\d{2}" required placeholder="Expiry Date (MM/YY)" value={card.expiry} onChange={e => {
                             let val = e.target.value.replace(/\D/g, '');
                             if (val.length > 2) {
                               val = val.substring(0, 2) + '/' + val.substring(2, 4);
                             }
                             const newCards = [...savedCards]; newCards[idx].expiry = val; setSavedCards(newCards);
                           }} className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs outline-none"/>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}

               {detailsModalStep === 9 && (
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Description / Details</label>
                   <textarea
                     rows={5}
                     value={detailsText}
                     onChange={e => setDetailsText(e.target.value)}
                     placeholder="Enter details here..."
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none resize-none"
                   ></textarea>
                 </div>
               )}
               
               <div className="mt-6 flex gap-2">
                 {detailsModalStep > 1 && (
                   <button
                     type="button"
                     onClick={() => setDetailsModalStep(detailsModalStep - 1)}
                     className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors"
                   >
                     Back
                   </button>
                 )}
                 <button 
                   type="submit" 
                   disabled={savingDetails && detailsModalStep === 9}
                   className="flex-1 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 font-bold text-xs uppercase tracking-wider py-2.5 transition-all disabled:opacity-50"
                 >
                   {detailsModalStep < 9 ? 'Next' : savingDetails ? 'Saving...' : 'Save Details'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Edit Credentials Modal */}
      {isEditingCreds && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-[#1a2332] text-white">
                 <h3 className="font-bold text-xs uppercase tracking-widest text-[#f5c518]">
                   Update Account Credentials
                 </h3>
                 <button onClick={() => setIsEditingCreds(false)} className="text-slate-400 hover:text-white transition-colors">
                   ✕
                 </button>
             </div>
             
             <form onSubmit={handleUpdateCredentials} className="p-6">
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">New Email Address</label>
                   <input
                     type="email"
                     required
                     value={editEmail}
                     onChange={e => setEditEmail(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">New Master Password</label>
                   <input
                     type="text"
                     required
                     value={editPassword}
                     onChange={e => setEditPassword(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm focus:border-[#f5c518] outline-none font-mono"
                   />
                 </div>
                 <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800">
                   Note: Current email & password will be archived to History table automatically.
                 </div>
               </div>
               
               {credsError && (
                 <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                   {credsError}
                 </div>
               )}

               <div className="mt-6">
                 <button 
                   type="submit" 
                   disabled={savingCreds}
                   className="w-full bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 font-bold text-xs uppercase tracking-wider py-3 transition-all disabled:opacity-50"
                 >
                   {savingCreds ? 'Updating...' : 'Save & Archive Credentials'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <div className="mt-auto border-t border-slate-200 bg-white py-4 text-center">
        <p className="text-xs text-slate-400">
          Designed and developed by <a href="https://codenexin.com" target="_blank" rel="noopener noreferrer" className="text-[#d4a005] font-semibold hover:underline">Code NexIn</a>
        </p>
      </div>
    </div>
  );
}
