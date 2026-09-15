'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
};

function ProfileTab({ currentUser, onUpdate }: { currentUser: any; onUpdate: (u: any) => void }) {
  const [activeSection, setActiveSection] = useState<'name'|'email'|'password'|null>(null);

  // Name state
  const [editName, setEditName] = useState('');
  // Email state
  const [editEmail, setEditEmail] = useState('');
  const [emailPwd, setEmailPwd] = useState('');
  const [showEmailPwd, setShowEmailPwd] = useState(false);
  // Password state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type:'success'|'error', text:string}|null>(null);

  const openSection = (s: 'name'|'email'|'password') => {
    setActiveSection(s);
    setMsg(null);
    if (s === 'name') setEditName(currentUser?.name || '');
    if (s === 'email') { setEditEmail(currentUser?.email || ''); setEmailPwd(''); setShowEmailPwd(false); }
    if (s === 'password') { setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); }
  };
  const closeSection = () => { setActiveSection(null); setMsg(null); };

  const save = async (payload: object) => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch('/api/auth/profile', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { onUpdate(data.user); setMsg({type:'success', text:'Updated successfully!'}); setTimeout(closeSection, 1200); }
      else setMsg({type:'error', text: data.error || 'Something went wrong.'});
    } catch { setMsg({type:'error', text:'Network error. Please try again.'}); }
    finally { setSaving(false); }
  };

  const handleName = async (e: React.FormEvent) => { e.preventDefault(); save({ name: editName }); };
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailPwd) { setMsg({type:'error', text:'Please enter your current password to change email.'}); return; }
    save({ email: editEmail, currentPassword: emailPwd });
  };
  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setMsg({type:'error', text:'Passwords do not match.'}); return; }
    save({ currentPassword: currentPwd, newPassword: newPwd });
  };

  const EyeBtn = ({show, toggle}: {show:boolean, toggle:()=>void}) => (
    <button type="button" onClick={toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
      {show
        ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      }
    </button>
  );

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all";

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">

      {/* Avatar Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f5c518] to-yellow-300 flex items-center justify-center text-black font-bold text-2xl shadow-md shrink-0">
          {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-slate-900 truncate">{currentUser?.name || 'User'}</p>
          <p className="text-sm text-slate-500 truncate">{currentUser?.email}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
        </span>
      </div>

      {/* Account Settings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Settings</h3>
        </div>

        {/* --- Full Name Row --- */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Full Name</p>
              <p className="text-sm font-semibold text-slate-800">{currentUser?.name || '—'}</p>
            </div>
            {activeSection !== 'name' && (
              <button onClick={() => openSection('name')} className="shrink-0 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </button>
            )}
          </div>
          {activeSection === 'name' && (
            <form onSubmit={handleName} className="px-6 pb-5 space-y-3 border-t border-slate-100 pt-4 bg-slate-50/30">
              <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} placeholder="Enter new name" className={inputCls} autoFocus />
              {msg && <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${msg.type==='error'?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{msg.text}</div>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">{saving?'Saving…':'Update Name'}</button>
                <button type="button" onClick={closeSection} className="px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* --- Email Row --- */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Email Address</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.email || '—'}</p>
            </div>
            {activeSection !== 'email' && (
              <button onClick={() => openSection('email')} className="shrink-0 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </button>
            )}
          </div>
          {activeSection === 'email' && (
            <form onSubmit={handleEmail} className="px-6 pb-5 space-y-3 border-t border-slate-100 pt-4 bg-slate-50/30">
              <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Enter new email" className={inputCls} autoFocus />
              <div className="relative">
                <input type={showEmailPwd ? 'text' : 'password'} required value={emailPwd} onChange={e => setEmailPwd(e.target.value)} placeholder="Enter current password to confirm" className={inputCls + ' pr-11'} />
                <EyeBtn show={showEmailPwd} toggle={() => setShowEmailPwd(p => !p)} />
              </div>
              {msg && <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${msg.type==='error'?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{msg.text}</div>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">{saving?'Saving…':'Update Email'}</button>
                <button type="button" onClick={closeSection} className="px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* --- Password Row --- */}
        <div>
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Password</p>
              <p className="text-sm font-semibold text-slate-800 tracking-widest">••••••••••••</p>
            </div>
            {activeSection !== 'password' && (
              <button onClick={() => openSection('password')} className="shrink-0 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Change
              </button>
            )}
          </div>
          {activeSection === 'password' && (
            <form onSubmit={handlePassword} className="px-6 pb-5 space-y-3 border-t border-slate-100 pt-4 bg-slate-50/30">
              <div className="relative"><input type={showC?'text':'password'} required value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)} placeholder="Current password" className={inputCls + ' pr-11'} autoFocus /><EyeBtn show={showC} toggle={()=>setShowC(p=>!p)} /></div>
              <div className="relative"><input type={showN?'text':'password'} required value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="New password (min 8, 1 capital, 1 special)" className={inputCls + ' pr-11'} /><EyeBtn show={showN} toggle={()=>setShowN(p=>!p)} /></div>
              <div className="relative"><input type={showCf?'text':'password'} required value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Confirm new password" className={inputCls + ' pr-11'} /><EyeBtn show={showCf} toggle={()=>setShowCf(p=>!p)} /></div>
              {msg && <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${msg.type==='error'?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{msg.text}</div>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">{saving?'Saving…':'Change Password'}</button>
                <button type="button" onClick={closeSection} className="px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedTab = localStorage.getItem('vaultx_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
    
    // Fetch logged in user profile
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setCurrentUser(data);
      })
      .catch(console.error);
  }, []);

  // Dashboard State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setLoadingDashboard(true);
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
           if(!data.error) setDashboardData(data);
        })
        .finally(() => setLoadingDashboard(false));
    }
  }, [activeTab]);

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Advertisement State
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [adEmail, setAdEmail] = useState('');
  const [adPassword, setAdPassword] = useState('');
  const [savingAd, setSavingAd] = useState(false);
  const [adError, setAdError] = useState('');
  const [showAdPassword, setShowAdPassword] = useState(false);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [adSearch, setAdSearch] = useState('');
  const [adSort, setAdSort] = useState<'newest' | 'oldest' | 'active_first' | 'expired_first' | 'ads_desc'>('newest');

  const getSortedAdvertisements = () => {
    return advertisements
      .filter(ad => ad.title?.toLowerCase().startsWith(adSearch.toLowerCase()))
      .sort((a, b) => {
        if (adSort === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (adSort === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (adSort === 'active_first') {
          if (a.status === b.status) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return a.status === 'active' ? -1 : 1;
        }
        if (adSort === 'expired_first') {
          if (a.status === b.status) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return a.status === 'expired' ? -1 : 1;
        }
        if (adSort === 'ads_desc') {
          const countA = parseInt(a.ads_count || '0', 10);
          const countB = parseInt(b.ads_count || '0', 10);
          return countB - countA;
        }
        return 0;
      });
  };

  useEffect(() => {
    if (activeTab === 'advertisements') {
      setLoadingAds(true);
      fetch('/api/advertisements')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAdvertisements(data); })
        .finally(() => setLoadingAds(false));
    }
  }, [activeTab]);

  const validatePassword = (password: string) => {
    if (password.length < 12) return 'Password must be at least 12 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
    if (password.startsWith(' ') || password.endsWith(' ')) return 'Password cannot start or end with a space.';
    return null;
  };

  const handleSaveAdvertisement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdError('');
    
    const passwordError = validatePassword(adPassword);
    if (passwordError) {
      setAdError(passwordError);
      return;
    }
    
    setSavingAd(true);
    try {
      const res = await fetch('/api/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: adEmail,
          description: adPassword,
          status: 'active'
        })
      });
      const data = await res.json();
      if (data.success || res.ok) {
         setIsAddingAd(false);
         setAdEmail('');
         setAdPassword('');
         if (data.advertisement && data.advertisement.id) {
           router.push(`/advertisement/${data.advertisement.id}`);
         }
      } else {
         setAdError(data.error || 'Failed to save Advertisement');
      }
    } catch (error) {
      setAdError('Error saving Advertisement');
    } finally {
      setSavingAd(false);
    }
  };

  // Telegram State
  const [isAddingTelegram, setIsAddingTelegram] = useState(false);
  const [tgModalStep, setTgModalStep] = useState(1);
  const [tgCountryCode, setTgCountryCode] = useState('+91');
  const [tgPhoneNumber, setTgPhoneNumber] = useState('');
  const [tgUsername, setTgUsername] = useState('');
  const [tgAdPostCode, setTgAdPostCode] = useState('');
  const [tgAdStartDate, setTgAdStartDate] = useState('');
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [tgSearchQuery, setTgSearchQuery] = useState('');

  const [telegrams, setTelegrams] = useState<any[]>([]);
  const [loadingTelegrams, setLoadingTelegrams] = useState(false);

  const fetchTelegrams = async () => {
    setLoadingTelegrams(true);
    try {
      const res = await fetch('/api/telegrams');
      const data = await res.json();
      if (!data.error) setTelegrams(data);
    } catch (error) {
      console.error('Error fetching telegrams', error);
    } finally {
      setLoadingTelegrams(false);
    }
  };

  const handleSaveTelegram = async () => {
    if (!tgPhoneNumber || !tgUsername || !tgAdPostCode || !tgAdStartDate) return;
    setSavingTelegram(true);
    try {
      const fullPhone = `${tgCountryCode}${tgPhoneNumber}`;
      const res = await fetch('/api/telegrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          username: tgUsername,
          ad_post_code: tgAdPostCode,
          ad_start_date: tgAdStartDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingTelegram(false);
        setTgModalStep(1);
        setTgPhoneNumber('');
        setTgUsername('');
        setTgAdPostCode('');
        setTgAdStartDate('');
        fetchTelegrams();
      } else {
        alert(data.error || 'Failed to save Telegram account');
      }
    } catch (error) {
      alert('Error saving Telegram account');
    } finally {
      setSavingTelegram(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'user' && currentUser?.id === 1) {
      fetchUsers();
    }
    if (activeTab === 'telegram') {
      fetchTelegrams();
    }
    // Close mobile menu when tab changes
    setIsMobileMenuOpen(false);
  }, [activeTab, currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;
    setCreatingUser(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setUsers([...users, data]);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleUserStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  let navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/> },
    { id: 'advertisements', label: 'Advertisements', icon: <path d="M2 7h20v15H2zM17 2l-5 5-5-5"/> },
    { id: 'telegram', label: 'Telegram', icon: <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/> },
    { id: 'profile', label: 'Profile', icon: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
  ];

  if (currentUser?.id === 1) {
    navItems.splice(3, 0, { id: 'user', label: 'User', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> });
  }

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultx_active_tab', id);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-yellow-50/40 text-slate-800 font-sans selection:bg-yellow-200 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 h-full bg-white/95 backdrop-blur-xl border-r border-slate-200 flex flex-col shadow-xl md:shadow-sm z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center text-black font-bold shadow-md shadow-yellow-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-wide text-slate-900">Vault X</span>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-[#f5c518]/10 text-[#d4a005]' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full min-w-0 h-full max-w-[100vw] overflow-x-hidden">
        {/* Modern Header */}
        <header className="h-20 border-b border-slate-200/60 bg-white/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-0">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 capitalize truncate max-w-[150px] sm:max-w-none">{activeTab}</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">Welcome back, {currentUser?.name || 'User'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">

            {/* Profile Avatar */}
            <button
              onClick={() => handleTabChange('profile')}
              className="flex items-center gap-2 p-1 pl-1.5 pr-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow hover:border-[#f5c518] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f5c518] to-yellow-300 flex items-center justify-center text-black font-bold text-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">{currentUser?.name || 'User'}</span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto w-full max-w-full flex flex-col">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium shadow-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl w-full mx-auto">
              {loadingDashboard ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Users Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                        <h3 className="text-2xl font-bold text-slate-800">{dashboardData?.counts?.users || 0}</h3>
                      </div>
                    </div>
                    {/* Ads Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Advertisements</p>
                        <h3 className="text-2xl font-bold text-slate-800">{dashboardData?.counts?.advertisements || 0}</h3>
                      </div>
                    </div>
                    {/* Telegrams Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Telegram Groups</p>
                        <h3 className="text-2xl font-bold text-slate-800">{dashboardData?.counts?.telegrams || 0}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Latest Activity Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Latest Ads */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Latest Advertisements</h3>
                        <button onClick={() => handleTabChange('advertisements')} className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors cursor-pointer">View All</button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {dashboardData?.latest?.advertisements?.length > 0 ? dashboardData.latest.advertisements.map((ad: any) => (
                          <div key={ad.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-slate-800 text-sm truncate pr-4">{ad.title}</h4>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{new Date(ad.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{ad.description}</p>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-slate-500 text-sm">No advertisements found.</div>
                        )}
                      </div>
                    </div>

                    {/* Latest Telegrams */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Latest Telegrams</h3>
                        <button onClick={() => handleTabChange('telegram')} className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors cursor-pointer">View All</button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {dashboardData?.latest?.telegrams?.length > 0 ? dashboardData.latest.telegrams.map((tel: any) => (
                          <div key={tel.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-slate-800 text-sm truncate pr-4">{tel.title}</h4>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{new Date(tel.created_at).toLocaleDateString()}</span>
                            </div>
                            <a href={tel.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{tel.link}</a>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-slate-500 text-sm">No telegrams found.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'user' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Add User Form */}
              <div className="lg:col-span-1 w-full max-w-full">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm sticky top-4 sm:top-8 w-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">+</span>
                    Add New User
                  </h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          required 
                          value={newUserPassword}
                          onChange={e => setNewUserPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={creatingUser}
                      className="w-full bg-[#f5c518] hover:bg-[#e0b516] text-black font-bold py-3 rounded-xl shadow-md shadow-yellow-500/20 transition-all mt-4 disabled:opacity-50"
                    >
                      {creatingUser ? 'Creating...' : 'Create User'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Users List */}
              <div className="lg:col-span-2 w-full max-w-full">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
                  <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">All Users</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{users.length} Users</span>
                  </div>
                  
                  {loadingUsers ? (
                    <div className="p-12 flex justify-center">
                      <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No users found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="hidden md:table w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                          <tr>
                            <th className="py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">User</th>
                            <th className="hidden sm:table-cell py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="hidden md:table-cell py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Created</th>
                            <th className="py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800">{user.name}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'active' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {user.status === 'active' ? 'Active' : 'Revoked'}
                                </span>
                              </td>
                              <td className="hidden md:table-cell py-4 px-4 text-sm text-slate-500">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {user.id !== 1 && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleToggleUserStatus(user.id, user.status)}
                                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                        user.status === 'active' 
                                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                                      }`}
                                    >
                                      {user.status === 'active' ? 'Revoke' : 'Activate'}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                                {user.id === 1 && (
                                  <span className="text-xs text-slate-400 font-medium italic">Primary Admin</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Mobile Cards View */}
                      <div className="md:hidden flex flex-col gap-4 p-4">
                        {users.map(user => (
                          <div key={user.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-800 truncate">{user.name}</h4>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                               <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'active' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {user.status === 'active' ? 'Active' : 'Revoked'}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="border-t border-slate-100 pt-4 flex gap-3">
                               {user.id !== 1 ? (
                                  <>
                                    <button 
                                      onClick={() => handleToggleUserStatus(user.id, user.status)}
                                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                                        user.status === 'active' 
                                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                                      }`}
                                    >
                                      {user.status === 'active' ? 'Revoke' : 'Activate'}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="flex-1 py-2.5 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </>
                               ) : (
                                  <div className="flex-1 text-center py-2">
                                    <span className="text-sm text-slate-400 font-medium italic">Primary Admin (No Actions)</span>
                                  </div>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advertisements' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-8 flex flex-col mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Advertisements</h2>
                  <p className="text-slate-500 mt-1">Manage and track your advertisement campaigns.</p>
                </div>
                <button 
                  onClick={() => {
                    setAdEmail('');
                    setAdPassword('');
                    setAdError('');
                    setIsAddingAd(true);
                  }}
                  className="self-center sm:self-auto bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl leading-none">+</span>
                  Add Advertisement
                </button>
              </div>

              {/* Search & Sort Controls Bar */}
              {advertisements.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      value={adSearch}
                      onChange={e => setAdSearch(e.target.value)}
                      placeholder="Search by email..."
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] transition-all"
                    />
                    {adSearch && (
                      <button onClick={() => setAdSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </div>

                  {/* Sort Filter Dropdown */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 shrink-0">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Sort By:</span>
                    <select
                      value={adSort}
                      onChange={(e: any) => setAdSort(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                    >
                      <option value="newest">Newest to Oldest (Default)</option>
                      <option value="oldest">Oldest to Newest</option>
                      <option value="active_first">Status: Active First</option>
                      <option value="expired_first">Status: Expired First</option>
                      <option value="ads_desc">Most Active Ads First</option>
                    </select>
                  </div>
                </div>
              )}

              {loadingAds ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-[#f5c518] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : advertisements.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No Advertisements Yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm">Click "Add Advertisement" to add your first account.</p>
                </div>
              ) : (
                <div className="mt-2">
                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {getSortedAdvertisements().map((ad: any, idx: number) => (
                        <div
                          key={ad.id}
                          onClick={() => router.push(`/advertisement/${ad.id}`)}
                          className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#f5c518] hover:shadow-sm transition-all active:scale-[0.99]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-100">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-slate-900 font-semibold text-sm truncate">{ad.title}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{new Date(ad.created_at).toLocaleDateString('en-GB')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {ad.status === 'expired' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  Active
                                </span>
                              )}
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                          </div>
                          {(ad.ads_count || ad.details) && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                              {ad.ads_count && parseInt(ad.ads_count) > 0 ? (
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold text-[11px]">{ad.ads_count} {parseInt(ad.ads_count) === 1 ? 'Ad' : 'Ads'}</span>
                              ) : <span />}
                              {ad.details && <span className="truncate max-w-[200px] text-slate-400 text-[11px]">{ad.details}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    {getSortedAdvertisements().length === 0 && adSearch && (
                      <p className="text-center text-slate-400 text-sm py-8">No results for "{adSearch}"</p>
                    )}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 font-semibold text-slate-500 w-12">Sr.</th>
                          <th className="px-5 py-3 font-semibold text-slate-500">Email</th>
                          <th className="px-5 py-3 font-semibold text-slate-500">Active Ads</th>
                          <th className="px-5 py-3 font-semibold text-slate-500">Extra Details / Notes</th>
                          <th className="px-5 py-3 font-semibold text-slate-500">Date Added</th>
                          <th className="px-5 py-3 font-semibold text-slate-500 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {getSortedAdvertisements().map((ad: any, idx: number) => (
                          <tr
                            key={ad.id}
                            onClick={() => router.push(`/advertisement/${ad.id}`)}
                            className="hover:bg-[#f5c518]/5 cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3.5 text-slate-400 font-medium">{idx + 1}</td>
                            <td className="px-5 py-3.5 text-slate-900 font-medium">
                              <div>{ad.title}</div>
                              {ad.full_name && <div className="text-xs text-slate-400 font-normal">{ad.full_name}</div>}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">
                              {ad.ads_count && parseInt(ad.ads_count) > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                  {ad.ads_count} {parseInt(ad.ads_count) === 1 ? 'Ad' : 'Ads'}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-xs max-w-xs truncate">
                              {ad.details ? ad.details : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {new Date(ad.created_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {ad.status === 'expired' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {advertisements.filter(ad => ad.title?.toLowerCase().startsWith(adSearch.toLowerCase())).length === 0 && adSearch && (
                          <tr><td colSpan={6} className="text-center text-slate-400 text-sm py-8">No results for "{adSearch}"</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add Advertisement Modal */}
              {isAddingAd && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                   <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#f5c518] text-slate-900 flex items-center justify-center font-bold text-sm">+</span>
                            Add Advertisement
                          </h3>
                          <button onClick={() => setIsAddingAd(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                      </div>
                      
                      <div className="p-6">
                        {adError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                            {adError}
                          </div>
                        )}
                        <form onSubmit={handleSaveAdvertisement} className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <input 
                              type="email" 
                              required 
                              value={adEmail}
                              onChange={e => setAdEmail(e.target.value)}
                              placeholder="Enter email..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                              <input 
                                type={showAdPassword ? 'text' : 'password'}
                                required 
                                value={adPassword}
                                onChange={e => setAdPassword(e.target.value)}
                                placeholder="Enter password..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowAdPassword(!showAdPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                tabIndex={-1}
                              >
                                {showAdPassword ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">
                              Minimum 12 characters, 1 uppercase letter, 1 special character. No leading/trailing spaces.
                            </p>
                          </div>
                          
                          <div className="pt-2">
                            <button 
                              type="submit" 
                              disabled={savingAd}
                              className="w-full bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {savingAd ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                  Saving...
                                </>
                              ) : 'Save Advertisement'}
                            </button>
                          </div>
                        </form>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileTab currentUser={currentUser} onUpdate={(updated: any) => setCurrentUser(updated)} />
          )}

          {activeTab === 'telegram' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-8 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Telegram Groups</h2>
                  <p className="text-slate-500 mt-1">Manage your connected Telegram channels and groups.</p>
                </div>
                <button 
                  onClick={() => {
                    setTgModalStep(1);
                    setTgPhoneNumber('');
                    setTgUsername('');
                    setTgAdPostCode('');
                    setTgAdStartDate('');
                    setIsAddingTelegram(true);
                  }}
                  className="self-center sm:self-auto bg-[#f5c518] hover:bg-[#d4a005] text-slate-900 font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl leading-none">+</span>
                  Add Telegram
                </button>
              </div>

              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by phone number or username..."
                  value={tgSearchQuery}
                  onChange={(e) => setTgSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5c518] focus:border-transparent transition-all"
                />
              </div>

              {loadingTelegrams ? (
                <div className="flex-1 flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : telegrams.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-slate-500">
                    <p>Click the button above to add your first Telegram account.</p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {telegrams
                    .filter(tg => 
                      tg.phone?.toLowerCase().includes(tgSearchQuery.toLowerCase()) || 
                      tg.username?.toLowerCase().includes(tgSearchQuery.toLowerCase())
                    )
                    .map((tg) => (
                    <div 
                      key={tg.id} 
                      onClick={() => router.push(`/telegram/${tg.id}`)}
                      className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#f5c518]/50 hover:shadow-md transition-all duration-300 relative flex flex-col"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#f5c518]/15 text-[#d4a005] flex items-center justify-center border border-[#f5c518]/30">
                            <span className="text-xl font-bold">{tg.username?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{tg.username}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{tg.phone}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tg.status === 'expired' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                              {tg.status === 'expired' ? 'Expired' : 'Active'}
                           </span>
                        </div>
                      </div>

                      {/* Main Details */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Post Code</p>
                          <p className="font-semibold text-sm text-slate-700">{tg.ad_post_code}</p>
                        </div>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ad Date</p>
                          <p className="font-semibold text-sm text-slate-700">
                            {tg.ad_start_date ? tg.ad_start_date.split('-').reverse().join('-') : ''}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          Added on {new Date(tg.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Telegram Modal */}
              {isAddingTelegram && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                   <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22 11 13 2 9 22 2z"></path></svg>
                            Add Telegram Account
                          </h3>
                          <button onClick={() => setIsAddingTelegram(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                      </div>
                      
                      {tgModalStep === 1 && (
                        <div className="p-6 space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                              <p className="text-xs text-slate-500 mb-4">Enter your Telegram account phone number to continue.</p>
                              <div className="flex gap-3">
                                 <input 
                                   type="text" 
                                   value={tgCountryCode} 
                                   onChange={e => {
                                     let val = e.target.value;
                                     if (!val.startsWith('+')) val = '+' + val.replace(/\+/g, '');
                                     setTgCountryCode(val);
                                   }} 
                                   className="w-24 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all shadow-sm" 
                                   placeholder="+91" 
                                 />
                                 <input 
                                   type="tel" 
                                   value={tgPhoneNumber} 
                                   onChange={e => setTgPhoneNumber(e.target.value)} 
                                   className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all shadow-sm" 
                                   placeholder="Enter phone number" 
                                   autoFocus
                                 />
                              </div>
                            </div>
                            <button 
                              onClick={() => setTgModalStep(2)} 
                              disabled={!tgPhoneNumber}
                              className="w-full bg-[#f5c518] hover:bg-[#d4a005] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 flex justify-center items-center gap-2 mt-4"
                            >
                              Next
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </div>
                      )}

                      {tgModalStep === 2 && (
                        <div className="p-6 space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                              <button onClick={() => setTgModalStep(1)} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                Back
                              </button>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Current User Name</label>
                              <p className="text-xs text-slate-500 mb-4">Enter the name or username for this Telegram account.</p>
                              <input 
                                type="text" 
                                value={tgUsername} 
                                onChange={e => setTgUsername(e.target.value)} 
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all shadow-sm" 
                                placeholder="e.g. John Doe or @johndoe" 
                                autoFocus
                              />
                            </div>
                            <button 
                              onClick={() => setTgModalStep(3)} 
                              disabled={!tgUsername}
                              className="w-full bg-[#f5c518] hover:bg-[#d4a005] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 flex justify-center items-center gap-2 mt-4"
                            >
                              Next
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </div>
                      )}

                      {tgModalStep === 3 && (
                        <div className="p-6 space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                              <button onClick={() => setTgModalStep(2)} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                Back
                              </button>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Advertisement Post Code</label>
                              <p className="text-xs text-slate-500 mb-4">Enter the code for the current active advertisement post.</p>
                              <input 
                                type="text" 
                                value={tgAdPostCode} 
                                onChange={e => setTgAdPostCode(e.target.value)} 
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all shadow-sm" 
                                placeholder="e.g. AD-XYZ123" 
                                autoFocus
                              />
                            </div>
                            <button 
                              onClick={() => setTgModalStep(4)} 
                              disabled={!tgAdPostCode}
                              className="w-full bg-[#f5c518] hover:bg-[#d4a005] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 flex justify-center items-center gap-2 mt-4"
                            >
                              Next
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </div>
                      )}

                      {tgModalStep === 4 && (
                        <div className="p-6 space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                              <button onClick={() => setTgModalStep(3)} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                Back
                              </button>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Advertisement Start Date</label>
                              <p className="text-xs text-slate-500 mb-4">Select the date this advertisement started running.</p>
                              <input 
                                type="date" 
                                value={tgAdStartDate} 
                                onChange={e => setTgAdStartDate(e.target.value)} 
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#f5c518] focus:ring-1 focus:ring-[#f5c518] outline-none transition-all shadow-sm" 
                              />
                            </div>
                            <button 
                              onClick={handleSaveTelegram} 
                              disabled={!tgAdStartDate || savingTelegram}
                              className="w-full bg-[#f5c518] hover:bg-[#d4a005] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 flex justify-center items-center gap-2 mt-4"
                            >
                              {savingTelegram ? 'Saving...' : 'Save Account'}
                            </button>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          )}
          
          {/* Global Footer */}
          <div className="mt-auto pt-8 pb-4 text-center">
            <p className="text-xs font-semibold text-slate-400">
              Designed and developed by <a href="https://codenexin.com" target="_blank" rel="noopener noreferrer" className="text-[#d4a005] hover:underline">Code NexIn</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
