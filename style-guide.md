# Style Guide
## ผู้ช่วยสุขภาพสัตว์เลี้ยง

### 1. Brand Identity

#### 1.1 Brand Values
- **ความน่าเชื่อถือ (Trustworthy):** สร้างความมั่นใจในการดูแลสัตว์เลี้ยง
- **ความเข้าใจง่าย (Accessible):** ใช้งานง่าย เข้าใจได้ทุกกลุ่มผู้ใช้
- **ความเป็นมิตร (Friendly):** อบอุ่น เป็นกันเอง ไม่เป็นทางการจนเกินไป
- **ความเชี่ยวชาญ (Professional):** มีความรู้ความเชี่ยวชาญด้านสัตวแพทย์

#### 1.2 Brand Personality
- เป็นมิตรแต่เชี่ยวชาญ
- ให้ความรู้สึกปลอดภัยและมั่นใจ
- ใส่ใจในรายละเอียด
- เข้าถึงได้ง่าย

### 2. Color Palette

#### 2.1 Primary Colors
\`\`\`css
/* Primary Green - สีเขียวหลัก (ความสดใส, ธรรมชาติ, สุขภาพ) */
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-200: #bbf7d0;
--primary-300: #86efac;
--primary-400: #4ade80;
--primary-500: #22c55e; /* Main Primary */
--primary-600: #16a34a;
--primary-700: #15803d;
--primary-800: #166534;
--primary-900: #14532d;

/* Secondary Blue - สีน้ำเงินรอง (ความน่าเชื่อถือ, ความสงบ) */
--secondary-50: #eff6ff;
--secondary-100: #dbeafe;
--secondary-200: #bfdbfe;
--secondary-300: #93c5fd;
--secondary-400: #60a5fa;
--secondary-500: #3b82f6; /* Main Secondary */
--secondary-600: #2563eb;
--secondary-700: #1d4ed8;
--secondary-800: #1e40af;
--secondary-900: #1e3a8a;
\`\`\`

#### 2.2 Neutral Colors
\`\`\`css
/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* White & Black */
--white: #ffffff;
--black: #000000;
\`\`\`

#### 2.3 Semantic Colors
\`\`\`css
/* Success - สีเขียว */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* Warning - สีเหลือง */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Error - สีแดง */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Info - สีน้ำเงิน */
--info-50: #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
\`\`\`

### 3. Typography

#### 3.1 Font Families
\`\`\`css
/* Primary Font - สำหรับเนื้อหาทั่วไป */
--font-primary: 'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif;

/* Secondary Font - สำหรับหัวข้อ */
--font-heading: 'Poppins', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace Font - สำหรับโค้ด */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
\`\`\`

#### 3.2 Font Sizes & Line Heights
\`\`\`css
/* Headings */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
\`\`\`

#### 3.3 Font Weights
\`\`\`css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
\`\`\`

### 4. Spacing System

#### 4.1 Spacing Scale
\`\`\`css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
\`\`\`

### 5. Border Radius

\`\`\`css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;
\`\`\`

### 6. Shadows

\`\`\`css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
\`\`\`

### 7. Component Styles

#### 7.1 Buttons
\`\`\`css
/* Primary Button */
.btn-primary {
  background-color: var(--primary-500);
  color: var(--white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--secondary-500);
  color: var(--white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
}

/* Outline Button */
.btn-outline {
  background-color: transparent;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
}
\`\`\`

#### 7.2 Cards
\`\`\`css
.card {
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}
\`\`\`

#### 7.3 Forms
\`\`\`css
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgb(34 197 94 / 0.1);
}

.form-label {
  display: block;
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}
\`\`\`

### 8. Icons

#### 8.1 Icon System
- ใช้ Lucide React icons เป็นหลัก
- ขนาดมาตรฐาน: 16px, 20px, 24px, 32px
- สีไอคอนควรสอดคล้องกับเนื้อหา

#### 8.2 Icon Usage Guidelines
\`\`\`css
.icon-sm { width: 16px; height: 16px; }
.icon-base { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }

/* Icon Colors */
.icon-primary { color: var(--primary-500); }
.icon-secondary { color: var(--secondary-500); }
.icon-muted { color: var(--gray-400); }
.icon-success { color: var(--success-500); }
.icon-warning { color: var(--warning-500); }
.icon-error { color: var(--error-500); }
\`\`\`

### 9. Layout Guidelines

#### 9.1 Container Sizes
\`\`\`css
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }
\`\`\`

#### 9.2 Grid System
- ใช้ CSS Grid และ Flexbox
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### 10. Animation & Transitions

#### 10.1 Timing Functions
\`\`\`css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
\`\`\`

#### 10.2 Duration
\`\`\`css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
\`\`\`

### 11. Accessibility

#### 11.1 Color Contrast
- ข้อความหลัก: อย่างน้อย 4.5:1
- ข้อความใหญ่: อย่างน้อย 3:1
- UI elements: อย่างน้อย 3:1

#### 11.2 Focus States
\`\`\`css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
\`\`\`

### 12. Dark Mode Support

#### 12.1 Dark Mode Colors
\`\`\`css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--gray-900);
    --bg-secondary: var(--gray-800);
    --text-primary: var(--gray-100);
    --text-secondary: var(--gray-300);
    --border-color: var(--gray-700);
  }
}
\`\`\`

### 13. Mobile-First Design

#### 13.1 Responsive Typography
\`\`\`css
.heading-responsive {
  font-size: var(--text-2xl);
}

@media (min-width: 768px) {
  .heading-responsive {
    font-size: var(--text-3xl);
  }
}

@media (min-width: 1024px) {
  .heading-responsive {
    font-size: var(--text-4xl);
  }
}
\`\`\`

#### 13.2 Touch Targets
- ขนาดขั้นต่ำ: 44px x 44px
- ระยะห่างระหว่าง touch targets: อย่างน้อย 8px

### 14. Performance Guidelines

#### 14.1 Image Optimization
- ใช้ WebP format เมื่อเป็นไปได้
- Lazy loading สำหรับรูปภาพที่ไม่อยู่ในหน้าจอ
- Responsive images ด้วย srcset

#### 14.2 CSS Optimization
- ใช้ CSS custom properties
- Minimize unused CSS
- Use efficient selectors

### 15. Brand Applications

#### 15.1 Logo Usage
- ขนาดขั้นต่ำ: 120px width
- Clear space: เท่ากับความสูงของโลโก้
- สีพื้นหลัง: ขาว, เทาอ่อน, หรือสีเขียวหลัก

#### 15.2 Voice & Tone
- **เป็นมิตร:** ใช้ภาษาที่อบอุ่น เข้าใจง่าย
- **เชี่ยวชาญ:** แสดงความรู้โดยไม่ซับซ้อน
- **ให้กำลังใจ:** สร้างความมั่นใจในการดูแลสัตว์เลี้ยง
- **ชัดเจน:** ข้อมูลตรงประเด็น ไม่คลุมเครือ

#### 15.3 Content Guidelines
- ใช้ภาษาไทยที่ถูกต้อง
- หลีกเลี่ยงศัพท์เทคนิคที่ซับซ้อน
- ใส่ disclaimer เมื่อจำเป็น
- เน้นความปลอดภัยของสัตว์เลี้ยงเป็นสำคัญ
