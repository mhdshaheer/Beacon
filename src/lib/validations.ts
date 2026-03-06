import { z } from 'zod';

export const registrationSchema = z.object({
  // Step 1: Personal Info
  fullName: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be less than 50 characters'),
  dob: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const minDate = new Date(2002, 0, 1);
      const maxDate = new Date(2018, 11, 31);
      return selectedDate >= minDate && selectedDate <= maxDate;
    }, 'Date of birth must be between 2002 and 2018'),
  gender: z.string().min(1, 'Please select your gender'),
  phone: z.string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  address: z.string()
    .min(10, 'Please provide a full address (min 10 chars)')
    .max(200, 'Address is too long'),
  parentName: z.string()
    .min(3, 'Parent/Guardian name is required')
    .max(50, 'Name must be less than 50 characters'),

  // Step 2: Academic Details
  schoolName: z.string()
    .min(3, 'School / College name is required')
    .max(100, 'Name is too long'),
  grade: z.string().min(1, 'Current grade / level is required'),
  lastQualification: z.string().optional(),

  // Step 3: Football Background
  position: z.string().min(1, 'Please select your primary position'),
  clubName: z.string()
    .min(2, 'Team / Club name is required')
    .max(100, 'Name is too long'),
  level: z.string().min(1, 'Please select your highest level of play'),
  experience: z.coerce.number()
    .min(0, 'Experience cannot be negative')
    .max(100, 'Experience must be between 0 and 100'),
  achievements: z.string().max(500, 'Achievements must be under 500 characters').optional(),
  honors: z.string().max(500, 'Honors must be under 500 characters').optional(),
  futureGoals: z.string().max(500, 'Future goals must be under 500 characters').optional(),

  // Step 4: Additional Info
  leadershipRole: z.string().max(100, 'Text too long').optional(),
  householdIncome: z.coerce.number()
    .min(0, 'Income cannot be negative')
    .optional(),

  // Step 5: Document Upload
  certificates: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  trophies: z.array(z.string()).optional(),
});

export type RegistrationData = z.infer<typeof registrationSchema>;

export const signupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  sport: z.string().min(1, 'Please select your sport'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type SignupData = z.infer<typeof signupSchema>;
