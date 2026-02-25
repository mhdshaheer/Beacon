'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { registrationSchema, RegistrationData } from '@/lib/validations';
import Stepper from '@/components/Stepper';
import DatePicker from '@/components/DatePicker';
import { useToast } from '@/providers/ToastProvider';
import { ArrowLeft, ArrowRight, Check, Upload, Loader2 } from 'lucide-react';

const STEPS = [
  'Personal',
  'Academic',
  'Football',
  'Additional',
  'Documents'
];

export default function RegisterPage() {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
    watch,
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      dob: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      parentName: '',
      schoolName: '',
      grade: '',
      position: '',
      clubName: '',
      level: '',
      experience: 0,
      achievements: '',
      honors: '',
      futureGoals: '',
      otherSports: '',
      leadershipRole: '',
      householdIncome: 0,
      certificates: [],
      awards: [],
      trophies: [],
    }
  });

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await trigger(fields as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0: return ['fullName', 'dob', 'gender', 'phone', 'email', 'address', 'parentName'];
      case 1: return ['schoolName', 'grade'];
      case 2: return ['position', 'clubName', 'level', 'experience'];
      case 3: return ['otherSports', 'leadershipRole', 'householdIncome'];
      default: return [];
    }
  };

  const handlePayment = async (orderData: any, formData: RegistrationData) => {
    const options = {
      key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: "INR",
      name: "Beacon Scholarship",
      description: "Scholarship Registration Fee",
      order_id: orderData.orderId,
      handler: async function (response: any) {
        // Verify payment
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
          showToast('Registration Successful!', 'success');
          setTimeout(() => {
            window.location.href = '/success';
          }, 2000);
        } else {
          showToast('Payment verification failed.', 'error');
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#10b981",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (data: RegistrationData) => {
    if (currentStep !== STEPS.length - 1) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      await handlePayment(orderData, data);

    } catch (error: any) {
      console.error('Submission failed', error);
      showToast('Submission failed: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-12 md:pt-20 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Talent Registration</h1>
        <p className="text-sm md:text-base text-gray-500 text-center mb-10 md:mb-12">
          Please fill in details accurately for 2026 scholarship trials.
        </p>

        <Stepper currentStep={currentStep} steps={STEPS} />

        <div className="glass-card p-6 md:p-12 relative">
          <form 
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep !== STEPS.length - 1) {
                e.preventDefault();
                nextStep();
              }
            }}
            className="space-y-8"
          >
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold mb-6 text-emerald-400">Personal Information</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <input {...register('fullName')} className="input-field" placeholder="John Doe" />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Controller
                        control={control}
                        name="dob"
                        render={({ field }) => (
                          <DatePicker
                            label="Date of Birth"
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.dob?.message}
                            placeholder="DD/MM/YYYY"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Gender</label>
                      <select {...register('gender')} className="input-field">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Phone Number</label>
                      <input {...register('phone')} className="input-field" placeholder="9876543210" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-gray-300">Email Address</label>
                      <input {...register('email')} className="input-field" placeholder="john@example.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-gray-300">Full Address</label>
                      <textarea {...register('address')} className="input-field min-h-[100px]" placeholder="Street, City, State, Zip" />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-gray-300">Parent / Guardian Name</label>
                      <input {...register('parentName')} className="input-field" placeholder="Jane Doe" />
                      {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold mb-6 text-emerald-400">Academic Details</h2>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">School / College Name</label>
                      <input {...register('schoolName')} className="input-field" placeholder="St. Xavier's International" />
                      {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Grade / Level</label>
                      <input {...register('grade')} className="input-field" placeholder="Grade 10 / 1st Year PE" />
                      {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold mb-6 text-emerald-400">Football Background</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Primary Position</label>
                      <select {...register('position')} className="input-field">
                        <option value="">Select Position</option>
                        <option value="forward">Forward</option>
                        <option value="midfielder">Midfielder</option>
                        <option value="defender">Defender</option>
                        <option value="goalkeeper">Goalkeeper</option>
                      </select>
                      {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Team / Club Name</label>
                      <input {...register('clubName')} className="input-field" placeholder="City United" />
                      {errors.clubName && <p className="text-red-500 text-xs mt-1">{errors.clubName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Level of Play</label>
                      <select {...register('level')} className="input-field">
                        <option value="">Select Level</option>
                        <option value="School">School</option>
                        <option value="District">District</option>
                        <option value="State">State</option>
                        <option value="National">National</option>
                      </select>
                      {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Years of Experience</label>
                      <input {...register('experience')} type="number" min="0" max="100" className="input-field" />
                      {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-gray-300">Key Achievements</label>
                      <textarea {...register('achievements')} className="input-field" placeholder="Top scorer in district league..." />
                      {errors.achievements && <p className="text-red-500 text-xs mt-1">{errors.achievements.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold mb-6 text-emerald-400">Additional Info</h2>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Other Sports Participation</label>
                      <input {...register('otherSports')} className="input-field" placeholder="Athletics, Basketball" />
                      {errors.otherSports && <p className="text-red-500 text-xs mt-1">{errors.otherSports.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Leadership Roles</label>
                      <input {...register('leadershipRole')} className="input-field" placeholder="Captain, Sports Secretary" />
                      {errors.leadershipRole && <p className="text-red-500 text-xs mt-1">{errors.leadershipRole.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Annual Household Income (INR)</label>
                      <input {...register('householdIncome')} type="number" className="input-field" placeholder="800000" />
                      {errors.householdIncome && <p className="text-red-500 text-xs mt-1">{errors.householdIncome.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <h2 className="text-xl font-semibold mb-6 text-emerald-400">Document Upload</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['Certificates', 'Awards', 'Trophies'].map((type) => (
                      <div key={type} className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-emerald-500/50 transition-colors cursor-pointer group">
                        <Upload className="w-10 h-10 text-gray-500 mb-4 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-sm font-medium">Upload {type}</span>
                        <span className="text-[10px] text-gray-600 mt-2">PDF, JPG, PNG (Max 5MB)</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-4 text-left mt-8">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <p className="text-xs text-gray-400">
                      By submitting, you agree that all provided information is accurate. False information will lead to immediate disqualification.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-1.5 md:gap-2 font-semibold text-sm md:text-base transition-opacity ${
                  currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> Back
              </button>

              {currentStep === STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-1.5 md:gap-2 text-sm md:text-base disabled:bg-emerald-800"
                >
                  {isSubmitting ? (
                    <>Submitting... <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /></>
                  ) : (
                    <>Submit & Pay <Check className="w-4 h-4 md:w-5 md:h-5" /></>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
                >
                  Next <span className="hidden xs:inline">Step</span> <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
