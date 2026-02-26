'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/providers/ToastProvider';
import { 
  ArrowLeft, 
  Save, 
  Check, 
  Upload, 
  Loader2, 
  ShieldCheck, 
  User, 
  GraduationCap, 
  Trophy, 
  PlusCircle,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DatePicker from '@/components/DatePicker';

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    personalInfo: {},
    academicInfo: { isStudying: true },
    sportsInfo: [{ sport: (session?.user as any)?.sport || 'Football', position: '', clubName: '', level: '', experience: 0, achievements: '', certificates: [] }],
    additionalInfo: {
      leadershipRole: '', 
      fatherOccupation: '', 
      fatherIncome: 0, 
      motherOccupation: '', 
      motherIncome: 0, 
      isWorking: false, 
      userOccupation: '', 
      userIncome: 0, 
      householdIncome: 0 
    },
    documents: { certificates: [], awards: [], trophies: [] }
  });

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const SPORTS_CONFIG: any = {
    Football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    Cricket: ['Batter', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    Basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    Volleyball: ['Setter', 'Outside Hitter', 'Libero', 'Middle Blocker', 'Opposite Hitter'],
    Tennis: ['Singles Player', 'Doubles Player'],
    Shuttle: ['Singles Player', 'Doubles Player', 'Mixed Doubles'],
    Other: ['Individual Athlete', 'Team Player']
  };

  const [expanded, setExpanded] = useState<string | null>('personal');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/apply');
    } else if (status === 'authenticated') {
      fetchApplicationData();
    }
  }, [status]);

  const fetchApplicationData = async () => {
    try {
      const res = await fetch('/api/user/application/save-section');
      const data = await res.json();
      if (data && !data.error) {
        const defaultSport = { sport: (session?.user as any)?.sport || 'Football', position: '', clubName: '', level: '', experience: 0, achievements: '', certificates: [] };
        setFormData((prev: any) => ({
            ...prev,
            personalInfo: data.personalInfo || {},
            academicInfo: { ...prev.academicInfo, ...(data.academicInfo || {}) },
            sportsInfo: Array.isArray(data.sportsInfo) && data.sportsInfo.length > 0 
              ? data.sportsInfo.map((s: any) => ({ ...defaultSport, ...s, certificates: s.certificates || [] }))
              : [defaultSport],
            additionalInfo: { ...prev.additionalInfo, ...(data.additionalInfo || {}) },
            documents: data.documents || { certificates: [], awards: [], trophies: [] },
            paymentStatus: data.paymentStatus
        }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    setSavingSection(section);
    try {
      const res = await fetch('/api/user/application/save-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section, 
          data: section === 'additionalInfo' ? {
            ...formData[section],
            householdIncome: (parseInt(formData.additionalInfo.fatherIncome) || 0) + 
                             (parseInt(formData.additionalInfo.motherIncome) || 0) + 
                             (formData.additionalInfo.isWorking ? (parseInt(formData.additionalInfo.userIncome) || 0) : 0)
          } : formData[section] 
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      
      // Update local state with saved data
      if (result.application) {
          const ai = result.application.additionalInfo || {};
          const calculatedTotal = (parseInt(ai.fatherIncome) || 0) + 
                                  (parseInt(ai.motherIncome) || 0) + 
                                  (ai.isWorking ? (parseInt(ai.userIncome) || 0) : 0);
          
          setFormData((prev: any) => ({
              ...prev,
              personalInfo: result.application.personalInfo || prev.personalInfo,
              academicInfo: { ...prev.academicInfo, ...result.application.academicInfo },
              sportsInfo: Array.isArray(result.application.sportsInfo) ? result.application.sportsInfo : prev.sportsInfo,
              additionalInfo: { 
                ...prev.additionalInfo, 
                ...result.application.additionalInfo,
                householdIncome: calculatedTotal
              }
          }));
      }
      
      showToast(`${section.replace('Info', '')} updated successfully`, 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setSavingSection(null);
    }
  };

  const getMissingFieldsCount = (section: string): number => {
    // Special handling for sportsInfo (array of entries)
    if (section === 'sportsInfo') {
      if (!Array.isArray(formData.sportsInfo) || formData.sportsInfo.length === 0) return 1;
      let count = 0;
      formData.sportsInfo.forEach((entry: any) => {
        if (!entry.sport) count++;
        if (!entry.position) count++;
        if (!entry.level) count++;
        if (!entry.clubName) count++;
        if (entry.experience === undefined || entry.experience === null) count++;
      });
      return count;
    }

    const data = formData[section] || {};
    
    let requiredFields: string[] = [];
    if (section === 'personalInfo') {
      requiredFields = ['fullName', 'dob', 'gender', 'phone', 'address', 'parentName'];
    } else if (section === 'academicInfo') {
      requiredFields = data.isStudying ? ['schoolName', 'grade'] : [];
    } else if (section === 'additionalInfo') {
      requiredFields = [
        'fatherOccupation', 'fatherIncome', 'motherOccupation', 'motherIncome',
        ...(data.isWorking ? ['userOccupation', 'userIncome'] : [])
      ];
    } else {
      return 0;
    }
    
    let count = 0;
    requiredFields.forEach(field => {
      const value = data[field];
      if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) {
        count++;
      }
    });
    return count;
  };

  const validateAllSections = () => {
    const sections = ['personalInfo', 'academicInfo', 'sportsInfo', 'additionalInfo'];
    for (const section of sections) {
      if (getMissingFieldsCount(section) > 0) return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateAllSections()) {
      showToast('Please fill all the fields before submitting', 'error');
      return;
    }

    setSavingSection('payment');
    try {
      // Create order
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send current data
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Submission failed');

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Beacon Scholarship",
        description: "Scholarship Registration Fee",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showToast('Application Finalized!', 'success');
            router.push('/dashboard');
          } else {
            showToast('Payment verification failed.', 'error');
          }
        },
        prefill: {
          name: formData.personalInfo.fullName,
          email: formData.personalInfo.email,
          contact: formData.personalInfo.phone,
        },
        theme: { color: "#10b981" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setSavingSection(null);
    }
  };



  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-10 pb-24 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-emerald-500" />
             <h1 className="text-xl font-bold tracking-tight uppercase">Talent Profile 2026</h1>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Section: Personal Info */}
          <SectionCard 
            id="personal"
            title="Personal Identification"
            icon={<User className="w-5 h-5" />}
            expanded={expanded === 'personal'}
            onToggle={() => setExpanded(expanded === 'personal' ? null : 'personal')}
            isSaved={!!formData.personalInfo?._id || formData.personalInfo?.fullName}
            missingCount={getMissingFieldsCount('personalInfo')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input 
                  className="input-field" 
                  value={formData.personalInfo.fullName || ''} 
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, fullName: e.target.value}})}
                />
              </div>
              <div className="space-y-1">
                <DatePicker 
                   label="Date of Birth"
                   value={formData.personalInfo.dob || ''}
                   onChange={(val) => setFormData({...formData, personalInfo: {...formData.personalInfo, dob: val}})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                <select 
                  className="input-field"
                  value={formData.personalInfo.gender || ''}
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, gender: e.target.value}})}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                <input 
                  className="input-field" 
                  value={formData.personalInfo.phone || ''} 
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, phone: e.target.value}})}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Home Address</label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  value={formData.personalInfo.address || ''} 
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, address: e.target.value}})}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Parent/Guardian Name</label>
                <input 
                  className="input-field" 
                  value={formData.personalInfo.parentName || ''} 
                  onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, parentName: e.target.value}})}
                />
              </div>
            </div>
            <SaveButton 
              onSave={() => handleSaveSection('personalInfo')} 
              loading={savingSection === 'personalInfo'} 
            />
          </SectionCard>

          {/* Section: Academic Info */}
          <SectionCard 
            id="academic"
            title="Educational Background"
            icon={<GraduationCap className="w-5 h-5" />}
            expanded={expanded === 'academic'}
            onToggle={() => setExpanded(expanded === 'academic' ? null : 'academic')}
            isSaved={formData.academicInfo?.isStudying !== undefined}
            missingCount={getMissingFieldsCount('academicInfo')}
          >
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-sm font-bold text-gray-300">Are you currently studying?</span>
                <div className="flex gap-3">
                  {[
                    { label: 'Yes', val: true },
                    { label: 'No', val: false }
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setFormData({...formData, academicInfo: {...formData.academicInfo, isStudying: opt.val}})}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.academicInfo.isStudying === opt.val
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {formData.academicInfo.isStudying && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">School / College</label>
                      <input 
                        className="input-field" 
                        placeholder="Enter institution name"
                        value={formData.academicInfo.schoolName || ''} 
                        onChange={(e) => setFormData({...formData, academicInfo: {...formData.academicInfo, schoolName: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Current Grade / Class</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. 10th Grade, B.Sc 2nd Year"
                        value={formData.academicInfo.grade || ''} 
                        onChange={(e) => setFormData({...formData, academicInfo: {...formData.academicInfo, grade: e.target.value}})}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <SaveButton 
              onSave={() => handleSaveSection('academicInfo')} 
              loading={savingSection === 'academicInfo'} 
            />
          </SectionCard>

          {/* Section: Sports Info (Multi) */}
          <SectionCard 
            id="sports"
            title={`Sports Technical Details (${formData.sportsInfo.length})`}
            icon={<Trophy className="w-5 h-5" />}
            expanded={expanded === 'sports'}
            onToggle={() => setExpanded(expanded === 'sports' ? null : 'sports')}
            isSaved={formData.sportsInfo?.length > 0 && !!formData.sportsInfo[0]?.position}
            missingCount={getMissingFieldsCount('sportsInfo')}
          >
            <div className="space-y-8">
              {formData.sportsInfo.map((entry: any, idx: number) => {
                const updateEntry = (field: string, value: any) => {
                  const updated = [...formData.sportsInfo];
                  updated[idx] = { ...updated[idx], [field]: value };
                  setFormData({ ...formData, sportsInfo: updated });
                };

                const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingIdx(idx);
                  try {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    const updated = [...formData.sportsInfo];
                    updated[idx] = { ...updated[idx], certificates: [...(updated[idx].certificates || []), data.url] };
                    setFormData({ ...formData, sportsInfo: updated });
                    showToast('Certificate uploaded', 'success');
                  } catch (err: any) {
                    showToast(err.message || 'Upload failed', 'error');
                  } finally {
                    setUploadingIdx(null);
                  }
                };

                const removeCert = (certIdx: number) => {
                  const updated = [...formData.sportsInfo];
                  updated[idx] = { ...updated[idx], certificates: updated[idx].certificates.filter((_: any, i: number) => i !== certIdx) };
                  setFormData({ ...formData, sportsInfo: updated });
                };

                return (
                  <div key={idx} className="relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    {/* Remove button */}
                    {formData.sportsInfo.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = formData.sportsInfo.filter((_: any, i: number) => i !== idx);
                          setFormData({ ...formData, sportsInfo: updated });
                        }}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                      Sport #{idx + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Sport</label>
                        <select className="input-field" value={entry.sport || ''}
                          onChange={(e) => { updateEntry('sport', e.target.value); updateEntry('position', ''); }}>
                          {Object.keys(SPORTS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Role / Position</label>
                        <select className="input-field" value={entry.position || ''}
                          onChange={(e) => updateEntry('position', e.target.value)}>
                          <option value="">Select</option>
                          {(SPORTS_CONFIG[entry.sport] || SPORTS_CONFIG.Other).map((p: string) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Level of Play</label>
                        <select className="input-field" value={entry.level || ''}
                          onChange={(e) => updateEntry('level', e.target.value)}>
                          <option value="">Select</option>
                          <option value="School">School</option>
                          <option value="District">District</option>
                          <option value="State">State</option>
                          <option value="National">National</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Team / Club / Academy</label>
                        <input className="input-field" value={entry.clubName || ''}
                          onChange={(e) => updateEntry('clubName', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Years Experience</label>
                        <input type="number" className="input-field" value={entry.experience || 0}
                          onChange={(e) => updateEntry('experience', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Notable Achievements</label>
                        <textarea className="input-field" placeholder="Tell us about your biggest wins..."
                          value={entry.achievements || ''}
                          onChange={(e) => updateEntry('achievements', e.target.value)} />
                      </div>

                      {/* Certificate Upload */}
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Certificates / Proof</label>
                        <div className="flex flex-wrap gap-3">
                          {(entry.certificates || []).map((cert: string, ci: number) => (
                            <div key={ci} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300">
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="max-w-[140px] truncate">Certificate {ci + 1}</span>
                              <button type="button" onClick={() => removeCert(ci)} className="text-red-400 hover:text-red-300">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <label className="border-2 border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all cursor-pointer bg-white/[0.01]">
                          <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileUpload} />
                          {uploadingIdx === idx
                            ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                            : <>
                                <Upload className="w-6 h-6 text-gray-600 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Upload Certificate</span>
                                <span className="text-[9px] text-gray-700 mt-1">PDF, JPG, PNG (Max 2MB)</span>
                              </>
                          }
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Sport Button */}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  sportsInfo: [...formData.sportsInfo, { sport: 'Football', position: '', clubName: '', level: '', experience: 0, achievements: '', certificates: [] }]
                })}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm font-bold"
              >
                <PlusCircle className="w-5 h-5" /> Add Another Sport
              </button>
            </div>

            <SaveButton 
              onSave={() => handleSaveSection('sportsInfo')} 
              loading={savingSection === 'sportsInfo'} 
            />
          </SectionCard>

          {/* Section: Additional Info */}
          <SectionCard 
            id="additional"
            title="Additional Profile Information"
            icon={<PlusCircle className="w-5 h-5" />}
            expanded={expanded === 'additional'}
            onToggle={() => setExpanded(expanded === 'additional' ? null : 'additional')}
            isSaved={!!formData.additionalInfo?.householdIncome}
            missingCount={getMissingFieldsCount('additionalInfo')}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {/* Father's Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mb-2">Father's Details</h4>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Occupation</label>
                    <input 
                      className="input-field" 
                      placeholder="e.g. Business, Engineer"
                      value={formData.additionalInfo.fatherOccupation || ''} 
                      onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, fatherOccupation: e.target.value}})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Monthly Income</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.additionalInfo.fatherIncome || 0} 
                      onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, fatherIncome: parseInt(e.target.value) || 0}})} 
                    />
                  </div>
                </div>

                {/* Mother's Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mb-2">Mother's Details</h4>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Occupation</label>
                    <input 
                      className="input-field" 
                      placeholder="e.g. Teacher, Homemaker"
                      value={formData.additionalInfo.motherOccupation || ''} 
                      onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, motherOccupation: e.target.value}})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Monthly Income</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.additionalInfo.motherIncome || 0} 
                      onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, motherIncome: parseInt(e.target.value) || 0}})} 
                    />
                  </div>
                </div>

                {/* Self Info */}
                <div className="md:col-span-2 p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-300">Are you currently working?</span>
                    <div className="flex gap-2">
                      {[
                        { label: 'Yes', val: true },
                        { label: 'No', val: false }
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setFormData({...formData, additionalInfo: {...formData.additionalInfo, isWorking: opt.val}})}
                          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                            formData.additionalInfo.isWorking === opt.val
                              ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20'
                              : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {formData.additionalInfo.isWorking && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5"
                      >
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Your Occupation</label>
                          <input 
                            className="input-field outline-none" 
                            value={formData.additionalInfo.userOccupation || ''} 
                            onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, userOccupation: e.target.value}})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Your Monthly Income</label>
                          <input 
                            type="number" 
                            className="input-field outline-none" 
                            value={formData.additionalInfo.userIncome || 0} 
                            onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, userIncome: parseInt(e.target.value) || 0}})} 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="md:col-span-2 space-y-1 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                   <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-emerald-500 uppercase tracking-widest">Total Monthly HH Income</label>
                      <span className="text-2xl font-black text-white">
                        ₹{(parseInt(formData.additionalInfo.fatherIncome) || 0) + 
                          (parseInt(formData.additionalInfo.motherIncome) || 0) + 
                          (formData.additionalInfo.isWorking ? (parseInt(formData.additionalInfo.userIncome) || 0) : 0)}
                      </span>
                   </div>
                   <p className="text-[10px] text-gray-500 mt-2 italic">Automatically calculated based on the fields above.</p>
                </div>
             </div>
             <SaveButton 
              onSave={() => handleSaveSection('additionalInfo')} 
              loading={savingSection === 'additionalInfo'} 
            />
          </SectionCard>



          {/* Final Submission Card */}
          <div className="glass-card p-1 items-center overflow-hidden border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
             <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <CreditCard className="w-8 h-8 text-emerald-500" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold mb-2">Finalize & Submit</h3>
                      <p className="text-gray-500 text-sm max-w-sm">Please ensure all sections above are saved before finalizing. Registration fee is ₹500.</p>
                   </div>
                </div>

                {formData.paymentStatus === 'completed' ? (
                   <div className="flex items-center gap-3 py-3 px-6 bg-emerald-500 font-bold text-black rounded-xl">
                      <Check className="w-5 h-5" /> ALREADY PAID
                   </div>
                ) : (
                  <button 
                    disabled={savingSection === 'payment'}
                    onClick={handlePayment}
                    className="btn-primary flex items-center gap-3 px-10 py-5 text-lg shadow-xl shadow-emerald-500/20"
                  >
                    {savingSection === 'payment' ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> PAY & SUBMIT</>}
                  </button>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SectionCard({ id, title, icon, children, expanded, onToggle, isSaved, missingCount }: any) {
  return (
    <div className={`glass-card overflow-hidden border-white/5 transition-all duration-300 ${expanded ? 'ring-1 ring-emerald-500/30' : ''}`}>
      <button 
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-4">
           <div className={`p-2 rounded-lg transition-colors ${expanded ? 'bg-emerald-500 text-black' : 'bg-white/5 text-emerald-400 group-hover:text-emerald-300'}`}>
              {icon}
           </div>
           <div className="text-left">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg">{title}</h3>
                {missingCount > 0 && (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                    {missingCount} missing
                  </span>
                )}
              </div>
              {isSaved && !expanded && <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
           </div>
        </div>
        <div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-2 border-t border-white/5">
               {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SaveButton({ onSave, loading }: any) {
  return (
    <div className="mt-8 flex justify-end px-2">
      <button 
        onClick={onSave}
        disabled={loading}
        className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border ${
          loading ? 'bg-white/5 text-gray-500 border-white/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-black'
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {loading ? 'Saving...' : 'Save Section'}
      </button>
    </div>
  );
}
