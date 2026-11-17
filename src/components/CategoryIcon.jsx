import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  Headset,
  Home,
  Laptop,
  MapPin,
  School,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Armchair,
} from "lucide-react";

const ICONS = {
  "private-jobs": Building2,
  "data-entry-back-office": Laptop,
  "bpo-customer-care": Headset,
  "delivery-driver-logistics": Truck,
  "sales-marketing": BarChart3,
  "receptionist-front-office": Armchair,
  "security-housekeeping": ShieldCheck,
  "accounts-finance": Wallet,
  "hr-admin": Users,
  "teaching-tutoring": GraduationCap,
  "campus-trainee": GraduationCap,
  "aadhar-field-verification": ClipboardList,
  "iit-institute-jobs": School,
  "work-from-home": Home,
  "noida-jobs": MapPin,
  "gurgaon-jobs": MapPin,
  "other-jobs": ClipboardList,
};

export const CATEGORY_TONES = ["indigo", "sky", "emerald", "amber", "rose", "violet", "teal", "orange"];

export function getCategoryIcon(slug) {
  return ICONS[slug] || Briefcase;
}

export function getCategoryTone(index = 0) {
  return CATEGORY_TONES[index % CATEGORY_TONES.length];
}
