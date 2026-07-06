import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Ban, ChevronRight, ChevronLeft, Save, FileCheck, Sun, Moon, Database, MapPin, Clock, RefreshCw, Info, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import FeaturesSelector from './FeaturesSelector';
import StaffManager, { StaffUser } from './StaffManager';
import { downloadPdf } from './PdfForm';

interface Field {
  label: string;
  value: string;
  state: 'default' | 'carry' | 'ok' | 'warn' | 'na' | 'placeholder';
  type?: 'text' | 'email' | 'tel' | 'select' | 'date' | 'file' | 'textarea';
  options?: string[];
  readonly?: boolean;
  previewUrls?: string[];
  required?: boolean;
}

interface DocType {
  name: string;
  type: string;
  fields: Field[];
  carry_forward: string[];
}

interface StepData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  themeColor: string;
  doctypes: DocType[];
  carryFields: string[];
  completed: boolean;
}

const INITIAL_STEPS: StepData[] = [
  {
    id: 'step-01',
    number: 1,
    title: 'Partner Registration',
    subtitle: 'Basic outlet and owner information',
    badge: 'New Entry',
    themeColor: 'purple',
    completed: false,
    carryFields: ['Partner ID', 'Restaurant or Bar Name', 'Owner Name', 'Mobile', 'City', 'Pincode'],
    doctypes: [
      {
        name: 'Partner Profile',
        type: 'Master',
        fields: [
          { label: 'Owner Name', value: '', state: 'default', type: 'text', required: true },
          { label: 'Mobile', value: '', state: 'default', type: 'tel', required: true },
          { label: 'Email', value: '', state: 'default', type: 'email', required: true },
          { label: 'Restaurant or Bar Name', value: '', state: 'default', type: 'text', required: true }
        ],
        carry_forward: ['Owner Name', 'Restaurant or Bar Name', 'Mobile']
      },
      {
        name: 'Outlet Address',
        type: 'Child',
        fields: [
          { label: 'Address Line 1', value: '', state: 'default', type: 'text' },
          { label: 'Address Line 2', value: '', state: 'default', type: 'text' },
          { label: 'Landmark', value: '', state: 'default', type: 'text' },
          { label: 'City', value: '', state: 'default', type: 'text' },
          { label: 'Pincode', value: '', state: 'default', type: 'text' },
          { label: 'Surrounding Meters', value: '', state: 'default', type: 'text' },
          { label: 'Latitude', value: '', state: 'default', type: 'text' },
          { label: 'Longitude', value: '', state: 'default', type: 'text' }
        ],
        carry_forward: ['Surrounding Meters']
      }
    ]
  },
  {
    id: 'step-02',
    number: 2,
    title: 'Business Verification',
    subtitle: 'KYC, FSSAI, GST, bank details and hours',
    badge: 'KYC + Legal',
    themeColor: 'amber',
    completed: false,
    carryFields: ['GSTIN', 'Legal Name', 'Verified Status', 'Bank Account ID', 'Business Hours'],
    doctypes: [
      {
        name: 'FSSAI License',
        type: 'Master',
        fields: [
          { label: 'Partner Name', value: '', state: 'carry', type: 'text', readonly: true },
          { label: 'FSSAI Number', value: '', state: 'default', type: 'text' },
          { label: 'Issue Date', value: '', state: 'default', type: 'date' },
          { label: 'Expiry Date', value: '', state: 'default', type: 'date' },
          { label: 'License Type', value: '', state: 'default', type: 'select', options: ['State License', 'Central License'] },
          { label: 'Upload Doc', value: '', state: 'placeholder', type: 'file' }
        ],
        carry_forward: ['FSSAI Verified Status']
      },
      {
        name: 'GST Registration',
        type: 'Master',
        fields: [
          { label: 'GSTIN', value: '', state: 'default', type: 'text', required: true },
          { label: 'Legal Entity Name', value: '', state: 'default', type: 'text' },
          { label: 'State Code', value: '', state: 'default', type: 'text' },
          { label: 'Registration Date', value: '', state: 'default', type: 'date' },
          { label: 'Business Type', value: '', state: 'default', type: 'select', options: ['Regular', 'Composition'] }
        ],
        carry_forward: ['GSTIN', 'Legal Entity Name']
      },
      {
        name: 'Bank Account',
        type: 'Master',
        fields: [
          { label: 'Account Holder', value: '', state: 'default', type: 'text', required: true },
          { label: 'Account Number', value: '', state: 'default', type: 'text', required: true },
          { label: 'IFSC Code', value: '', state: 'default', type: 'text', required: true },
          { label: 'Bank Name', value: '', state: 'default', type: 'text', required: true },
          { label: 'Branch', value: '', state: 'default', type: 'text', required: true }
        ],
        carry_forward: ['Bank Account ID', 'IFSC Code']
      },

      {
        name: 'Bar & Club License',
        type: 'Master',
        fields: [
          { label: 'License Number', value: '', state: 'default', type: 'text' },
          { label: 'Issuing Authority', value: '', state: 'default', type: 'text' },
          { label: 'Upload License Doc', value: '', state: 'placeholder', type: 'file' }
        ],
        carry_forward: ['Bar License Status']
      },
      {
        name: 'Business Hours',
        type: 'Child Table',
        fields: [],
        carry_forward: ['Business Hours']
      }
    ]
  },
  {
    id: 'step-03',
    number: 3,
    title: 'Menu & Features Setup',
    subtitle: 'Catalog, pricing, and platform integration',
    badge: 'Catalog Build',
    themeColor: 'teal',
    completed: false,
    carryFields: ['POS System', 'Tablet Model', 'Printer', 'Swiggy ID', 'Zomato ID'],
    doctypes: [
      {
        name: 'Menu Bulk Upload',
        type: 'Master',
        fields: [
          { label: 'Upload Menu (Excel/Image)', value: '', state: 'placeholder', type: 'file' }
        ],
        carry_forward: ['Menu Upload Status']
      },
      {
        name: 'Features',
        type: 'Settings',
        fields: [],
        carry_forward: ['Selected Features']
      }
    ]
  },
  {
    id: 'step-04',
    number: 4,
    title: 'Staff Configuration',
    subtitle: 'Team setup, roles, and device assignment',
    badge: 'Team Setup',
    themeColor: 'blue',
    completed: false,
    carryFields: ['Staff List', 'Roles', 'Device Models'],
    doctypes: [
      {
        name: 'User Management',
        type: 'Settings',
        fields: [],
        carry_forward: ['Staff List']
      }
    ]
  },
  {
    id: 'step-05',
    number: 5,
    title: 'Go Live',
    subtitle: 'Review details and launch',
    badge: 'Preview & Launch',
    themeColor: 'green',
    completed: false,
    carryFields: [],
    doctypes: []
  }
];

function getThemeColors(color: string) {
  const themes: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    purple: {
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
      border: 'border-purple-200/80 dark:border-purple-900/40',
      text: 'text-purple-800 dark:text-purple-300',
      badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
    },
    amber: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      border: 'border-amber-200/80 dark:border-amber-900/40',
      text: 'text-amber-800 dark:text-amber-300',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
    },
    teal: {
      bg: 'bg-teal-50/50 dark:bg-teal-950/20',
      border: 'border-teal-200/80 dark:border-teal-900/40',
      text: 'text-teal-800 dark:text-teal-300',
      badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200'
    },
    blue: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      border: 'border-blue-200/80 dark:border-blue-900/40',
      text: 'text-blue-800 dark:text-blue-300',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
    },
    green: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      border: 'border-emerald-200/80 dark:border-emerald-900/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
    }
  };
  return themes[color] || themes.purple;
}

const getDoctypeBadgeStyle = (type: string) => {
  switch (type) {
    case 'Master':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/40';
    case 'Child':
      return 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40';
    case 'Child Table':
      return 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40';
    case 'Single':
      return 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/50';
  }
};

const getInputClass = (field: Field) => {
  const base = "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-sm shadow-sm";

  let stateClasses = "";
  switch (field.state) {
    case 'carry':
      stateClasses = "border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300 focus:border-emerald-400";
      break;
    case 'ok':
      stateClasses = "border-green-400 dark:border-green-800 bg-green-50/20 dark:bg-green-950/10 text-green-800 dark:text-green-300 focus:border-green-500";
      break;
    case 'warn':
      stateClasses = "border-amber-400 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10 text-amber-800 dark:text-amber-300 focus:border-amber-500";
      break;
    case 'na':
      stateClasses = "border-rose-400 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300 focus:border-rose-500";
      break;
    case 'placeholder':
      stateClasses = "border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20 text-slate-400 dark:text-slate-500";
      break;
    default:
      stateClasses = "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 focus:border-amber-500 dark:focus:border-amber-500";
  }

  if (field.readonly) {
    stateClasses += " opacity-90 cursor-not-allowed bg-slate-50/60 dark:bg-zinc-800/40";
  }

  return `${base} ${stateClasses}`;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function App() {
  const [steps, setSteps] = useState<StepData[]>(() => JSON.parse(JSON.stringify(INITIAL_STEPS)));

  // Business Hours state — one row per day
  const [operatingHours, setOperatingHours] = useState(
    DAYS.map(day => ({ day, enabled: true, open: '10:00', close: '22:00' }))
  );

  const applyHoursToAll = (srcIdx: number) => {
    const src = operatingHours[srcIdx];
    setOperatingHours(prev => prev.map(d => ({ ...d, open: src.open, close: src.close })));
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  // Real Map & Geolocation States
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 });
  const [resolvedAddress, setResolvedAddress] = useState<any>(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (showSuccess) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      const end = Date.now() + 1.5 * 1000;
      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 200);
    }
  }, [showSuccess]);

  const getFieldValue = (stepIdx: number, doctypeName: string, label: string) => {
    const step = steps[stepIdx];
    if (!step) return '';
    const doctype = step.doctypes.find(d => d.name === doctypeName);
    if (!doctype) return '';
    const field = doctype.fields.find(f => f.label === label);
    return field ? field.value : '';
  };

  const isStepValid = (stepIdx: number) => {
    const step = steps[stepIdx];
    if (!step) return true;
    for (const dt of step.doctypes) {
      for (const f of dt.fields) {
        if (f.required && !f.value.trim()) {
          return false;
        }
        if (f.label === 'Mobile' && f.value.trim().length !== 10) {
          return false;
        }
      }
    }
    return true;
  };

  const getMissingRequiredFields = (stepIdx: number) => {
    const step = steps[stepIdx];
    if (!step) return [];
    const missing: string[] = [];
    for (const dt of step.doctypes) {
      for (const f of dt.fields) {
        if (f.required && !f.value.trim()) {
          missing.push(f.label);
        } else if (f.label === 'Mobile' && f.value.trim().length !== 10) {
          missing.push('Mobile (10 digits)');
        }
      }
    }
    return missing;
  };

  const handleStepTabClick = (targetIdx: number) => {
    if (targetIdx <= currentStep) {
      setCurrentStep(targetIdx);
      return;
    }

    // Check each step sequentially from current to targetIdx - 1
    for (let i = currentStep; i < targetIdx; i++) {
      if (!isStepValid(i)) {
        const missingFields = getMissingRequiredFields(i);
        const stepTitle = steps[i].title;
        toast.error(`Please complete the mandatory fields for "${stepTitle}" first: ${missingFields.join(', ')}`, {
          duration: 5000,
        });
        return; // Block navigation
      }
    }

    setCurrentStep(targetIdx);
  };

  const handleFieldChange = (doctypeIdx: number, fieldIdx: number, value: string, previewUrls?: string[]) => {
    // 1. Process target values, handle uppercase conversion for GSTIN
    const rawTargetDoctype = steps[currentStep].doctypes[doctypeIdx];
    const rawTargetField = rawTargetDoctype.fields[fieldIdx];
    let finalValue = value;
    if (currentStep === 1 && rawTargetDoctype.name === 'GST Registration' && rawTargetField.label === 'GSTIN') {
      finalValue = value.trim().toUpperCase();
    }
    if (currentStep === 0 && rawTargetDoctype.name === 'Partner Profile' && rawTargetField.label === 'Mobile') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }

    // 2. Immutably clone steps array and set the target field value
    const newSteps = steps.map((step, sIdx) => {
      if (sIdx === currentStep) {
        return {
          ...step,
          doctypes: step.doctypes.map((dt, dtIdx) => {
            if (dtIdx === doctypeIdx) {
              return {
                ...dt,
                fields: dt.fields.map((f, fIdx) => {
                  if (fIdx === fieldIdx) {
                    return { ...f, value: finalValue, previewUrls: previewUrls || f.previewUrls };
                  }
                  return f;
                })
              };
            }
            return dt;
          })
        };
      }
      return step;
    });

    const targetDoctype = newSteps[currentStep].doctypes[doctypeIdx];
    const targetField = targetDoctype.fields[fieldIdx];



    // Auto-update carry fields: Owner Name -> Partner Name
    if (currentStep === 0 && doctypeIdx === 0) {
      if (targetField.label === 'Owner Name') {
        for (let i = 1; i < newSteps.length; i++) {
          newSteps[i] = {
            ...newSteps[i],
            doctypes: newSteps[i].doctypes.map(dt => {
              return {
                ...dt,
                fields: dt.fields.map(f => {
                  if (f.label === 'Partner Name' || f.label === 'Partner') {
                    return { ...f, value: finalValue ? finalValue + ' ↗' : '', state: finalValue ? 'carry' : 'default' };
                  }
                  return f;
                })
              };
            })
          };
        }
      }

      if (targetField.label === 'Restaurant or Bar Name') {
        for (let i = 1; i < newSteps.length; i++) {
          newSteps[i] = {
            ...newSteps[i],
            doctypes: newSteps[i].doctypes.map(dt => {
              return {
                ...dt,
                fields: dt.fields.map(f => {
                  if (f.label === 'Outlet') {
                    return { ...f, value: finalValue ? finalValue + ' ↗' : '', state: finalValue ? 'carry' : 'default' };
                  }
                  return f;
                })
              };
            })
          };
        }
      }
    }

    // Auto-carry Bank Account details
    if (currentStep === 1 && doctypeIdx === 2) {
      if (targetField.label === 'Account Number') {
        for (let i = 2; i < newSteps.length; i++) {
          newSteps[i] = {
            ...newSteps[i],
            doctypes: newSteps[i].doctypes.map(dt => {
              return {
                ...dt,
                fields: dt.fields.map(f => {
                  if (f.label === 'Bank Account') {
                    return { ...f, value: finalValue ? finalValue + ' ↗' : '', state: finalValue ? 'carry' : 'default' };
                  }
                  return f;
                })
              };
            })
          };
        }
      }
    }

    setSteps(newSteps);
  };

  const handleSaveStep = () => {
    const newSteps = steps.map((step, idx) =>
      idx === currentStep ? { ...step, completed: true } : step
    );
    setSteps(newSteps);
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) return;
    handleSaveStep();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    for (let i = 0; i < steps.length - 1; i++) {
      if (!isStepValid(i)) {
        const missing = getMissingRequiredFields(i);
        toast.error(`Please complete "${steps[i].title}": ${missing.join(', ')}`, { duration: 6000 });
        setCurrentStep(i);
        return;
      }
    }

    handleSaveStep();
    setIsSubmitting(true);
    const startTime = Date.now();

    // ── Field value helper ──────────────────────────────────────────────
    const partnerProfile = steps[0].doctypes.find(d => d.name === 'Partner Profile');
    const outletAddress = steps[0].doctypes.find(d => d.name === 'Outlet Address');
    const fssai = steps[1].doctypes.find(d => d.name === 'FSSAI License');
    const gst = steps[1].doctypes.find(d => d.name === 'GST Registration');
    const bank = steps[1].doctypes.find(d => d.name === 'Bank Account');
    const barLicense = steps[1].doctypes.find(d => d.name === 'Bar & Club License');

    const fv = (doctype: DocType | undefined, label: string) =>
      doctype?.fields.find(f => f.label === label)?.value?.replace(' \u2197', '').trim() || '';

    // ── Working hours → flat keyed object ──────────────────────────────
    const workingHrs: Record<string, string | number> = {};
    operatingHours.forEach(row => {
      const day = row.day.toLowerCase();
      workingHrs[day] = row.enabled ? 1 : 0;
      workingHrs[`${day}_open_time`] = row.enabled ? `${row.open}:00` : '00:00:00';
      workingHrs[`${day}_close_time`] = row.enabled ? `${row.close}:00` : '00:00:00';
    });

    // ── bar_roles from staffUsers ────────────────────────────────────────
    const barRoles = staffUsers.map(u => ({
      user_name: u.name,
      phone_number: u.phone,
      roles: u.role,
    }));

    // ── features array ───────────────────────────────────────────────────
    const featuresArr = selectedFeatures.map(f => ({ feature: f }));

    // ── Final payload matching API spec ─────────────────────────────────
    const payload = {
      bar_details: {
        bar_name: fv(partnerProfile, 'Restaurant or Bar Name'),
        fssai_no: fv(fssai, 'FSSAI Number'),
        gst_no: fv(gst, 'GSTIN'),
        bar_license: fv(barLicense, 'License Number'),

        owner_details: {
          owner_name: fv(partnerProfile, 'Owner Name'),
          email_id: fv(partnerProfile, 'Email'),
          mobile_no: fv(partnerProfile, 'Mobile'),
        },

        bank_details: {
          account_number: fv(bank, 'Account Number'),
          ifsc_code: fv(bank, 'IFSC Code'),
          bank_name: fv(bank, 'Bank Name'),
          account_holder_name: fv(bank, 'Account Holder'),
          branch: fv(bank, 'Branch'),
        },

        // Address fields
        flatfloor_no: fv(outletAddress, 'Address Line 1'),
        street: fv(outletAddress, 'Address Line 2'),
        area: fv(outletAddress, 'Landmark'),
        district: fv(outletAddress, 'City'),
        city: fv(outletAddress, 'City'),
        state: '',            // not in form — extend later
        pincode: fv(outletAddress, 'Pincode'),
        lattitude: fv(outletAddress, 'Latitude'),   // API spells it "lattitude"
        longitude: fv(outletAddress, 'Longitude'),
        country: 'India',
        surrounding_meters: fv(outletAddress, 'Surrounding Meters'),

        working_hrs: workingHrs,
        bar_roles: barRoles,
        features: featuresArr,
      },
    };

    const MIN_LOADING_MS = 2500;

    try {
      const res = await fetch('https://staging.abotribe.com/api/method/abo.api.bar_details.onboard_bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log('API response:', json);

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      await new Promise(r => setTimeout(r, remaining));

      if (!res.ok) {
        throw new Error(json?.message || json?.exception || `Server error ${res.status}`);
      }

      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Submit error:', err);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      await new Promise(r => setTimeout(r, remaining));
      setIsSubmitting(false);
      toast.error(`Submission failed: ${err.message || 'Unknown error'}`, { duration: 6000 });
    }
  };

  const PRESETS = [
    {
      name: "DB Road, RS Puram, Coimbatore",
      lat: "11.0124",
      lng: "76.9535",
      address1: "45, DB Road",
      address2: "RS Puram",
      landmark: "Near Post Office",
      meters: "500"
    },
    {
      name: "100 Feet Rd, Indiranagar, Bangalore",
      lat: "12.9784",
      lng: "77.6408",
      address1: "789, 100 Feet Road",
      address2: "Indiranagar",
      landmark: "Near Toit Brewpub",
      meters: "500"
    },
    {
      name: "Carter Road, Bandra West, Mumbai",
      lat: "19.0596",
      lng: "72.8295",
      address1: "Sea Breeze Apts, Carter Road",
      address2: "Bandra West",
      landmark: "Near Jogger's Park",
      meters: "600"
    }
  ];

  // Load Leaflet dynamically when modal opens
  useEffect(() => {
    if (!showMapModal) return;

    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const scriptId = 'leaflet-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [showMapModal]);

  // Reverse Geocoding with OpenStreetMap Nominatim
  const triggerReverseGeocoding = (lat: number, lng: number) => {
    setReverseGeocoding(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        setResolvedAddress(data);
        setReverseGeocoding(false);
      })
      .catch(err => {
        console.error("Reverse geocoding error:", err);
        setReverseGeocoding(false);
      });
  };

  // Initialize Map
  useEffect(() => {
    if (!showMapModal || !mapLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    const container = document.getElementById('real-leaflet-map');
    if (!container) return;

    const initialLat = currentCoords.lat;
    const initialLng = currentCoords.lng;

    const map = L.map('real-leaflet-map').setView([initialLat, initialLng], 14);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true
    }).addTo(map);
    markerRef.current = marker;

    // Get current location using browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentCoords({ lat, lng });
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
          triggerReverseGeocoding(lat, lng);
        },
        (error) => {
          console.error("Geolocation error:", error);
          triggerReverseGeocoding(initialLat, initialLng);
        }
      );
    } else {
      triggerReverseGeocoding(initialLat, initialLng);
    }

    const onLocationChange = (lat: number, lng: number) => {
      setCurrentCoords({ lat, lng });
      triggerReverseGeocoding(lat, lng);
    };

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationChange(pos.lat, pos.lng);
    });

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [showMapModal, mapLoaded]);

  const handleSelectPreset = (index: number) => {
    setSelectedPreset(index);
    const preset = PRESETS[index];
    const lat = parseFloat(preset.lat);
    const lng = parseFloat(preset.lng);
    setCurrentCoords({ lat, lng });
    triggerReverseGeocoding(lat, lng);

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  const handleConfirmLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      const newSteps = JSON.parse(JSON.stringify(steps)) as StepData[];
      const step1 = newSteps[0];
      const addressDoctype = step1.doctypes.find(d => d.name === 'Outlet Address');

      const addr = resolvedAddress?.address || {};
      const houseNo = addr.house_number || '';
      const road = addr.road || '';
      const address1 = [houseNo, road].filter(Boolean).join(', ') || resolvedAddress?.display_name?.split(',')[0] || 'Selected Location';
      const address2 = addr.suburb || addr.neighbourhood || addr.city_district || '';
      const landmark = addr.amenity || addr.building || addr.shop || addr.tourism || addr.historic || 'Near main road';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const pincode = addr.postcode || '';

      if (addressDoctype) {
        const fieldsToSet: Record<string, string> = {
          'Address Line 1': address1,
          'Address Line 2': address2,
          'Landmark': landmark,
          'City': city,
          'Pincode': pincode,
          'Surrounding Meters': '500',
          'Latitude': currentCoords.lat.toFixed(6),
          'Longitude': currentCoords.lng.toFixed(6)
        };

        addressDoctype.fields.forEach((field: Field) => {
          if (fieldsToSet[field.label] !== undefined) {
            field.value = fieldsToSet[field.label];
            field.state = 'ok';
          }
        });
      }

      setSteps(newSteps);
      setIsLocating(false);
      setShowMapModal(false);
    }, 500);
  };

  const currentStepData = steps[currentStep];
  const theme = getThemeColors(currentStepData.themeColor);
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const restaurantVal = getFieldValue(0, 'Partner Profile', 'Restaurant or Bar Name');
  const ownerVal = getFieldValue(0, 'Partner Profile', 'Owner Name');
  const cityVal = getFieldValue(0, 'Outlet Address', 'City');

  /* ── @keyframes for loading dots (always in DOM, no flicker) ── */
  const bounceCss = `@keyframes submitBounce { 0%,80%,100%{transform:translateY(0);opacity:.5} 40%{transform:translateY(-10px);opacity:1} }`;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-8 transition-colors duration-300">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-amber-200/60 dark:border-zinc-800 shadow-2xl p-12 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>

          {/* Animated Status HUD */}
          <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
            {/* Outer spinning dashed ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500/35 dark:border-amber-500/25 animate-spin" style={{ animationDuration: '10s' }}></div>
            {/* Middle pulsing glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/15 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/5 animate-pulse"></div>
            {/* Inner core */}
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center shadow-lg border border-amber-400/30">
              <Clock className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-800 to-orange-600 dark:from-amber-200 dark:to-orange-400 bg-clip-text text-transparent mb-3">
            Successfully Submitted! 🚀
          </h1>
          <p className="text-base text-slate-655 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            All {steps.length} registration steps are fully certified. The restaurant <strong>"{restaurantVal || 'Your Outlet'}"</strong> is now <strong>awaiting approval</strong>.
          </p>

          {/* Approval Timeline Tracker */}
          <div className="max-w-md mx-auto mb-8 bg-slate-50/50 dark:bg-zinc-950/30 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl p-6 shadow-inner">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider mb-4 text-center">
              Application Tracker
            </div>
            <div className="flex items-center justify-between relative px-2">
              {/* Connecting line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-zinc-800 z-0">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500" style={{ width: '50%' }}></div>
              </div>

              {/* Step 1: Submitted */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md border border-emerald-400">
                  ✓
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">Submitted</span>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md border border-amber-400 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2 font-extrabold">Reviewing</span>
              </div>

              {/* Step 3: Go Live */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-850 text-slate-400 dark:text-zinc-500 flex items-center justify-center font-semibold text-xs border border-slate-200 dark:border-zinc-700">
                  3
                </div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 mt-2">Approved</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/30 to-amber-100/10 dark:from-zinc-800/50 dark:to-zinc-900/30 rounded-2xl p-8 mb-8 border border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1 uppercase tracking-wider">Total Status</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">5 / 5 Steps ✓</div>
              </div>
              <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1 uppercase tracking-wider">Outlet Name</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{restaurantVal || 'N/A'}</div>
              </div>
              <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1 uppercase tracking-wider">Owner / Partner</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ownerVal || 'N/A'}</div>
              </div>
              <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1 uppercase tracking-wider">Base City</div>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{cityVal || 'N/A'}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowSuccess(false);
              setCurrentStep(0);
              setSteps(JSON.parse(JSON.stringify(INITIAL_STEPS)));
              setSelectedFeatures([]);
              setStaffUsers([]);
              setOperatingHours(DAYS.map(day => ({ day, enabled: true, open: '10:00', close: '22:00' })));
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
          >
            Start New Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">

      {/* ── Global keyframes (always in DOM) ── */}
      <style>{bounceCss}</style>

      {/* ── Full-screen Submitting Overlay ── */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/97 backdrop-blur-2xl">
          {/* Animated rings */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-10">
            <div className="absolute inset-0 rounded-full border-[5px] border-amber-500/15 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-5 rounded-full border-[5px] border-t-amber-400 border-r-orange-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.2s' }} />
            <div className="absolute inset-10 rounded-full border-[5px] border-b-amber-300 border-l-orange-300 border-t-transparent border-r-transparent animate-spin" style={{ animationDuration: '0.75s', animationDirection: 'reverse' }} />
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/40">
              <Database className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Submitting…</h2>
          <p className="text-amber-300/80 text-sm font-medium mb-8">Please wait while we register your outlet</p>

          {/* Bouncing dots */}
          <div className="flex gap-3 mb-10">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-amber-400"
                style={{ animation: `submitBounce 1.2s ease-in-out ${i * 0.22}s infinite` }}
              />
            ))}
          </div>

          {/* Step progress labels */}
          <div className="flex flex-col gap-3 text-left bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
            {(['Validating form data', 'Connecting to server', 'Registering outlet', 'Finalising setup'] as const).map((label, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500/50 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
                </div>
                <span className="text-zinc-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toaster richColors position="top-right" />
      {/* Header */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-black flex-shrink-0">
                <img src="/abo-logo.png" alt="ABO Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-amber-800 to-orange-600 dark:from-amber-200 dark:to-orange-400 bg-clip-text text-transparent">
                  Partner Onboarding Workspace
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Adopt Style Onboarding Registry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-slate-100 dark:bg-zinc-800/80 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-zinc-700/50 shadow-sm flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Completed</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-zinc-200">{completedSteps} / {steps.length} Steps</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {Math.round(progress)}%
                </div>
              </div>

              {/* Download Form Button */}
              <button
                onClick={() => downloadPdf(steps as any, staffUsers, selectedFeatures)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer"
                title="Download Blank Onboarding Form (PDF)"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Form</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/50 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-all cursor-pointer shadow-sm"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Step Horizontal Slider */}
      <div className="bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-200 dark:border-zinc-800/80 sticky top-[81px] z-9 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepTabClick(idx)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${idx === currentStep
                    ? 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-sm'
                    : step.completed
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 shadow-sm'
                    }`}
                >
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${step.completed
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                    : idx === currentStep
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400'
                    }`}>
                    {step.completed ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className="text-[12px] font-semibold">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-zinc-700 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8" style={{ scrollMarginTop: '145px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Area: Wizard Form Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-300">

              {/* Form Title Banner */}
              <div className={`bg-gradient-to-r ${theme.bg} ${theme.border} border-b px-8 py-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center font-bold text-lg border border-slate-200/60 dark:border-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200">
                      {currentStepData.number}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{currentStepData.title}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{currentStepData.subtitle}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${theme.badge}`}>
                    {currentStepData.badge}
                  </div>
                </div>
              </div>

              {/* Form Fields Content */}
              <div className="p-8 space-y-8">
                {currentStepData.id === 'step-05' ? (
                  <div className="space-y-8">
                    {/* Information Banner */}
                    <div className="bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Info className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-indigo-800 dark:text-indigo-300">
                          Review Onboarding Details
                        </div>
                        <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1 font-semibold leading-relaxed">
                          Please review all the information filled in the previous steps below. If you need to make any changes, you can jump back to the respective step.
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Partner & Outlet Profile */}
                    <div className="bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                        Partner & Outlet Profile
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Restaurant or Bar Name</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFieldValue(0, 'Partner Profile', 'Restaurant or Bar Name') || <em className="text-slate-400">Not provided</em>}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Owner Name</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFieldValue(0, 'Partner Profile', 'Owner Name') || <em className="text-slate-400">Not provided</em>}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Mobile Number</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFieldValue(0, 'Partner Profile', 'Mobile') || <em className="text-slate-400">Not provided</em>}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Email Address</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block max-w-full">{getFieldValue(0, 'Partner Profile', 'Email') || <em className="text-slate-400">Not provided</em>}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Outlet Address</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                            {[
                              getFieldValue(0, 'Outlet Address', 'Address Line 1'),
                              getFieldValue(0, 'Outlet Address', 'Address Line 2'),
                              getFieldValue(0, 'Outlet Address', 'Landmark') ? `(Landmark: ${getFieldValue(0, 'Outlet Address', 'Landmark')})` : '',
                              getFieldValue(0, 'Outlet Address', 'City'),
                              getFieldValue(0, 'Outlet Address', 'Pincode')
                            ].filter(Boolean).join(', ') || <em className="text-slate-400">Not provided</em>}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Coordinates</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {getFieldValue(0, 'Outlet Address', 'Latitude') && getFieldValue(0, 'Outlet Address', 'Longitude') ? (
                              `Lat: ${getFieldValue(0, 'Outlet Address', 'Latitude')}, Lng: ${getFieldValue(0, 'Outlet Address', 'Longitude')}`
                            ) : (
                              <em className="text-slate-400">Not mapped</em>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Surrounding Meters</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFieldValue(0, 'Outlet Address', 'Surrounding Meters') ? `${getFieldValue(0, 'Outlet Address', 'Surrounding Meters')}m` : <em className="text-slate-400">Not provided</em>}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Business Verification & KYC */}
                    <div className="bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                        Business Verification & KYC
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FSSAI */}
                        <div className="space-y-2 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider">FSSAI License</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-slate-400 font-medium">Number:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'FSSAI License', 'FSSAI Number') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Type:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'FSSAI License', 'License Type') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Validity:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'FSSAI License', 'Issue Date') || '—'} to {getFieldValue(1, 'FSSAI License', 'Expiry Date') || '—'}</span></div>
                            <div className="truncate"><span className="text-slate-400 font-medium">Doc:</span> <span className="font-semibold text-slate-700 dark:text-slate-300" title={getFieldValue(1, 'FSSAI License', 'Upload Doc')}>{getFieldValue(1, 'FSSAI License', 'Upload Doc') || '—'}</span></div>
                          </div>
                        </div>

                        {/* GST */}
                        <div className="space-y-2 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider">GST Registration</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-slate-400 font-medium">GSTIN:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'GST Registration', 'GSTIN') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Legal Name:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'GST Registration', 'Legal Entity Name') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Type / State:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'GST Registration', 'Business Type') || '—'} ({getFieldValue(1, 'GST Registration', 'State Code') || '—'})</span></div>
                            <div><span className="text-slate-400 font-medium">Reg Date:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'GST Registration', 'Registration Date') || '—'}</span></div>
                          </div>
                        </div>

                        {/* Bank Account */}
                        <div className="space-y-2 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider">Bank Account</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-slate-400 font-medium">Holder:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Bank Account', 'Account Holder') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Account No:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Bank Account', 'Account Number') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Bank / Branch:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Bank Account', 'Bank Name') || '—'} ({getFieldValue(1, 'Bank Account', 'Branch') || '—'})</span></div>
                            <div><span className="text-slate-400 font-medium">IFSC Code:</span> <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{getFieldValue(1, 'Bank Account', 'IFSC Code') || '—'}</span></div>
                          </div>
                        </div>

                        {/* Bar License */}
                        <div className="space-y-2 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider">Bar & Club License</h4>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-slate-400 font-medium">License No:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Bar & Club License', 'License Number') || '—'}</span></div>
                            <div><span className="text-slate-400 font-medium">Issuing Auth:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Bar & Club License', 'Issuing Authority') || '—'}</span></div>
                            <div className="truncate"><span className="text-slate-400 font-medium">Doc:</span> <span className="font-semibold text-slate-700 dark:text-slate-300" title={getFieldValue(1, 'Bar & Club License', 'Upload License Doc')}>{getFieldValue(1, 'Bar & Club License', 'Upload License Doc') || '—'}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Operating Hours */}
                    <div className="bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                        Operating Hours
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                        {operatingHours.map(day => (
                          <div
                            key={day.day}
                            className={`p-3 rounded-xl border text-center ${day.enabled
                              ? 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm'
                              : 'bg-slate-100/50 dark:bg-zinc-900/30 border-dashed border-slate-200 dark:border-zinc-800/80 opacity-55'
                              }`}
                          >
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{day.day.slice(0, 3)}</div>
                            {day.enabled ? (
                              <div className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                {day.open} - {day.close}
                              </div>
                            ) : (
                              <div className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                Closed
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Menu & Selected Features */}
                    <div className="bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">4</span>
                        Menu & Platform Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Menu Document</span>
                          <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                              {getFieldValue(2, 'Menu Bulk Upload', 'Upload Menu (Excel/Image)') || <em className="text-slate-400">No file uploaded</em>}
                            </span>
                            {getFieldValue(2, 'Menu Bulk Upload', 'Upload Menu (Excel/Image)') && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Selected Features</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedFeatures.length > 0 ? (
                              selectedFeatures.map(feature => (
                                <span key={feature} className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 font-bold">
                                  {feature}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-450 dark:text-slate-550 italic">No features selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Team & Staff Configuration */}
                    <div className="bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">5</span>
                        Team & Staff Configuration
                      </h3>
                      {staffUsers.length > 0 ? (
                        <div className="bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-150 dark:border-zinc-800 text-slate-500 dark:text-slate-400 font-bold">
                              <tr>
                                <th className="px-4 py-3">NAME</th>
                                <th className="px-4 py-3">MOBILE NUMBER</th>
                                <th className="px-4 py-3">ROLE</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40">
                              {staffUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{user.name}</td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.phone}</td>
                                  <td className="px-4 py-3">
                                    <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                      {user.role}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-450 dark:text-slate-550 italic">No staff users added</p>
                      )}
                    </div>
                  </div>
                ) : (
                  currentStepData.doctypes.map((doctype, doctypeIdx) => (
                    <div key={doctypeIdx} className="bg-slate-50/40 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      {/* Sub-Card Header */}
                      <div className="bg-white dark:bg-zinc-900 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">{doctype.name}</h3>
                          <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded-md font-bold ${getDoctypeBadgeStyle(doctype.type)}`}>
                            {doctype.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {doctype.name === 'Outlet Address' && (
                            <button
                              type="button"
                              onClick={() => setShowMapModal(true)}
                              className="flex items-center gap-1 text-[10px] bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-lg font-bold border border-amber-400 dark:border-amber-700 cursor-pointer shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center"
                            >
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>Select from Map</span>
                            </button>
                          )}
                          {doctype.name === 'GST Registration' && doctype.fields.some(f => f.value === 'Fetching...') && (
                            <div className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold border border-amber-500/20 animate-pulse">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              <span>Fetching GST details...</span>
                            </div>
                          )}
                          {doctype.carry_forward.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                              <span>Carries {doctype.carry_forward.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sub-Card Body */}
                      <div className="bg-white/40 dark:bg-zinc-950/20">
                        {doctype.name === 'Business Hours' ? (
                          // ── Custom per-day Business Hours UI ──
                          <div>
                            {/* Column headers row — Mark All + Apply to All live here */}
                            <div className="grid items-center px-6 py-3 border-b border-slate-100 dark:border-zinc-800/60"
                              style={{ gridTemplateColumns: '180px 1fr 1fr auto' }}>
                              {/* Mark All checkbox */}
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={operatingHours.every(d => d.enabled)}
                                  ref={el => {
                                    if (el) el.indeterminate =
                                      operatingHours.some(d => d.enabled) && !operatingHours.every(d => d.enabled);
                                  }}
                                  onChange={e => setOperatingHours(prev => prev.map(d => ({ ...d, enabled: e.target.checked })))}
                                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Day</span>
                              </label>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Open Time</span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Close Time</span>
                              {/* Single Apply to All button — copies Monday's times to all days */}
                              <button
                                type="button"
                                onClick={() => applyHoursToAll(0)}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all whitespace-nowrap cursor-pointer shadow-sm"
                              >
                                Apply to All
                              </button>
                            </div>

                            {/* Day rows — no per-row Apply button */}
                            {operatingHours.map((row, idx) => (
                              <div
                                key={row.day}
                                className={`grid items-center px-6 py-4 border-b border-slate-100 dark:border-zinc-800/60 last:border-0 transition-all ${!row.enabled ? 'opacity-40' : ''
                                  }`}
                                style={{ gridTemplateColumns: '180px 1fr 1fr auto' }}
                              >
                                {/* Day checkbox + label */}
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={row.enabled}
                                    onChange={e => setOperatingHours(prev =>
                                      prev.map((d, i) => i === idx ? { ...d, enabled: e.target.checked } : d)
                                    )}
                                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                                  />
                                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{row.day}</span>
                                </label>

                                {/* Open time */}
                                <div className="pr-4">
                                  <input
                                    type="time"
                                    value={row.open}
                                    disabled={!row.enabled}
                                    onChange={e => setOperatingHours(prev =>
                                      prev.map((d, i) => i === idx ? { ...d, open: e.target.value } : d)
                                    )}
                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-400 transition-all disabled:cursor-not-allowed"
                                  />
                                </div>

                                {/* Close time */}
                                <div className="pr-4">
                                  <input
                                    type="time"
                                    value={row.close}
                                    disabled={!row.enabled}
                                    onChange={e => setOperatingHours(prev =>
                                      prev.map((d, i) => i === idx ? { ...d, close: e.target.value } : d)
                                    )}
                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-400 transition-all disabled:cursor-not-allowed"
                                  />
                                </div>

                                {/* Spacer to keep grid aligned */}
                                <div />
                              </div>
                            ))}
                          </div>
                        ) : doctype.name === 'Features' ? (
                          // ── Custom Features UI ──
                          <FeaturesSelector
                            selectedFeatures={selectedFeatures}
                            onChange={setSelectedFeatures}
                          />
                        ) : doctype.name === 'User Management' ? (
                          // ── Custom User Management UI ──
                          <StaffManager
                            staffUsers={staffUsers}
                            onChange={setStaffUsers}
                          />
                        ) : (
                          // ── Generic fields grid for all other doctypes ──
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {doctype.fields.map((field, fieldIdx) => (
                                <div key={fieldIdx} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5 group relative">
                                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                        {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                                      </label>
                                      {field.label === 'Surrounding Meters' && (
                                        <div className="relative flex items-center">
                                          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 cursor-help transition-colors" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none font-medium leading-relaxed">
                                            This meter is for the user to checkin within the range of meter from the bar
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {field.readonly && (
                                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                                        Auto-carried
                                      </span>
                                    )}
                                  </div>

                                  {field.type === 'select' ? (
                                    <select
                                      value={field.value}
                                      onChange={(e) => handleFieldChange(doctypeIdx, fieldIdx, e.target.value)}
                                      disabled={field.readonly || field.value === 'Fetching...'}
                                      className={`${getInputClass(field)} ${field.value === 'Fetching...' ? 'animate-pulse opacity-70' : ''}`}
                                    >
                                      <option value="">{field.value === 'Fetching...' ? 'Fetching...' : 'Select option...'}</option>
                                      {field.options?.map((opt, idx) => (
                                        <option key={idx} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : field.type === 'textarea' ? (
                                    <textarea
                                      value={field.value}
                                      onChange={(e) => handleFieldChange(doctypeIdx, fieldIdx, e.target.value)}
                                      disabled={field.readonly || field.value === 'Fetching...'}
                                      rows={3}
                                      placeholder={field.value === 'Fetching...' ? 'Fetching details...' : `Enter ${field.label.toLowerCase()}...`}
                                      className={`${getInputClass(field)} ${field.value === 'Fetching...' ? 'animate-pulse' : ''}`}
                                    />
                                  ) : field.type === 'file' ? (
                                    <div className="relative">
                                      <input
                                        type="file"
                                        multiple
                                        onChange={(e) => {
                                          const files = Array.from(e.target.files || []);
                                          if (files.length > 0) {
                                            const fileNames = files.map(f => f.name).join(', ');
                                            const urls = files
                                              .filter(f => f.type.startsWith('image/'))
                                              .map(f => URL.createObjectURL(f));

                                            handleFieldChange(doctypeIdx, fieldIdx, fileNames, urls.length > 0 ? urls : undefined);
                                          } else {
                                            handleFieldChange(doctypeIdx, fieldIdx, '', undefined);
                                          }
                                        }}
                                        disabled={field.readonly || field.value === 'Fetching...'}
                                        className={`w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs disabled:opacity-60 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer transition-all`}
                                      />
                                      {field.previewUrls && field.previewUrls.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {field.previewUrls.map((url, idx) => (
                                            <img key={idx} src={url} alt={`Preview ${idx + 1}`} className="h-24 object-contain rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-1" />
                                          ))}
                                        </div>
                                      )}
                                      {field.value && field.value !== 'Fetching...' && (
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold truncate">
                                          Selected: {field.value}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <input
                                        type={field.value === 'Fetching...' ? 'text' : (field.type || 'text')}
                                        value={field.value === 'Fetching...' ? '' : field.value}
                                        onChange={(e) => handleFieldChange(doctypeIdx, fieldIdx, e.target.value)}
                                        disabled={field.readonly || field.value === 'Fetching...'}
                                        placeholder={field.value === 'Fetching...' ? 'Fetching...' : field.label === 'Mobile' ? 'Enter 10-digit mobile number...' : `Enter ${field.label.toLowerCase()}...`}
                                        className={`${getInputClass(field)} ${field.value === 'Fetching...' ? 'animate-pulse pr-10 text-transparent select-none bg-slate-50/50' : ''}`}
                                      />
                                      {field.value === 'Fetching...' && (
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                                          <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-200 dark:border-zinc-800 px-8 py-5 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveStep}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-xs cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <div className="flex flex-col items-end">
                      <button
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:from-amber-600 hover:to-orange-700 transition-all text-xs cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {!isStepValid(currentStep) && (
                        <span className="text-[10px] text-rose-500 mt-1 font-bold animate-pulse text-right">
                          Required: {getMissingRequiredFields(currentStep).join(', ')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all text-xs cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FileCheck className="w-4 h-4" />
                      Submit & Go Live
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Carry Forward Strip Alert */}
            {currentStepData.carryFields.length > 0 && (
              <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    Automated Carry Forward Parameters
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold leading-relaxed">
                    The fields <strong className="text-emerald-950 dark:text-emerald-200">{currentStepData.carryFields.join(', ')}</strong> are integrated. Modifying them auto-distributes updates downstream.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Area: Carried Data & Schema Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-300">
              {/* Widget Header */}
              <div className="bg-slate-50 dark:bg-zinc-900 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Onboarding Summary
                </span>
              </div>

              {/* Widget Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Brand Banner */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-zinc-850 dark:to-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 text-center">
                    <h4 className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200 truncate">
                      {restaurantVal || 'Awaiting Restaurant or Bar Name'}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      {ownerVal ? `Registered to: ${ownerVal}` : 'Owner not defined yet'}
                    </p>
                  </div>

                  {/* Schema Nodes */}
                  <div className="space-y-4">
                    {/* Identity Card */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-500" />
                        <span>Owner Details</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-3 rounded-lg text-xs space-y-1.5 border border-slate-100 dark:border-zinc-900">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Mobile:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{getFieldValue(0, 'Partner Profile', 'Mobile') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Email:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{getFieldValue(0, 'Partner Profile', 'Email') || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Coordinates Card */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>Outlet Coordinates</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-3 rounded-lg text-xs space-y-1.5 border border-slate-100 dark:border-zinc-900">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Surrounding Meters:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{getFieldValue(0, 'Outlet Address', 'Surrounding Meters') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Latitude:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{getFieldValue(0, 'Outlet Address', 'Latitude') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Longitude:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{getFieldValue(0, 'Outlet Address', 'Longitude') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">City / Pincode:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {cityVal || '—'}{getFieldValue(0, 'Outlet Address', 'Pincode') ? `, ${getFieldValue(0, 'Outlet Address', 'Pincode')}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Business Hours Card (Step 2) */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Business Hours (Step 2)</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-3 rounded-lg text-xs space-y-1.5 border border-slate-100 dark:border-zinc-900">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Mon–Fri:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Business Hours', 'Mon–Fri') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Sat–Sun:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{getFieldValue(1, 'Business Hours', 'Sat–Sun') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Avg Prep time:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {getFieldValue(1, 'Business Hours', 'Avg Prep (mins)') ? `${getFieldValue(1, 'Business Hours', 'Avg Prep (mins)')} mins` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Documents Status */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                        Verification Status
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[9px] px-2 py-1 rounded-md font-bold ${getFieldValue(1, 'GST Registration', 'GSTIN') ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'}`}>
                          GSTIN Added
                        </span>
                        <span className={`text-[9px] px-2 py-1 rounded-md font-bold ${getFieldValue(1, 'FSSAI License', 'FSSAI Number') ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'}`}>
                          FSSAI Added
                        </span>
                        <span className={`text-[9px] px-2 py-1 rounded-md font-bold ${getFieldValue(1, 'Bank Account', 'Account Number') ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'}`}>
                          Bank Configured
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Helper Guideline Card */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-md text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              <h5 className="font-bold text-slate-700 dark:text-zinc-300 mb-1">Onboarding Help</h5>
              Please complete all registration steps. Your progress is automatically saved as a draft at each step.
            </div>
          </div>

        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Select Location on Map
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-200/60 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Find your current location automatically or drag/click the map to pin your business coordinates.
              </p>

              {/* Real Interactive Map Canvas */}
              <div className="h-64 w-full bg-slate-100 dark:bg-zinc-950 rounded-2xl relative border-2 border-slate-200 dark:border-zinc-800 overflow-hidden shadow-inner z-0">
                <div id="real-leaflet-map" className="w-full h-full"></div>
                {reverseGeocoding && (
                  <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-white/95 dark:bg-zinc-900/95 shadow-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Locating...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Address HUD */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 flex flex-col gap-1 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Selected Address
                </div>
                {reverseGeocoding ? (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Fetching exact street address...
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-relaxed">
                    {resolvedAddress?.display_name || "Custom Pin Location"}
                  </div>
                )}
                <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mt-1">
                  Latitude: <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{currentCoords.lat.toFixed(6)}</span> | Longitude: <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{currentCoords.lng.toFixed(6)}</span>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Jump to Preset Hubs</span>
                  {navigator.geolocation && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          setCurrentCoords({ lat, lng });
                          triggerReverseGeocoding(lat, lng);
                          if (mapRef.current && markerRef.current) {
                            mapRef.current.setView([lat, lng], 16);
                            markerRef.current.setLatLng([lat, lng]);
                          }
                        });
                      }}
                      className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      Use GPS Location
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={`px-3 py-2 rounded-xl border text-center cursor-pointer transition-all ${idx === selectedPreset
                        ? 'border-amber-500 bg-amber-500/5 text-amber-700 dark:text-amber-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-850/30 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <div className="text-[10px] font-bold truncate">{preset.name.split(',')[0]}</div>
                      <div className="text-[8px] text-slate-400 dark:text-zinc-500 font-semibold truncate mt-0.5">{preset.name.split(',')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 px-6 py-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-xs cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                disabled={isLocating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:from-amber-600 hover:to-orange-700 transition-all text-xs cursor-pointer shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>Auto-filling...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4.5 h-4.5 animate-bounce" />
                    <span>Confirm & Prefill Location</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
