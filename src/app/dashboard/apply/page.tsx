'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/providers/ToastProvider';
import { 
  ArrowLeft, 
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
  X,
  Eye,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DatePicker from '@/components/DatePicker';
import Stepper from '@/components/Stepper';

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    personalInfo: {},
    academicInfo: { isStudying: true, lastQualification: '' },
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
    Cricket: ['Batter', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    Football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    Hockey: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    Badminton: ['Singles Player', 'Doubles Player', 'Mixed Doubles'],
    Kabaddi: ['Raider', 'Defender', 'All-rounder'],
    Tennis: ['Singles Player', 'Doubles Player'],
    'Table tennis': ['Singles Player', 'Doubles Player', 'Mixed Doubles'],
    Boxing: ['Lightweight', 'Welterweight', 'Middleweight', 'Heavyweight', 'Other'],
    Wrestling: ['Freestyle', 'Greco-Roman', 'Other'],
    Chess: ['Player'],
    Athletes: ['Sprinter', 'Long Distance', 'Jumper', 'Thrower', 'Other'],
    Swimming: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Medley'],
    'Weight lifting': ['Snatch', 'Clean & Jerk', 'All'],
    Volleyball: ['Setter', 'Outside Hitter', 'Libero', 'Middle Blocker', 'Opposite Hitter'],
    'Hand ball': ['Goalkeeper', 'Left Wing', 'Left Back', 'Center Back', 'Right Back', 'Right Wing', 'Pivot'],
    Archery: ['Recurve', 'Compound', 'Other']
  };

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Personal', 'Academic', 'Sports', 'Additional', 'Submit'];

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

  const handleSaveSection = async (section: string, manualData?: any, isAuto = false) => {
    if (!section || section === '') return false;
    if (!isAuto) setSavingSection(section);
    try {
      const dataToSave = manualData || (section === 'additionalInfo' ? {
        ...formData[section],
        householdIncome: (parseInt(formData.additionalInfo.fatherIncome) || 0) + 
                         (parseInt(formData.additionalInfo.motherIncome) || 0) + 
                         (formData.additionalInfo.isWorking ? (parseInt(formData.additionalInfo.userIncome) || 0) : 0)
      } : formData[section]);

      const res = await fetch('/api/user/application/save-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section, 
          data: dataToSave
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      
      // Sync state back only on manual saves or file uploads (isAuto = false)
      if (result.application && !isAuto) {
          const data = result.application;
          const defaultSport = { sport: (session?.user as any)?.sport || 'Football', position: '', clubName: '', level: '', experience: 0, achievements: '', certificates: [] };
          
          setFormData((prev: any) => ({
              ...prev,
              personalInfo: data.personalInfo || prev.personalInfo,
              academicInfo: { ...prev.academicInfo, ...(data.academicInfo || {}) },
              sportsInfo: Array.isArray(data.sportsInfo) && data.sportsInfo.length > 0 
                ? data.sportsInfo.map((s: any) => ({ ...defaultSport, ...s, certificates: s.certificates || [] }))
                : prev.sportsInfo,
              additionalInfo: { ...prev.additionalInfo, ...(data.additionalInfo || {}) },
              documents: data.documents || prev.documents,
          }));
      }
      
      if (!isAuto) showToast(`${section.replace('Info', '')} updated successfully`, 'success');
      return true;
    } catch (error: any) {
      if (!isAuto) showToast(error.message, 'error');
      return false;
    } finally {
      if (!isAuto) setSavingSection(null);
    }
  };

  // Auto-save debounced effect
  useEffect(() => {
    if (loading || status !== 'authenticated') return;

    const timer = setTimeout(() => {
      const activeSection = currentStep === 0 ? 'personalInfo' : 
                           currentStep === 1 ? 'academicInfo' : 
                           currentStep === 2 ? 'sportsInfo' : 
                           currentStep === 3 ? 'additionalInfo' : null;
      
      if (activeSection) {
        handleSaveSection(activeSection, null, true);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData, currentStep, loading, status]);

  const handleContinue = async (section: string) => {
    const success = await handleSaveSection(section);
    if (success) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = async (step: number) => {
    const activeSection = currentStep === 0 ? 'personalInfo' : 
                         currentStep === 1 ? 'academicInfo' : 
                         currentStep === 2 ? 'sportsInfo' : 
                         currentStep === 3 ? 'additionalInfo' : null;
    
    if (activeSection && step !== currentStep) {
        await handleSaveSection(activeSection, null, true);
    }
    
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (entry.level === 'Other' && !entry.levelOther) count++;
        if (!entry.clubName) count++;
        if (entry.experience === undefined || entry.experience === null) count++;
      });
      return count;
    }

    const data = formData[section] || {};
    
    let requiredFields: string[] = [];
    if (section === 'personalInfo') {
      requiredFields = ['fullName', 'dob', 'gender', 'address', 'parentName'];
    } else if (section === 'academicInfo') {
      requiredFields = ['schoolName', ...(data.isStudying ? ['grade'] : ['lastQualification'])];
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
            showToast('Application Finalized! 🎉', 'success');
            router.push('/dashboard');
          } else {
            showToast('Payment verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: formData.personalInfo.fullName,
          email: formData.personalInfo.email,
          contact: formData.personalInfo.phone,
        },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => {
            setSavingSection(null);
            showToast('Payment cancelled. You can retry anytime.', 'error');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        // Record failed payment in DB
        await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.error?.metadata?.payment_id || '',
            razorpay_order_id: response.error?.metadata?.order_id || orderData.orderId,
            razorpay_signature: '',
            failed: true,
          }),
        });
        showToast(`Payment failed: ${response.error?.description || 'Unknown error'}. Please retry.`, 'error');
        setSavingSection(null);
      });
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
        <Stepper 
          currentStep={currentStep} 
          steps={steps} 
          onStepClick={handleStepClick}
          missingFields={[
            getMissingFieldsCount('personalInfo'),
            getMissingFieldsCount('academicInfo'),
            getMissingFieldsCount('sportsInfo'),
            getMissingFieldsCount('additionalInfo'),
            0
          ]}
        />

        <div className="mt-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-black">
                      <User className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Personal Identification</h2>
                  </div>

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
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({...formData, personalInfo: {...formData.personalInfo, phone: val}});
                        }}
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

                  <div className="mt-10 flex justify-end">
                    <button
                      onClick={() => handleContinue('personalInfo')}
                      disabled={savingSection === 'personalInfo'}
                      className="btn-primary flex items-center gap-2 px-8 py-3"
                    >
                      {savingSection === 'personalInfo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-black">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Educational Background</h2>
                  </div>

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

                    <AnimatePresence mode="wait">
                      {formData.academicInfo.isStudying ? (
                        <motion.div 
                          key="studying"
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
                      ) : (
                        <motion.div 
                          key="not-studying"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Last School / College Attended</label>
                            <input 
                              className="input-field" 
                              placeholder="Enter last institution name"
                              value={formData.academicInfo.schoolName || ''} 
                              onChange={(e) => setFormData({...formData, academicInfo: {...formData.academicInfo, schoolName: e.target.value}})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Last Qualification</label>
                            <input 
                              className="input-field" 
                              placeholder="e.g. 12th Pass, Graduate"
                              value={formData.academicInfo.lastQualification || ''} 
                              onChange={(e) => setFormData({...formData, academicInfo: {...formData.academicInfo, lastQualification: e.target.value}})}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-10 flex justify-between">
                    <button onClick={handleBack} className="glass-button px-8 py-3 flex items-center gap-2">
                       <ArrowLeft className="w-5 h-5" /> Previous
                    </button>
                    <button
                      onClick={() => handleContinue('academicInfo')}
                      disabled={savingSection === 'academicInfo'}
                      className="btn-primary flex items-center gap-2 px-8 py-3"
                    >
                      {savingSection === 'academicInfo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-black">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Sports Technical Details</h2>
                  </div>

                  <div className="space-y-8">
                    {formData.sportsInfo.map((entry: any, idx: number) => {
                      const updateEntry = (field: string, value: any) => {
                        const updated = [...formData.sportsInfo];
                        updated[idx] = { ...updated[idx], [field]: value };
                        setFormData({ ...formData, sportsInfo: updated });
                      };

                      const handleFileDelete = async (public_id: string) => {
                        try {
                          await fetch('/api/upload', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ public_id })
                          });
                        } catch (err) {
                          console.error('Cloudinary deletion failed:', err);
                        }
                      };

                      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                        if (!allowedTypes.includes(file.type)) {
                          showToast('Only JPG, PNG, WebP and PDF files are allowed', 'error');
                          e.target.value = '';
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          showToast('File must be less than 10MB', 'error');
                          e.target.value = '';
                          return;
                        }

                        setUploadingIdx(idx);
                        try {
                          const fd = new FormData();
                          fd.append('file', file);
                          const res = await fetch('/api/upload', { method: 'POST', body: fd });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Upload failed');
                          
                          const updated = [...formData.sportsInfo];
                          updated[idx] = { 
                            ...updated[idx], 
                            certificates: [...(updated[idx].certificates || []), { url: data.url, public_id: data.public_id, name: file.name }] 
                          };
                          setFormData({ ...formData, sportsInfo: updated });
                          await handleSaveSection('sportsInfo', updated);
                          showToast(`"${file.name}" uploaded successfully!`, 'success');
                        } catch (err: any) {
                          showToast(err.message || 'Upload failed. Please try again.', 'error');
                        } finally {
                          setUploadingIdx(null);
                          e.target.value = '';
                        }
                      };

                      const removeCert = async (certIdx: number) => {
                        const cert = formData.sportsInfo[idx].certificates[certIdx];
                        if (cert?.public_id) {
                          await handleFileDelete(cert.public_id);
                        }
                        
                        const updated = [...formData.sportsInfo];
                        updated[idx] = { ...updated[idx], certificates: updated[idx].certificates.filter((_: any, i: number) => i !== certIdx) };
                        setFormData({ ...formData, sportsInfo: updated });
                        await handleSaveSection('sportsInfo', updated);
                      };

                      return (
                        <div key={idx} className="relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
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
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Level of Play</label>
                                <select className="input-field" value={entry.level || ''}
                                  onChange={(e) => {
                                    const newLevel = e.target.value;
                                    const updated = [...formData.sportsInfo];
                                    updated[idx] = { 
                                      ...updated[idx], 
                                      level: newLevel,
                                      levelOther: newLevel === 'Other' ? (updated[idx].levelOther || '') : ''
                                    };
                                    setFormData({ ...formData, sportsInfo: updated });
                                  }}>
                                  <option value="">Select</option>
                                  <option value="School">School</option>
                                  <option value="District">District</option>
                                  <option value="State">State</option>
                                  <option value="National">National</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              
                              <AnimatePresence>
                                {entry.level === 'Other' && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-1"
                                  >
                                    <label className="text-xs font-bold text-gray-500 uppercase">Specify Other Level</label>
                                    <input 
                                      className="input-field" 
                                      placeholder="e.g. International, Regional"
                                      value={entry.levelOther || ''} 
                                      onChange={(e) => updateEntry('levelOther', e.target.value)}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
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

                            <div className="md:col-span-2 space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase">Certificates / Proof</label>
                              <div className="flex flex-wrap gap-3">
                                {(entry.certificates || []).map((cert: any, ci: number) => (
                                  <div key={ci} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="max-w-[140px] truncate">Certificate {ci + 1}</span>
                                    <div className="flex items-center gap-2 ml-1">
                                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors" title="View Document">
                                        <Eye className="w-3.5 h-3.5" />
                                      </a>
                                      <button type="button" onClick={() => removeCert(ci)} className="text-red-400 hover:text-red-300 transition-colors ml-1" title="Remove">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <label className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer bg-white/[0.01] ${
                                uploadingIdx === idx ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.03]'
                              }`}>
                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileUpload} />
                                {uploadingIdx === idx ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /> : <>
                                  <Upload className="w-6 h-6 text-gray-600 mb-2" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Upload Certificate</span>
                                  <span className="text-[9px] text-gray-700 mt-1">PDF, JPG, PNG (Max 10MB)</span>
                                </>}
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setFormData({...formData, sportsInfo: [...formData.sportsInfo, { sport: 'Football', position: '', clubName: '', level: '', experience: 0, achievements: '', certificates: [] }]})}
                      className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <PlusCircle className="w-5 h-5" /> Add Another Sport
                    </button>
                  </div>

                  <div className="mt-10 flex justify-between">
                    <button onClick={handleBack} className="glass-button px-8 py-3 flex items-center gap-2">
                       <ArrowLeft className="w-5 h-5" /> Previous
                    </button>
                    <button
                      onClick={() => handleContinue('sportsInfo')}
                      disabled={savingSection === 'sportsInfo'}
                      className="btn-primary flex items-center gap-2 px-8 py-3"
                    >
                      {savingSection === 'sportsInfo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-black">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Additional Profile Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mb-2">Father&apos;s Details</h4>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Occupation</label>
                        <input className="input-field" placeholder="e.g. Business, Engineer" value={formData.additionalInfo.fatherOccupation || ''} onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, fatherOccupation: e.target.value}})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Monthly Income</label>
                        <input type="number" className="input-field" value={formData.additionalInfo.fatherIncome || 0} onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, fatherIncome: parseInt(e.target.value) || 0}})} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mb-2">Mother&apos;s Details</h4>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Occupation</label>
                        <input className="input-field" placeholder="e.g. Teacher, Homemaker" value={formData.additionalInfo.motherOccupation || ''} onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, motherOccupation: e.target.value}})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Monthly Income</label>
                        <input type="number" className="input-field" value={formData.additionalInfo.motherIncome || 0} onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, motherIncome: parseInt(e.target.value) || 0}})} />
                      </div>
                    </div>

                    <div className="md:col-span-2 p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-300">Are you currently working?</span>
                        <div className="flex gap-2">
                          {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map((opt) => (
                            <button key={opt.label} type="button" onClick={() => setFormData({...formData, additionalInfo: {...formData.additionalInfo, isWorking: opt.val}})} 
                              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.additionalInfo.isWorking === opt.val ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AnimatePresence>
                        {formData.additionalInfo.isWorking && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Your Occupation</label>
                              <input className="input-field outline-none" value={formData.additionalInfo.userOccupation || ''} onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, userOccupation: e.target.value}})} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Your Monthly Income</label>
                              <input type="number" className="input-field outline-none" value={formData.additionalInfo.userIncome || 0} onChange={(e) => setFormData({...formData, additionalInfo: {...formData.additionalInfo, userIncome: parseInt(e.target.value) || 0}})} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="md:col-span-2 space-y-1 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-emerald-500 uppercase tracking-widest">Total Monthly HH Income</label>
                          <span className="text-2xl font-black text-white">
                            ₹{(parseInt(formData.additionalInfo.fatherIncome) || 0) + (parseInt(formData.additionalInfo.motherIncome) || 0) + (formData.additionalInfo.isWorking ? (parseInt(formData.additionalInfo.userIncome) || 0) : 0)}
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-between">
                    <button onClick={handleBack} className="glass-button px-8 py-3 flex items-center gap-2">
                       <ArrowLeft className="w-5 h-5" /> Previous
                    </button>
                    <button
                      onClick={() => handleContinue('additionalInfo')}
                      disabled={savingSection === 'additionalInfo'}
                      className="btn-primary flex items-center gap-2 px-8 py-3"
                    >
                      {savingSection === 'additionalInfo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-1 items-center overflow-hidden border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                   <div className="p-8 flex flex-col items-center text-center gap-10">
                      <div className="flex flex-col items-center gap-6">
                         <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                            <CreditCard className="w-12 h-12 text-emerald-500" />
                         </div>
                         <div>
                            <h3 className="text-3xl font-bold mb-3">Finalize & Submit</h3>
                            <p className="text-gray-500 text-sm max-w-md">Please ensure all sections above are saved before finalizing. Registration fee is ₹229.</p>
                         </div>
                      </div>

                      <div className="w-full max-w-sm space-y-4">
                        {formData.paymentStatus === 'completed' ? (
                           <div className="w-full flex items-center justify-center gap-3 py-3 px-8 bg-emerald-500 font-bold text-black rounded-2xl">
                              <Check className="w-5 h-5" /> ALREADY PAID
                           </div>
                        ) : (
                          <button 
                            disabled={savingSection === 'payment'}
                            onClick={handlePayment}
                            className="btn-primary w-full flex items-center justify-center gap-3 py-3 shadow-xl shadow-emerald-500/20"
                          >
                            {savingSection === 'payment' ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> PAY & SUBMIT</>}
                          </button>
                        )}
                        <button onClick={handleBack} className="w-full py-2 text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]">
                           Review Details
                        </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


