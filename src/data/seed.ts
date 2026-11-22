import type {
  Course,
  CourseQuiz,
  Enrollment,
  Lesson,
  LessonType,
  Notification,
  Payment,
  QuizQuestion,
  SampleAccount,
  User,
} from '../types'
import { avatarGradient } from '../lib/utils'

/* ------------------------------------------------------------------ */
/* Kateqoriyalar                                                      */
/* ------------------------------------------------------------------ */
export const CATEGORIES = [
  { name: 'Frontend', icon: 'Layout', accent: 'brand' },
  { name: 'Backend', icon: 'Server', accent: 'accent' },
  { name: 'Data & AI', icon: 'BrainCircuit', accent: 'neon' },
  { name: 'Dizayn', icon: 'Palette', accent: 'rose' },
  { name: 'Kibertəhlükəsizlik', icon: 'ShieldCheck', accent: 'emerald' },
  { name: 'Mobil', icon: 'Smartphone', accent: 'sky' },
  { name: 'DevOps', icon: 'Container', accent: 'amber' },
  { name: 'Marketinq', icon: 'Megaphone', accent: 'rose' },
  { name: 'Keyfiyyət (QA)', icon: 'Bug', accent: 'accent' },
] as const

/* ------------------------------------------------------------------ */
/* İstifadəçilər                                                      */
/* ------------------------------------------------------------------ */
interface UserSeed {
  id: string
  fullName: string
  email: string
  password: string
  role: User['role']
  phone: string
  city: string
  bio: string
  createdAt: string
  specialization?: string
  experienceYears?: number
  rating?: number
  xp?: number
  level?: string
  balance?: number
  status?: User['status']
  education?: string
  skills?: string[]
  languages?: string[]
  hourlyRate?: number
  cvText?: string
  cvFileName?: string
  certificates?: string[]
  appliedAt?: string
  approvalNote?: string
}

const USER_SEEDS: UserSeed[] = [
  {
    id: 'u_admin',
    fullName: 'Elmar Süleymanov',
    email: 'admin@codevia.az',
    password: 'admin123',
    role: 'admin',
    phone: '+994 50 100 10 10',
    city: 'Bakı',
    bio: 'CodeVia Academy-nin təsisçisi və baş administratoru. 14 ildən artıq IT təhsili sahəsində təcrübə.',
    createdAt: '2024-01-12',
  },
  {
    id: 'u_t1',
    fullName: 'Kamran Əliyev',
    email: 'teacher@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 51 200 30 40',
    city: 'Bakı',
    bio: 'Senior Frontend Engineer. React və TypeScript ilə 9 ildir iri miqyaslı məhsullar üzərində işləyir.',
    specialization: 'Frontend / React & TypeScript',
    experienceYears: 9,
    rating: 4.9,
    createdAt: '2024-02-04',
  },
  {
    id: 'u_t2',
    fullName: 'Leyla Məmmədova',
    email: 'leyla@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 55 411 22 33',
    city: 'Bakı',
    bio: 'Data Scientist. Python, SQL və maşın öyrənməsi üzrə sənaye layihələrində təcrübəli mutəxəssis.',
    specialization: 'Data Science / Python',
    experienceYears: 7,
    rating: 4.8,
    createdAt: '2024-03-18',
  },
  {
    id: 'u_t3',
    fullName: 'Rəşad Hüseynov',
    email: 'rashad@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 70 555 66 77',
    city: 'Bakı',
    bio: 'Kibertəhlükəsizlik üzrə auditor (OSCP). Bank sektorunda penetration test layihələri icra edir.',
    specialization: 'Kibertəhlükəsizlik',
    experienceYears: 11,
    rating: 4.9,
    createdAt: '2024-04-02',
  },
  {
    id: 'u_t4',
    fullName: 'Nigar Səfərova',
    email: 'nigar@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 50 777 88 99',
    city: 'Bakı',
    bio: 'Product Designer. Figma, design system və istifadəçi tədqiqatı sahəsində 8 illik təcrübə.',
    specialization: 'UI/UX Dizayn',
    experienceYears: 8,
    rating: 4.7,
    createdAt: '2024-05-11',
  },
  {
    id: 'u_t5',
    fullName: 'Elvin Quliyev',
    email: 'elvin@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 51 333 44 55',
    city: 'Bakı',
    bio: 'Backend & DevOps mühəndisi. Node.js, Docker və Kubernetes ilə mikroservis arxitekturaları qurur.',
    specialization: 'Backend / DevOps',
    experienceYears: 10,
    rating: 4.8,
    createdAt: '2024-06-21',
  },
  {
    id: 'u_t6',
    fullName: 'Aysel Rzayeva',
    email: 'aysel@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 55 222 11 00',
    city: 'Sumqayıt',
    bio: 'Mobil tətbiq developer. React Native və Flutter ilə 30+ tətbiq buraxıb.',
    specialization: 'Mobil Development',
    experienceYears: 6,
    rating: 4.6,
    createdAt: '2024-07-09',
  },
  {
    id: 'u_t7',
    fullName: 'Sevinc Qasımova',
    email: 'sevinc@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 70 909 12 34',
    city: 'Bakı',
    bio: 'Rəqəmsal marketinq strategu. SEO, performance marketing və analitika üzrə mütəxəssis.',
    specialization: 'Rəqəmsal Marketinq',
    experienceYears: 9,
    rating: 4.5,
    createdAt: '2024-08-15',
  },
  {
    id: 'u_t8',
    fullName: 'Tural İsmayılov',
    email: 'tural@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 51 616 77 88',
    city: 'Bakı',
    bio: 'QA Lead. Playwright və Cypress ilə avtomatlaşdırılmış test infrastrukturu qurur.',
    specialization: 'QA & Test Avtomatlaşdırma',
    experienceYears: 7,
    rating: 4.7,
    createdAt: '2024-09-01',
  },
  {
    id: 'u_t9',
    fullName: 'Nurlan Əsədov',
    email: 'nurlan@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 50 444 55 66',
    city: 'Bakı',
    bio: 'Full-stack developer. React, Node.js və PostgreSQL ilə 5 ildir məhsul komandalarında çalışır. Tədris təcrübəsi var.',
    specialization: 'Full-Stack Development',
    experienceYears: 5,
    education: 'ADA University — Kompüter Elmləri (Bakalavr)',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    languages: ['Azərbaycan', 'İngilis', 'Rus'],
    hourlyRate: 35,
    cvText:
      'TƏHSİL\nADA University — Kompüter Elmləri (2016–2020)\n\nİŞ TƏCRÜBƏSİ\n2020–2023 — Mid-level Frontend Developer, «TechLab MMC»\n2023–indiyədək — Full-stack Developer, «Digital Solutions»\n\nBACARIQLAR\nReact, TypeScript, Node.js, Express, PostgreSQL, Docker, Git\n\nSERTİFİKATLAR\nMeta Front-End Developer Professional Certificate (2022)',
    cvFileName: 'Nurlan_Esedov_CV.pdf',
    certificates: ['Meta Front-End Developer Certificate'],
    createdAt: '2026-11-18',
    status: 'pending',
    appliedAt: '2026-11-18T10:24:00',
  },
  {
    id: 'u_t10',
    fullName: 'Rəna Quliyeva',
    email: 'rena@codevia.az',
    password: 'teacher123',
    role: 'teacher',
    phone: '+994 55 111 22 33',
    city: 'Gəncə',
    bio: 'Qrafik dizayner. Branding və vizual identifikasiya sahəsində işləyir.',
    specialization: 'Qrafik dizayn',
    experienceYears: 3,
    education: 'Azərbaycan Dövlət Rəssamlıq Akademiyası',
    skills: ['Adobe Illustrator', 'Photoshop', 'Branding'],
    languages: ['Azərbaycan', 'İngilis'],
    hourlyRate: 20,
    cvText: 'QRAFİK DİZAYNER\n\nTəhsil: ADRA — Qrafika (2019–2023)\nTəcrübə: 3 il freelancer və studiya işi',
    cvFileName: 'Rena_Quliyeva_CV.pdf',
    createdAt: '2026-11-10',
    status: 'rejected',
    appliedAt: '2026-11-10T14:05:00',
    approvalNote: 'Tədris təcrübəsi kifayət etmədiyi üçün müraciət rədd edildi.',
  },
  {
    id: 'u_s1',
    fullName: 'Orxan Nəbiyev',
    email: 'student@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 50 123 45 67',
    city: 'Bakı',
    bio: 'Karyerasını frontend sahəsinə dəyişmək istəyən gənc mütəxəssis.',
    xp: 2480,
    level: 'Səviyyə 4',
    balance: 120,
    createdAt: '2025-09-14',
  },
  {
    id: 'u_s2',
    fullName: 'Ayan Hacıyeva',
    email: 'ayan@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 55 234 56 78',
    city: 'Bakı',
    bio: 'Data analitikası ilə maraqlanan tələbə.',
    xp: 3120,
    level: 'Səviyyə 5',
    balance: 0,
    createdAt: '2025-09-20',
  },
  {
    id: 'u_s3',
    fullName: 'Murad Əhmədov',
    email: 'murad@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 70 345 67 89',
    city: 'Sumqayıt',
    bio: 'Backend arxitekturasına maraq göstərir.',
    xp: 1890,
    level: 'Səviyyə 3',
    balance: 0,
    createdAt: '2025-10-02',
  },
  {
    id: 'u_s4',
    fullName: 'Zeynəb Kərimli',
    email: 'zeynab@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 51 456 78 90',
    city: 'Bakı',
    bio: 'UI/UX dizayn sahəsində karyera qurmaq istəyir.',
    xp: 4210,
    level: 'Səviyyə 6',
    balance: 60,
    createdAt: '2025-10-11',
  },
  {
    id: 'u_s5',
    fullName: 'Rüfət Soltanov',
    email: 'rufat@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 55 567 89 01',
    city: 'Gəncə',
    bio: 'Kibertəhlükəsizlik üzrə ixtisaslaşmaq istəyir.',
    xp: 980,
    level: 'Səviyyə 2',
    balance: 0,
    createdAt: '2025-11-05',
  },
  {
    id: 'u_s6',
    fullName: 'Gülnar Abdullayeva',
    email: 'gulnar@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 70 678 90 12',
    city: 'Bakı',
    bio: 'Mobil tətbiq developer olmağı hədəfləyir.',
    xp: 1520,
    level: 'Səviyyə 3',
    balance: 0,
    createdAt: '2025-11-19',
  },
  {
    id: 'u_s7',
    fullName: 'Cavid Məlikov',
    email: 'cavid@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 50 789 01 23',
    city: 'Bakı',
    bio: 'DevOps sahəsinə keçid etmək istəyir.',
    xp: 2650,
    level: 'Səviyyə 4',
    balance: 0,
    createdAt: '2025-12-01',
  },
  {
    id: 'u_s8',
    fullName: 'Ləman Vəliyeva',
    email: 'leman@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 55 890 12 34',
    city: 'Bakı',
    bio: 'Rəqəmsal marketinq üzrə biliklərini artırır.',
    xp: 720,
    level: 'Səviyyə 2',
    balance: 0,
    createdAt: '2026-01-08',
  },
  {
    id: 'u_s9',
    fullName: 'Fərid Babayev',
    email: 'farid@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 70 901 23 45',
    city: 'Bakı',
    bio: 'QA avtomatlaşdırma üzrə ixtisaslaşır.',
    xp: 2040,
    level: 'Səviyyə 4',
    balance: 0,
    createdAt: '2026-01-22',
  },
  {
    id: 'u_s10',
    fullName: 'Səbinə İsmayılzadə',
    email: 'sabina@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 51 012 34 56',
    city: 'Bakı',
    bio: 'Full-stack developer olmaq istəyir.',
    xp: 3410,
    level: 'Səviyyə 5',
    balance: 0,
    createdAt: '2026-02-06',
  },
  {
    id: 'u_s11',
    fullName: 'Turan Əliyeva',
    email: 'turan@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 55 123 99 88',
    city: 'Sumqayıt',
    bio: 'SQL və analitika ilə maraqlanır.',
    xp: 1120,
    level: 'Səviyyə 3',
    balance: 0,
    createdAt: '2026-02-27',
  },
  {
    id: 'u_s12',
    fullName: 'Kamran Zeynalov',
    email: 'kamranz@codevia.az',
    password: 'student123',
    role: 'student',
    phone: '+994 70 456 11 22',
    city: 'Bakı',
    bio: 'Alqoritmlər və müsahibə hazırlığı üzərində çalışır.',
    xp: 540,
    level: 'Səviyyə 1',
    balance: 0,
    createdAt: '2026-03-10',
  },
]

export const seedUsers: User[] = USER_SEEDS.map((u) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  password: u.password,
  role: u.role,
  phone: u.phone,
  city: u.city,
  bio: u.bio,
  avatar: avatarGradient(u.id + u.fullName),
  status: u.status ?? 'active',
  createdAt: u.createdAt,
  specialization: u.specialization,
  experienceYears: u.experienceYears,
  rating: u.rating,
  education: u.education,
  skills: u.skills,
  languages: u.languages,
  hourlyRate: u.hourlyRate,
  cvText: u.cvText,
  cvFileName: u.cvFileName,
  certificates: u.certificates,
  appliedAt: u.appliedAt,
  approvalNote: u.approvalNote,
  xp: u.xp,
  level: u.level,
  balance: u.balance,
}))

/* ------------------------------------------------------------------ */
/* Kurslar                                                            */
/* ------------------------------------------------------------------ */
interface CourseSeed {
  id: string
  title: string
  category: string
  level: Course['level']
  mode: Course['mode']
  summary: string
  description: string
  teacherId: string
  durationWeeks: number
  lessonsPerWeek: number
  totalHours: number
  basePrice: number
  oldPrice?: number
  rating: number
  reviewCount: number
  studentCount: number
  tags: string[]
  outcomes: string[]
  requirements: string[]
  tech: string[]
  coverPrompt: string
  accent: string
  status: Course['status']
  popular: boolean
  createdAt: string
}

const COURSE_SEEDS: CourseSeed[] = [
  {
    id: 'c1',
    title: 'Frontend Development: React & TypeScript',
    category: 'Frontend',
    level: 'baslangic',
    mode: 'online',
    summary: 'HTML, CSS, JavaScript təməlindən başlayaraq React + TypeScript ilə real layihələr qurma.',
    description:
      'Bu proqram sıfırdan başlayanlar üçün nəzərdə tutulub. Semantik HTML və müasir CSS-dən başlayıb JavaScript-in dərinliklərinə, oradan TypeScript tiplərinə və React ekosisteminə (Redux Toolkit, RTK Query, React Router) keçirik. Kurs boyu 5 real layihə qurulur və hər biri portfolio üçün yararlı olur.',
    teacherId: 'u_t1',
    durationWeeks: 16,
    lessonsPerWeek: 3,
    totalHours: 96,
    basePrice: 599,
    oldPrice: 749,
    rating: 4.9,
    reviewCount: 214,
    studentCount: 386,
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Portfolio'],
    outcomes: [
      'React komponent arxitekturasını peşəkar səviyyədə qurmaq',
      'TypeScript ilə tipləşdirilmiş tətbiq yazmaq',
      'Redux Toolkit & RTK Query ilə state və API idarəsi',
      'Responsive və əlçatan (a11y) interfeys hazırlamaq',
      'Git/GitHub ilə komanda iş axınına uyğunlaşmaq',
    ],
    requirements: ['Kompüterə çıxış və stabil internet', 'Riyaziyyat üzrə orta səviyyə bilik'],
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Redux Toolkit'],
    coverPrompt: 'modern web development workspace with glowing React and TypeScript code editor on dark desk',
    accent: 'brand',
    status: 'published',
    popular: true,
    createdAt: '2025-09-01',
  },
  {
    id: 'c2',
    title: 'Full-Stack JavaScript: Node.js & Express',
    category: 'Backend',
    level: 'orta',
    mode: 'hybrid',
    summary: 'REST API, autentifikasiya, verilənlər bazası və cloud deployment ilə tam backend bacarığı.',
    description:
      'Node.js ilə server tərəfi JavaScript-i mənimsəyirik. Express, autentifikasiya (JWT), rol əsaslı icazələr, PostgreSQL/MongoDB inteqrasiyası, fayl yükləmə, email xidmətləri və nəhayət buludda deployment. Kurs sonunda tam işlək backend servisi qurulur.',
    teacherId: 'u_t5',
    durationWeeks: 14,
    lessonsPerWeek: 3,
    totalHours: 84,
    basePrice: 649,
    rating: 4.8,
    reviewCount: 168,
    studentCount: 241,
    tags: ['Node.js', 'Express', 'REST API', 'PostgreSQL'],
    outcomes: [
      'Peşəkar REST API dizayn etmək',
      'JWT ilə autentifikasiya və avtorizasiya qurmaq',
      'PostgreSQL/MongoDB ilə verilənlər bazası layihələndirmək',
      'Docker ilə tətbiqi paketləmək',
      'API-ni buludda yayımlamaq',
    ],
    requirements: ['JavaScript əsasları', 'Frontend təcrübəsi arzuolunandır'],
    tech: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker'],
    coverPrompt: 'server room with glowing node js backend architecture diagram on dark holographic screen',
    accent: 'accent',
    status: 'published',
    popular: true,
    createdAt: '2025-09-08',
  },
  {
    id: 'c3',
    title: 'Python ilə Data Elmləri və Maşın Öyrənməsi',
    category: 'Data & AI',
    level: 'orta',
    mode: 'online',
    summary: 'Pandas, NumPy, vizuallaşdırma və maşın öyrənməsi alqoritmləri ilə real data layihələri.',
    description:
      'Python dilinin data elmləri üçün gücünü kəşf edirik. Data təmizləmə, kəşfiyyat analizi (EDA), vizuallaşdırma, statistik modelləşdirmə, scikit-learn ilə maşın öyrənməsi və sadə neyron şəbəkələr. Sonda real dataset üzərində uçdan-uca layihə tamamlanır.',
    teacherId: 'u_t2',
    durationWeeks: 18,
    lessonsPerWeek: 3,
    totalHours: 108,
    basePrice: 699,
    oldPrice: 849,
    rating: 4.8,
    reviewCount: 132,
    studentCount: 198,
    tags: ['Python', 'Pandas', 'scikit-learn', 'Analitika'],
    outcomes: [
      'Python ilə data manipulyasiyası',
      'Pandas & NumPy ilə analiz',
      'Matplotlib/Seaborn ilə vizuallaşdırma',
      'Maşın öyrənməsi modelləri qurmaq',
      'Uçdan-uca data layihəsi təqdim etmək',
    ],
    requirements: ['Python əsasları (dəyişənlər, dövrlər, funksiyalar)', 'Statistika ilə tanışlıq'],
    tech: ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'Jupyter'],
    coverPrompt: 'data science analytics dashboard with glowing neural network graph and python charts on dark background',
    accent: 'neon',
    status: 'published',
    popular: true,
    createdAt: '2025-09-15',
  },
  {
    id: 'c4',
    title: 'UI/UX Dizayn və Figma Master',
    category: 'Dizayn',
    level: 'baslangic',
    mode: 'offline',
    summary: 'İstifadəçi tədqiqatından design system-ə qədər tam məhsul dizaynı prosesi.',
    description:
      'Figma ilə sıfırdan peşəkar dizayner olmaq üçün lazım olan hər şey. İstifadəçi tədqiqatı, wireframe, prototip, avto-layout, komponent kitabxanası, design token-lər, mikrocavablar və developer handoff. Fiziki dərslərlə canlı geribildirim alırsınız.',
    teacherId: 'u_t4',
    durationWeeks: 12,
    lessonsPerWeek: 2,
    totalHours: 60,
    basePrice: 499,
    rating: 4.7,
    reviewCount: 96,
    studentCount: 154,
    tags: ['Figma', 'Design System', 'UX Research', 'Prototip'],
    outcomes: [
      'Figma-nı peşəkar səviyyədə istifadə etmək',
      'İstifadəçi tədqiqatı aparmaq',
      'Design system qurmaq',
      'Yüksək keyfiyyətli prototip hazırlamaq',
      'Portfolio üçün 4 layihə toplamaq',
    ],
    requirements: ['Kompüter (Windows/macOS)', 'Figma hesabı'],
    tech: ['Figma', 'FigJam', 'Maze', 'Notion'],
    coverPrompt: 'ui ux designer workspace with figma wireframes and glass morphism mobile app mockups neon glow',
    accent: 'rose',
    status: 'published',
    popular: false,
    createdAt: '2025-10-02',
  },
  {
    id: 'c5',
    title: 'Kibertəhlükəsizliyə Giriş və Penetration Test',
    category: 'Kibertəhlükəsizlik',
    level: 'orta',
    mode: 'hybrid',
    summary: 'Şəbəkə təhlükəsizliyi, zəiflik axtarışı, exploit və müdafiə metodologiyaları.',
    description:
      'Etik haking əsaslarından başlayaraq real penetration test metodologiyasına. Linux, şəbəkə protokolları, OWASP Top 10, Burp Suite, Nmap, Metasploit, zəiflik qiymətləndirməsi və hesabat yazılması. Laboratoriya mühitində real tapşırıqlar icra olunur.',
    teacherId: 'u_t3',
    durationWeeks: 16,
    lessonsPerWeek: 3,
    totalHours: 96,
    basePrice: 749,
    rating: 4.9,
    reviewCount: 78,
    studentCount: 121,
    tags: ['Linux', 'OWASP', 'Burp Suite', 'Red Team'],
    outcomes: [
      'Şəbəkə və sistem təhlükəsizliyini qiymətləndirmək',
      'OWASP Top 10 zəifliklərini tapmaq və istismar etmək',
      'Penetration test hesabatı yazmaq',
      'Müdafiə tədbirləri planlaşdırmaq',
      'CTF tapşırıqlarını həll etmək',
    ],
    requirements: ['Şəbəkə əsasları', 'Linux komanda sətri ilə tanışlıq'],
    tech: ['Kali Linux', 'Burp Suite', 'Nmap', 'Metasploit', 'Wireshark'],
    coverPrompt: 'cyber security operations center with glowing shield hologram and network attack map dark blue',
    accent: 'emerald',
    status: 'published',
    popular: false,
    createdAt: '2025-10-14',
  },
  {
    id: 'c6',
    title: 'Mobil Tətbiq Development: React Native',
    category: 'Mobil',
    level: 'orta',
    mode: 'online',
    summary: 'iOS və Android üçün eyni kodla production səviyyəli mobil tətbiq hazırlamaq.',
    description:
      'React Native ilə krossplatform mobil tətbiqlər qururuq. Naviqasiya, yerli yaddaş, kamera/lokasiya API-ləri, push bildirişlər, animasiyalar, App Store və Google Play-ə yayım. Kurs boyu 3 tam tətbiq hazırlanır.',
    teacherId: 'u_t6',
    durationWeeks: 14,
    lessonsPerWeek: 3,
    totalHours: 84,
    basePrice: 629,
    rating: 4.6,
    reviewCount: 64,
    studentCount: 112,
    tags: ['React Native', 'Expo', 'iOS', 'Android'],
    outcomes: [
      'Krossplatform mobil tətbiq qurmaq',
      'Nativ modullarla inteqrasiya',
      'Animasiya və gesture idarəsi',
      'Tətbiqi mağazalara yayımlamaq',
      'Performans optimizasiyası',
    ],
    requirements: ['React əsasları', 'JavaScript/TypeScript biliyi'],
    tech: ['React Native', 'Expo', 'TypeScript', 'Firebase'],
    coverPrompt: 'mobile app development with smartphone mockups floating and glowing code on dark purple background',
    accent: 'sky',
    status: 'published',
    popular: false,
    createdAt: '2025-11-03',
  },
  {
    id: 'c7',
    title: 'DevOps: Docker, Kubernetes & CI/CD',
    category: 'DevOps',
    level: 'pesekar',
    mode: 'online',
    summary: 'Konteynerləşdirmə, orkestrasiya, avtomatlaşdırılmış deploy və monitorinq.',
    description:
      'Müasir DevOps praktikalarını mənimsəyirik. Linux, Docker, Docker Compose, Kubernetes klaster qurulumu, Helm, GitHub Actions ilə CI/CD pipeline-ları, Terraform ilə infrastruktur kodu və Prometheus/Grafana ilə monitorinq.',
    teacherId: 'u_t5',
    durationWeeks: 16,
    lessonsPerWeek: 3,
    totalHours: 96,
    basePrice: 799,
    oldPrice: 949,
    rating: 4.8,
    reviewCount: 88,
    studentCount: 143,
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    outcomes: [
      'Tətbiqləri konteynerə yığmaq',
      'Kubernetes klasterini idarə etmək',
      'CI/CD pipeline qurmaq',
      'Infrastrukturu kodla təsvir etmək',
      'Sistem monitorinqi qurmaq',
    ],
    requirements: ['Linux komanda sətri', 'Şəbəkə əsasları', 'Backend təcrübəsi'],
    tech: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Grafana'],
    coverPrompt: 'devops kubernetes container orchestration visualization with glowing nodes and pipeline on dark background',
    accent: 'amber',
    status: 'published',
    popular: true,
    createdAt: '2025-11-20',
  },
  {
    id: 'c8',
    title: 'SQL və Verilənlər Bazası Əsasları',
    category: 'Data & AI',
    level: 'baslangic',
    mode: 'online',
    summary: 'Sorğu yazmaqdan verilənlər bazası dizaynına qədər praktik SQL bacarıqları.',
    description:
      'Relational verilənlər bazası əsasları, SELECT sorğuları, JOIN-lər, aqreqasiya, alt-sorğular, indekslər, normalizasiya və performans optimizasiyası. PostgreSQL üzərində real biznes ssenariləri həll olunur.',
    teacherId: 'u_t2',
    durationWeeks: 10,
    lessonsPerWeek: 2,
    totalHours: 50,
    basePrice: 399,
    rating: 4.7,
    reviewCount: 142,
    studentCount: 268,
    tags: ['SQL', 'PostgreSQL', 'Data Modeling'],
    outcomes: [
      'Mürəkkəb SQL sorğuları yazmaq',
      'JOIN və aqreqasiya funksiyalarını istifadə etmək',
      'Verilənlər bazası sxemi dizayn etmək',
      'Sorğu performansını optimallaşdırmaq',
      'Analitik hesabatlar hazırlamaq',
    ],
    requirements: ['Kompüterə çıxış'],
    tech: ['PostgreSQL', 'DBeaver', 'Excel'],
    coverPrompt: 'database tables visualization with glowing sql query window and relational diagram on dark navy',
    accent: 'accent',
    status: 'published',
    popular: false,
    createdAt: '2025-12-05',
  },
  {
    id: 'c9',
    title: 'Rəqəmsal Marketinq və SEO',
    category: 'Marketinq',
    level: 'baslangic',
    mode: 'offline',
    summary: 'Sosial media, performance marketing, SEO və analitika ilə brendin böyüməsi.',
    description:
      'Rəqəmsal marketinqin bütün kanallarını praktik olaraq öyrənirik. SEO (texniki + məzmun), Google Ads, Meta Ads, e-mail marketinq, kontent strategiyası, Google Analytics 4 və hesabatlıq. Real brend üzərində kampaniya qurulur.',
    teacherId: 'u_t7',
    durationWeeks: 10,
    lessonsPerWeek: 2,
    totalHours: 52,
    basePrice: 349,
    rating: 4.5,
    reviewCount: 58,
    studentCount: 132,
    tags: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics'],
    outcomes: [
      'SEO auditini müstəqil aparmaq',
      'Reklam kampaniyası qurmaq və optimallaşdırmaq',
      'Kontent strategiyası hazırlamaq',
      'GA4 ilə nəticələri ölçmək',
      'Marketinq planı təqdim etmək',
    ],
    requirements: ['Kompüterə çıxış'],
    tech: ['GA4', 'Google Ads', 'Meta Business', 'Ahrefs'],
    coverPrompt: 'digital marketing analytics dashboard with glowing growth charts and social media icons dark theme',
    accent: 'rose',
    status: 'published',
    popular: false,
    createdAt: '2025-12-18',
  },
  {
    id: 'c10',
    title: 'QA Test Avtomatlaşdırma (Playwright & Cypress)',
    category: 'Keyfiyyət (QA)',
    level: 'orta',
    mode: 'hybrid',
    summary: 'Manual testdən avtomatlaşdırılmış testə keçid — real framework layihəsi ilə.',
    description:
      'Test nəzəriyyəsi, test case dizaynı, bug report, API testləri (Postman) və əsas hissə: avtomatlaşdırmа. Playwright və Cypress ilə E2E testlər, Page Object Model, CI inteqrasiyası və test hesabatlığı (Allure).',
    teacherId: 'u_t8',
    durationWeeks: 12,
    lessonsPerWeek: 3,
    totalHours: 72,
    basePrice: 549,
    rating: 4.7,
    reviewCount: 71,
    studentCount: 118,
    tags: ['Playwright', 'Cypress', 'API Testing', 'CI'],
    outcomes: [
      'Test ssenariləri dizayn etmək',
      'E2E test avtomatlaşdırması qurmaq',
      'Page Object Model tətbiq etmək',
      'API testlərini yazmaq',
      'Testləri CI-a qoşmaq',
    ],
    requirements: ['JavaScript əsasları', 'Test anlayışı'],
    tech: ['Playwright', 'Cypress', 'Postman', 'Allure'],
    coverPrompt: 'qa automation testing dashboard with glowing test cases green checkmarks and code on dark screen',
    accent: 'emerald',
    status: 'published',
    popular: false,
    createdAt: '2026-01-09',
  },
]

export const seedCourses: Course[] = COURSE_SEEDS.map((c) => ({
  ...c,
  slug: c.id,
}))

/* ------------------------------------------------------------------ */
/* Dərslər / Silabus                                                  */
/* ------------------------------------------------------------------ */
interface LessonSeed {
  title: string
  yt: string
  min: number
  type?: LessonType
}
interface ModuleSeed {
  title: string
  lessons: LessonSeed[]
}

function buildLessons(courseId: string, modules: ModuleSeed[]): Lesson[] {
  const out: Lesson[] = []
  modules.forEach((m, mi) => {
    m.lessons.forEach((l) => {
      const index = out.length
      out.push({
        id: `${courseId}-l${String(index + 1).padStart(2, '0')}`,
        courseId,
        moduleTitle: m.title,
        moduleOrder: mi + 1,
        order: index + 1,
        title: l.title,
        description:
          `«${l.title}» dərsində mövzunun nəzəri əsasları izah olunur, canlı kod nümunələri yazılır və ` +
          `mövzunu möhkəmləndirən praktik tapşırıq verilir. Dərs sonunda müəllim kodu nəzərdən keçirir.`,
        durationMin: l.min,
        youtubeId: l.yt,
        type: l.type ?? 'video',
        isFree: index < 2,
        resources: [
          { title: 'Dərs qeydləri (PDF)', url: '#' },
          { title: 'Kod nümunələri (GitHub)', url: '#' },
          { title: 'Əlavə oxu materialları', url: '#' },
        ],
      })
    })
  })
  return out
}

export const seedLessons: Lesson[] = [
  ...buildLessons('c1', [
    {
      title: 'Modul 1 — Web texnologiyalarına giriş',
      lessons: [
        { title: 'İnternet necə işləyir? HTTP, DNS və brauzer', yt: 'pQN-pnXPaVg', min: 42 },
        { title: 'Semantik HTML5 strukturunun qurulması', yt: 'pQN-pnXPaVg', min: 55 },
        { title: 'Müasir CSS: Flexbox, Grid və responsiv dizayn', yt: '1Rs2ND1ryYc', min: 68 },
        { title: 'Praktika: Landing page-in sıfırdan qurulması', yt: '1Rs2ND1ryYc', min: 74, type: 'project' },
      ],
    },
    {
      title: 'Modul 2 — JavaScript əsasları',
      lessons: [
        { title: 'Dəyişənlər, tiplər və operatorlar', yt: 'PkZNo7MFNFg', min: 61 },
        { title: 'Funksiyalar, scope və closure', yt: 'PkZNo7MFNFg', min: 58 },
        { title: 'Massivlər, obyektlər və destrukturizasiya', yt: 'PkZNo7MFNFg', min: 66 },
        { title: 'DOM manipulyasiyası və hadisələr', yt: 'PkZNo7MFNFg', min: 72 },
        { title: 'Asinxron JavaScript: Promise, async/await', yt: 'PkZNo7MFNFg', min: 64, type: 'live' },
      ],
    },
    {
      title: 'Modul 3 — TypeScript',
      lessons: [
        { title: 'TypeScript nədir və niyə lazımdır?', yt: 'BwuLxPH8IDs', min: 48 },
        { title: 'Interfeyslər, tiplər və generics', yt: 'BwuLxPH8IDs', min: 62 },
        { title: 'TypeScript ilə layihə konfiqurasiyası (Vite)', yt: 'BwuLxPH8IDs', min: 44 },
      ],
    },
    {
      title: 'Modul 4 — React',
      lessons: [
        { title: 'React-ə giriş: komponentlər və JSX', yt: 'bMknfKXIFA8', min: 57 },
        { title: 'Props, state və useState hook-u', yt: 'bMknfKXIFA8', min: 63 },
        { title: 'useEffect, useMemo və useCallback', yt: 'bMknfKXIFA8', min: 70 },
        { title: 'React Router ilə çoxsəhifəli tətbiq', yt: 'bMknfKXIFA8', min: 52 },
        { title: 'Redux Toolkit ilə state idarəsi', yt: 'bMknfKXIFA8', min: 78 },
        { title: 'RTK Query ilə API inteqrasiyası', yt: 'bMknfKXIFA8', min: 66 },
      ],
    },
    {
      title: 'Modul 5 — Yekun layihə və karyera',
      lessons: [
        { title: 'Yekun layihə: LMS panelinin qurulması', yt: 'bMknfKXIFA8', min: 96, type: 'project' },
        { title: 'Portfolio və GitHub profilinın hazırlanması', yt: 'RGOj5yH7evk', min: 38 },
        { title: 'Texniki müsahibə sualları və canlı kodlaşma', yt: 'RGOj5yH7evk', min: 82, type: 'live' },
        { title: 'Yekun bilik yoxlaması', yt: 'bMknfKXIFA8', min: 30, type: 'quiz' },
      ],
    },
  ]),
  ...buildLessons('c2', [
    {
      title: 'Modul 1 — Node.js təməlləri',
      lessons: [
        { title: 'Node.js mühiti, npm və modul sistemi', yt: 'Oe421EPjeBE', min: 52 },
        { title: 'Fayl sistemi, Buffer və stream-lər', yt: 'Oe421EPjeBE', min: 58 },
        { title: 'Event loop və asinxron əməliyyatlar', yt: 'Oe421EPjeBE', min: 46 },
      ],
    },
    {
      title: 'Modul 2 — Express ilə REST API',
      lessons: [
        { title: 'Express quraşdırması və routing', yt: 'Oe421EPjeBE', min: 55 },
        { title: 'Middleware, validasiya və xəta idarəsi', yt: 'Oe421EPjeBE', min: 62, type: 'live' },
        { title: 'REST prinsipləri və API dizaynı', yt: 'Oe421EPjeBE', min: 50 },
      ],
    },
    {
      title: 'Modul 3 — Verilənlər bazası',
      lessons: [
        { title: 'PostgreSQL ilə əlaqə və ORM seçimi', yt: 'HXV3zeQKqGY', min: 64 },
        { title: 'MongoDB və Mongoose modelləri', yt: 'HXV3zeQKqGY', min: 58 },
        { title: 'Miqrasiyalar və seed data', yt: 'HXV3zeQKqGY', min: 42 },
      ],
    },
    {
      title: 'Modul 4 — Təhlükəsizlik və autentifikasiya',
      lessons: [
        { title: 'JWT ilə autentifikasiya', yt: 'Oe421EPjeBE', min: 68 },
        { title: 'Rol əsaslı icazələr (RBAC)', yt: 'Oe421EPjeBE', min: 54 },
        { title: 'OWASP təhlükəsizlik tədbirləri', yt: 'inWWhr5tnEA', min: 60 },
      ],
    },
    {
      title: 'Modul 5 — Deployment və yekun layihə',
      lessons: [
        { title: 'Docker ilə tətbiqin konteynerləşdirilməsi', yt: 'pg19Z8LL06w', min: 56 },
        { title: 'Cloud-a deployment (Render/Vercel)', yt: 'pg19Z8LL06w', min: 44 },
        { title: 'Yekun layihə: Tam API servisi', yt: 'Oe421EPjeBE', min: 110, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c3', [
    {
      title: 'Modul 1 — Python və data mühiti',
      lessons: [
        { title: 'Python sintaksisi və data strukturları', yt: 'rfscVS0vtbw', min: 66 },
        { title: 'Jupyter Notebook və virtual mühitlər', yt: 'rfscVS0vtbw', min: 40 },
        { title: 'NumPy ilə vektor əməliyyatları', yt: 'rfscVS0vtbw', min: 52 },
      ],
    },
    {
      title: 'Modul 2 — Data analizi',
      lessons: [
        { title: 'Pandas: Series və DataFrame', yt: 'rfscVS0vtbw', min: 72 },
        { title: 'Data təmizləmə və çatışmayan dəyərlər', yt: 'rfscVS0vtbw', min: 58 },
        { title: 'Qruplaşdırma, birləşdirmə və pivot', yt: 'rfscVS0vtbw', min: 64, type: 'live' },
      ],
    },
    {
      title: 'Modul 3 — Vizuallaşdırma',
      lessons: [
        { title: 'Matplotlib və Seaborn ilə qrafiklər', yt: 'rfscVS0vtbw', min: 60 },
        { title: 'İnteraktiv dashboard (Plotly)', yt: 'rfscVS0vtbw', min: 48 },
      ],
    },
    {
      title: 'Modul 4 — Maşın öyrənməsi',
      lessons: [
        { title: 'Supervised learning anlayışı', yt: 'NWONeJKn6kc', min: 70 },
        { title: 'Regressiya modelləri', yt: 'NWONeJKn6kc', min: 74 },
        { title: 'Klassifikasiya: qərar ağacları və random forest', yt: 'NWONeJKn6kc', min: 78 },
        { title: 'Model qiymətləndirmə metrikləri', yt: 'NWONeJKn6kc', min: 56 },
      ],
    },
    {
      title: 'Modul 5 — Yekun layihə',
      lessons: [
        { title: 'Real dataset üzərində EDA', yt: 'NWONeJKn6kc', min: 88, type: 'project' },
        { title: 'Modelin qurulması və tənzimlənməsi', yt: 'NWONeJKn6kc', min: 92, type: 'project' },
        { title: 'Nəticələrin təqdimatı və hesabat', yt: 'NWONeJKn6kc', min: 50, type: 'live' },
      ],
    },
  ]),
  ...buildLessons('c4', [
    {
      title: 'Modul 1 — Dizayn düşüncəsi',
      lessons: [
        { title: 'UX nədir? Dizayn prosesinə ümumi baxış', yt: 'FTFaQWZBqQ8', min: 44 },
        { title: 'İstifadəçi tədqiqatı və persona', yt: 'FTFaQWZBqQ8', min: 56 },
        { title: 'İnformasiya arxitekturası və user flow', yt: 'FTFaQWZBqQ8', min: 50 },
      ],
    },
    {
      title: 'Modul 2 — Figma əsasları',
      lessons: [
        { title: 'Figma interfeysi və əsas alətlər', yt: 'FTFaQWZBqQ8', min: 58 },
        { title: 'Auto layout və constraints', yt: 'FTFaQWZBqQ8', min: 62 },
        { title: 'Komponentlər və variantlar', yt: 'FTFaQWZBqQ8', min: 66, type: 'live' },
      ],
    },
    {
      title: 'Modul 3 — Vizual dizayn',
      lessons: [
        { title: 'Rəng nəzəriyyəsi və tipografiya', yt: 'FTFaQWZBqQ8', min: 54 },
        { title: 'Spacing, grid və vizual iyerarxiya', yt: 'FTFaQWZBqQ8', min: 48 },
        { title: 'Mikrocavablar və animasiya prinsipləri', yt: 'FTFaQWZBqQ8', min: 52 },
      ],
    },
    {
      title: 'Modul 4 — Prototip və təqdimat',
      lessons: [
        { title: 'İnteraktiv prototip qurulması', yt: 'FTFaQWZBqQ8', min: 60 },
        { title: 'Design system və token-lər', yt: 'FTFaQWZBqQ8', min: 64 },
        { title: 'Developer handoff və yekun layihə', yt: 'FTFaQWZBqQ8', min: 72, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c5', [
    {
      title: 'Modul 1 — Təhlükəsizliyin əsasları',
      lessons: [
        { title: 'Kibertəhlükəsizlik landşaftı və CIA triadı', yt: 'inWWhr5tnEA', min: 50 },
        { title: 'Linux komanda sətri və sistem quruluşu', yt: 'inWWhr5tnEA', min: 64 },
        { title: 'Şəbəkə protokolları və TCP/IP', yt: 'inWWhr5tnEA', min: 58 },
      ],
    },
    {
      title: 'Modul 2 — Kəşfiyyat (Reconnaissance)',
      lessons: [
        { title: 'Passiv və aktiv kəşfiyyat', yt: 'inWWhr5tnEA', min: 54 },
        { title: 'Nmap ilə port skan etmə', yt: 'inWWhr5tnEA', min: 62, type: 'live' },
        { title: 'Wireshark ilə trafik analizi', yt: 'inWWhr5tnEA', min: 66 },
      ],
    },
    {
      title: 'Modul 3 — Zəifliklər və exploit',
      lessons: [
        { title: 'OWASP Top 10 üzrə veb zəifliklər', yt: 'inWWhr5tnEA', min: 72 },
        { title: 'Burp Suite ilə veb test', yt: 'inWWhr5tnEA', min: 78 },
        { title: 'Metasploit əsasları', yt: 'inWWhr5tnEA', min: 68 },
      ],
    },
    {
      title: 'Modul 4 — Müdafiə və hesabat',
      lessons: [
        { title: 'Hardening və şəbəkə müdafiəsi', yt: 'inWWhr5tnEA', min: 56 },
        { title: 'Log analizi və SIEM', yt: 'inWWhr5tnEA', min: 52 },
        { title: 'Penetration test hesabatı yazmaq', yt: 'inWWhr5tnEA', min: 60, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c6', [
    {
      title: 'Modul 1 — React Native əsasları',
      lessons: [
        { title: 'React Native və Expo mühiti', yt: '1ukSR1GRtMU', min: 48 },
        { title: 'Core komponentlər: View, Text, Image', yt: '1ukSR1GRtMU', min: 56 },
        { title: 'StyleSheet və responsiv layout', yt: '1ukSR1GRtMU', min: 52 },
      ],
    },
    {
      title: 'Modul 2 — Naviqasiya və state',
      lessons: [
        { title: 'React Navigation ilə ekranlar arası keçid', yt: '1ukSR1GRtMU', min: 62 },
        { title: 'AsyncStorage və yerli data', yt: '1ukSR1GRtMU', min: 46 },
        { title: 'Redux Toolkit mobil tətbiqdə', yt: '1ukSR1GRtMU', min: 58, type: 'live' },
      ],
    },
    {
      title: 'Modul 3 — Nativ imkanlar',
      lessons: [
        { title: 'Kamera və media kitabxanası', yt: '1ukSR1GRtMU', min: 54 },
        { title: 'Lokasiya və xəritə inteqrasiyası', yt: '1ukSR1GRtMU', min: 60 },
        { title: 'Push bildirişlər', yt: '1ukSR1GRtMU', min: 50 },
      ],
    },
    {
      title: 'Modul 4 — Yayım və optimizasiya',
      lessons: [
        { title: 'Performans və animasiyalar', yt: '1ukSR1GRtMU', min: 58 },
        { title: 'App Store & Google Play-ə yayım', yt: '1ukSR1GRtMU', min: 64, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c7', [
    {
      title: 'Modul 1 — DevOps mədəniyyəti və Linux',
      lessons: [
        { title: 'DevOps nədir? CI/CD anlayışı', yt: 'pg19Z8LL06w', min: 46 },
        { title: 'Linux server idarəsi və bash skriptləri', yt: 'pg19Z8LL06w', min: 62 },
        { title: 'SSH, sertifikatlar və təhlükəsiz giriş', yt: 'inWWhr5tnEA', min: 50 },
      ],
    },
    {
      title: 'Modul 2 — Docker',
      lessons: [
        { title: 'Konteyner nədir? Docker arxitekturası', yt: 'pg19Z8LL06w', min: 58 },
        { title: 'Dockerfile yazmaq və image optimizasiyası', yt: 'pg19Z8LL06w', min: 66 },
        { title: 'Docker Compose ilə çoxservisli mühit', yt: 'pg19Z8LL06w', min: 60, type: 'live' },
      ],
    },
    {
      title: 'Modul 3 — Kubernetes',
      lessons: [
        { title: 'Kubernetes arxitekturası və klaster', yt: 'pg19Z8LL06w', min: 70 },
        { title: 'Pod, Deployment, Service resursları', yt: 'pg19Z8LL06w', min: 76 },
        { title: 'Helm ilə paket idarəsi', yt: 'pg19Z8LL06w', min: 54 },
      ],
    },
    {
      title: 'Modul 4 — Avtomatlaşdırma və monitorinq',
      lessons: [
        { title: 'GitHub Actions ilə CI/CD pipeline', yt: 'RGOj5yH7evk', min: 68 },
        { title: 'Terraform ilə Infrastructure as Code', yt: 'pg19Z8LL06w', min: 72 },
        { title: 'Prometheus & Grafana ilə monitorinq', yt: 'pg19Z8LL06w', min: 64, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c8', [
    {
      title: 'Modul 1 — Verilənlər bazası əsasları',
      lessons: [
        { title: 'RDBMS anlayışı və cədvəl quruluşu', yt: 'HXV3zeQKqGY', min: 48 },
        { title: 'Data tipləri və PRIMARY KEY', yt: 'HXV3zeQKqGY', min: 44 },
        { title: 'PostgreSQL quraşdırması və psql', yt: 'HXV3zeQKqGY', min: 40 },
      ],
    },
    {
      title: 'Modul 2 — Sorğu yazmaq',
      lessons: [
        { title: 'SELECT, WHERE və ORDER BY', yt: 'HXV3zeQKqGY', min: 56 },
        { title: 'JOIN-lər: INNER, LEFT, RIGHT', yt: 'HXV3zeQKqGY', min: 68, type: 'live' },
        { title: 'GROUP BY və aqreqasiya funksiyaları', yt: 'HXV3zeQKqGY', min: 58 },
        { title: 'Alt-sorğular və CTE', yt: 'HXV3zeQKqGY', min: 62 },
      ],
    },
    {
      title: 'Modul 3 — Dizayn və optimizasiya',
      lessons: [
        { title: 'Normalizasiya və əlaqələr', yt: 'HXV3zeQKqGY', min: 54 },
        { title: 'İndekslər və sorğu performansı', yt: 'HXV3zeQKqGY', min: 60 },
        { title: 'Yekun layihə: Analitik hesabat', yt: 'HXV3zeQKqGY', min: 80, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c9', [
    {
      title: 'Modul 1 — Rəqəmsal marketinq strategiyası',
      lessons: [
        { title: 'Marketinq hunisi və auditoriya', yt: 'bMknfKXIFA8', min: 44 },
        { title: 'Brendin rəqəmsal mövqeyi', yt: 'bMknfKXIFA8', min: 42 },
        { title: 'Rəqiblərin analizi', yt: 'bMknfKXIFA8', min: 46 },
      ],
    },
    {
      title: 'Modul 2 — SEO',
      lessons: [
        { title: 'Açar söz tədqiqatı', yt: 'bMknfKXIFA8', min: 54 },
        { title: 'Texniki SEO audit', yt: 'bMknfKXIFA8', min: 60, type: 'live' },
        { title: 'Məzmun SEO və link quruculuğu', yt: 'bMknfKXIFA8', min: 52 },
      ],
    },
    {
      title: 'Modul 3 — Reklam və analitika',
      lessons: [
        { title: 'Google Ads kampaniyaları', yt: 'bMknfKXIFA8', min: 66 },
        { title: 'Meta Ads (Facebook/Instagram)', yt: 'bMknfKXIFA8', min: 64 },
        { title: 'GA4 ilə ölçmə və hesabatlıq', yt: 'bMknfKXIFA8', min: 58, type: 'project' },
      ],
    },
  ]),
  ...buildLessons('c10', [
    {
      title: 'Modul 1 — Test nəzəriyyəsi',
      lessons: [
        { title: 'Test növləri və SDLC-də rolu', yt: 'bMknfKXIFA8', min: 46 },
        { title: 'Test case və checklist dizaynı', yt: 'bMknfKXIFA8', min: 52 },
        { title: 'Bug report yazma mədəniyyəti', yt: 'bMknfKXIFA8', min: 40 },
      ],
    },
    {
      title: 'Modul 2 — API testləri',
      lessons: [
        { title: 'Postman ilə API testi', yt: 'HXV3zeQKqGY', min: 56 },
        { title: 'Avtomatlaşdırılmış API testləri', yt: 'Oe421EPjeBE', min: 60, type: 'live' },
      ],
    },
    {
      title: 'Modul 3 — E2E avtomatlaşdırma',
      lessons: [
        { title: 'Playwright quraşdırması və ilk test', yt: 'bMknfKXIFA8', min: 64 },
        { title: 'Selektorlar və Page Object Model', yt: 'bMknfKXIFA8', min: 70 },
        { title: 'Cypress ilə müqayisə və miqrasiya', yt: 'bMknfKXIFA8', min: 52 },
      ],
    },
    {
      title: 'Modul 4 — CI və hesabatlıq',
      lessons: [
        { title: 'Testlərin CI-a qoşulması', yt: 'RGOj5yH7evk', min: 58 },
        { title: 'Allure test hesabatları', yt: 'bMknfKXIFA8', min: 46 },
        { title: 'Yekun layihə: Tam test dəsti', yt: 'bMknfKXIFA8', min: 86, type: 'project' },
      ],
    },
  ]),
]

/* ------------------------------------------------------------------ */
/* Qəbul testi sual bankı                                             */
/* ------------------------------------------------------------------ */
const QUESTION_BANK: (QuizQuestion & { topic: string })[] = [
  {
    id: 'q1',
    topic: 'html',
    question: 'HTML-də səhifənin əsas strukturunu təyin edən element hansıdır?',
    options: ['<main>', '<body>', '<section>', '<div>'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    topic: 'css',
    question: 'CSS-də Flexbox konteynerini aktivləşdirən xassə hansıdır?',
    options: ['display: block', 'display: flex', 'position: flex', 'float: flex'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    topic: 'html',
    question: 'Aşağıdakılardan hansı semantik HTML elementi DEYİL?',
    options: ['<article>', '<nav>', '<span>', '<header>'],
    correctIndex: 2,
  },
  {
    id: 'q4',
    topic: 'js',
    question: 'JavaScript-də «===» operatoru nə edir?',
    options: [
      'Yalnız dəyəri müqayisə edir',
      'Dəyəri və tipi birlikdə müqayisə edir',
      'Dəyişən təyin edir',
      'Massiv yaradır',
    ],
    correctIndex: 1,
  },
  {
    id: 'q5',
    topic: 'js',
    question: '`const` ilə təyin edilmiş dəyişənlə bağlı hansı doğrudur?',
    options: [
      'Yenidən təyin edilə bilər',
      'Yenidən təyin edilə bilməz',
      'Yalnız rəqəm saxlaya bilər',
      'Global scope-da işləmir',
    ],
    correctIndex: 1,
  },
  {
    id: 'q6',
    topic: 'js',
    question: 'Massivdən hər elementi dəyişdirərək yeni massiv qaytaran metod hansıdır?',
    options: ['forEach', 'map', 'filter', 'find'],
    correctIndex: 1,
  },
  {
    id: 'q7',
    topic: 'react',
    question: 'React-də komponentə xaricdən verilən məlumat necə adlanır?',
    options: ['state', 'props', 'context', 'ref'],
    correctIndex: 1,
  },
  {
    id: 'q8',
    topic: 'react',
    question: 'Side effect-ləri idarə etmək üçün hansı hook istifadə olunur?',
    options: ['useState', 'useEffect', 'useRef', 'useMemo'],
    correctIndex: 1,
  },
  {
    id: 'q9',
    topic: 'react',
    question: 'Siyahı render edilərkən hər elementə verilməli xüsusi prop hansıdır?',
    options: ['id', 'name', 'key', 'index'],
    correctIndex: 2,
  },
  {
    id: 'q10',
    topic: 'python',
    question: 'Python-da cədvəl (DataFrame) ilə işləyən kitabxana hansıdır?',
    options: ['NumPy', 'Pandas', 'Matplotlib', 'Flask'],
    correctIndex: 1,
  },
  {
    id: 'q11',
    topic: 'python',
    question: 'Python-da funksiya necə təyin olunur?',
    options: ['function ad()', 'def ad():', 'fun ad()', 'void ad()'],
    correctIndex: 1,
  },
  {
    id: 'q12',
    topic: 'sql',
    question: 'SQL-də iki cədvəli birləşdirmək üçün hansı açar söz istifadə olunur?',
    options: ['MERGE', 'JOIN', 'LINK', 'COMBINE'],
    correctIndex: 1,
  },
  {
    id: 'q13',
    topic: 'sql',
    question: 'SQL-də qruplaşdırılmış nəticəni filtrləmək üçün hansı bənd istifadə olunur?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correctIndex: 1,
  },
  {
    id: 'q14',
    topic: 'security',
    question: 'OWASP Top 10 siyahısında 1-ci yerə hansı kateqoriya daxildir?',
    options: [
      'Broken Access Control',
      'Cross-Site Scripting',
      'SQL Injection',
      'Insecure Deserialization',
    ],
    correctIndex: 0,
  },
  {
    id: 'q15',
    topic: 'design',
    question: 'UX dizaynda «wireframe» nədir?',
    options: [
      'Yekun vizual dizayn',
      'Səhifənin struktur sxemi',
      'Rəng palitrası',
      'İstifadəçi sorğusu',
    ],
    correctIndex: 1,
  },
  {
    id: 'q16',
    topic: 'devops',
    question: 'Docker-də image qurmaq üçün hansı fayl istifadə olunur?',
    options: ['docker.yml', 'Dockerfile', 'compose.json', 'image.conf'],
    correctIndex: 1,
  },
  {
    id: 'q17',
    topic: 'mobile',
    question: 'React Native ilə hansı platformalar üçün tətbiq yazmaq olar?',
    options: ['Yalnız iOS', 'Yalnız Android', 'iOS və Android', 'Yalnız Web'],
    correctIndex: 2,
  },
  {
    id: 'q18',
    topic: 'qa',
    question: 'E2E test nəyi yoxlayır?',
    options: [
      'Yalnız bir funksiyanı',
      'Tətbiqin uçdan-uca istifadəçi axınını',
      'Verilənlər bazasını',
      'CSS-i',
    ],
    correctIndex: 1,
  },
  {
    id: 'q19',
    topic: 'marketing',
    question: 'SEO abbreviaturasının açılışı nədir?',
    options: [
      'Search Engine Optimization',
      'Social Engagement Online',
      'Site Error Optimization',
      'Search Email Outreach',
    ],
    correctIndex: 0,
  },
  {
    id: 'q20',
    topic: 'general',
    question: '«API» nə deməkdir?',
    options: [
      'Application Programming Interface',
      'Advanced Program Integration',
      'Applied Process Interface',
      'Automatic Program Input',
    ],
    correctIndex: 0,
  },
  {
    id: 'q21',
    topic: 'general',
    question: 'Git-də dəyişiklikləri lokal repoya qeyd etmək üçün hansı əmr istifadə olunur?',
    options: ['git push', 'git commit', 'git pull', 'git clone'],
    correctIndex: 1,
  },
  {
    id: 'q22',
    topic: 'general',
    question: 'Frontend və backend arasında məlumat mübadiləsi ən çox hansı formatda olur?',
    options: ['XML', 'JSON', 'CSV', 'YAML'],
    correctIndex: 1,
  },
  {
    id: 'q23',
    topic: 'logic',
    question: '2, 4, 8, 16, ... ardıcıllığının növbəti elementi hansıdır?',
    options: ['20', '24', '32', '64'],
    correctIndex: 2,
  },
  {
    id: 'q24',
    topic: 'logic',
    question: 'Alqoritmin mürəkkəbliyi O(n²) olduqda 100 element üçün təxminən neçə əməliyyat icra olunur?',
    options: ['100', '200', '1 000', '10 000'],
    correctIndex: 3,
  },
]

function makeQuiz(courseId: string, topics: string[]): CourseQuiz {
  const picked: QuizQuestion[] = []
  topics.forEach((topic) => {
    QUESTION_BANK.filter((q) => q.topic === topic)
      .slice(0, 2)
      .forEach((q) =>
        picked.push({
          id: `${courseId}-${q.id}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          topic: q.topic,
        }),
      )
  })
  QUESTION_BANK.filter((q) => q.topic === 'general' || q.topic === 'logic').forEach((q) => {
    if (picked.length < 6)
      picked.push({
        id: `${courseId}-${q.id}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        topic: q.topic,
      })
  })
  return { courseId, passScore: 60, questions: picked.slice(0, 6) }
}

export const seedQuizzes: CourseQuiz[] = [
  makeQuiz('c1', ['html', 'css', 'js', 'react']),
  makeQuiz('c2', ['js', 'sql']),
  makeQuiz('c3', ['python', 'sql']),
  makeQuiz('c4', ['design']),
  makeQuiz('c5', ['security']),
  makeQuiz('c6', ['mobile', 'react']),
  makeQuiz('c7', ['devops']),
  makeQuiz('c8', ['sql']),
  makeQuiz('c9', ['marketing']),
  makeQuiz('c10', ['qa', 'js']),
]

/* ------------------------------------------------------------------ */
/* Qeydiyyatlar                                                       */
/* ------------------------------------------------------------------ */
interface EnrollmentSeed {
  id: string
  studentId: string
  courseId: string
  packageTier: Enrollment['packageTier']
  mode: Enrollment['mode']
  campus?: string
  slot: Enrollment['slot']
  startDate: string
  days: number[]
  status: Enrollment['status']
  progress: number
  completed: number
  attendance: number
  grade: number | null
  amount: number
  createdAt: string
  quizScore: number
}

const ENROLLMENT_SEEDS: EnrollmentSeed[] = [
  { id: 'e1', studentId: 'u_s1', courseId: 'c1', packageTier: 'pro', mode: 'online', slot: 'axsam', startDate: '2026-09-15', days: [1, 3, 5], status: 'active', progress: 46, completed: 11, attendance: 94, grade: 88, amount: 809, createdAt: '2026-09-10', quizScore: 83 },
  { id: 'e2', studentId: 'u_s1', courseId: 'c8', packageTier: 'start', mode: 'online', slot: 'heftesonu', startDate: '2026-10-04', days: [6, 7], status: 'active', progress: 72, completed: 8, attendance: 88, grade: 91, amount: 399, createdAt: '2026-09-28', quizScore: 76 },
  { id: 'e3', studentId: 'u_s1', courseId: 'c7', packageTier: 'start', mode: 'online', slot: 'axsam', startDate: '2026-12-01', days: [2, 4], status: 'pending', progress: 0, completed: 0, attendance: 0, grade: null, amount: 799, createdAt: '2026-11-08', quizScore: 67 },
  { id: 'e4', studentId: 'u_s2', courseId: 'c3', packageTier: 'elite', mode: 'online', slot: 'gunorta', startDate: '2026-08-20', days: [1, 2, 3, 4], status: 'active', progress: 81, completed: 22, attendance: 97, grade: 95, amount: 1293, createdAt: '2026-08-14', quizScore: 92 },
  { id: 'e5', studentId: 'u_s2', courseId: 'c8', packageTier: 'pro', mode: 'online', slot: 'heftesonu', startDate: '2026-09-06', days: [6, 7], status: 'completed', progress: 100, completed: 10, attendance: 100, grade: 98, amount: 539, createdAt: '2026-09-01', quizScore: 90 },
  { id: 'e6', studentId: 'u_s3', courseId: 'c2', packageTier: 'pro', mode: 'hybrid', campus: 'Bakı — Nizami filialı', slot: 'axsam', startDate: '2026-09-22', days: [1, 3, 5], status: 'active', progress: 58, completed: 9, attendance: 91, grade: 84, amount: 876, createdAt: '2026-09-16', quizScore: 72 },
  { id: 'e7', studentId: 'u_s4', courseId: 'c4', packageTier: 'elite', mode: 'offline', campus: 'Bakı — Yasamal filialı', slot: 'gunorta', startDate: '2026-07-14', days: [2, 4], status: 'completed', progress: 100, completed: 12, attendance: 96, grade: 97, amount: 923, createdAt: '2026-07-06', quizScore: 89 },
  { id: 'e8', studentId: 'u_s4', courseId: 'c1', packageTier: 'start', mode: 'online', slot: 'seher', startDate: '2026-10-13', days: [1, 3], status: 'active', progress: 34, completed: 8, attendance: 89, grade: 82, amount: 599, createdAt: '2026-10-05', quizScore: 64 },
  { id: 'e9', studentId: 'u_s5', courseId: 'c5', packageTier: 'pro', mode: 'hybrid', campus: 'Bakı — Nizami filialı', slot: 'axsam', startDate: '2026-11-03', days: [2, 4, 6], status: 'active', progress: 21, completed: 4, attendance: 85, grade: 79, amount: 1011, createdAt: '2026-10-26', quizScore: 71 },
  { id: 'e10', studentId: 'u_s6', courseId: 'c6', packageTier: 'start', mode: 'online', slot: 'heftesonu', startDate: '2026-08-09', days: [6, 7], status: 'active', progress: 63, completed: 9, attendance: 92, grade: 86, amount: 629, createdAt: '2026-08-02', quizScore: 74 },
  { id: 'e11', studentId: 'u_s7', courseId: 'c7', packageTier: 'elite', mode: 'online', slot: 'axsam', startDate: '2026-06-16', days: [1, 2, 4], status: 'completed', progress: 100, completed: 12, attendance: 98, grade: 96, amount: 1478, createdAt: '2026-06-08', quizScore: 95 },
  { id: 'e12', studentId: 'u_s8', courseId: 'c9', packageTier: 'start', mode: 'offline', campus: 'Bakı — Yasamal filialı', slot: 'seher', startDate: '2026-10-20', days: [2, 4], status: 'active', progress: 40, completed: 5, attendance: 87, grade: 81, amount: 349, createdAt: '2026-10-15', quizScore: 62 },
  { id: 'e13', studentId: 'u_s9', courseId: 'c10', packageTier: 'pro', mode: 'hybrid', campus: 'Bakı — Nizami filialı', slot: 'gunorta', startDate: '2026-09-29', days: [1, 3, 5], status: 'active', progress: 52, completed: 8, attendance: 93, grade: 87, amount: 741, createdAt: '2026-09-22', quizScore: 80 },
  { id: 'e14', studentId: 'u_s10', courseId: 'c2', packageTier: 'elite', mode: 'online', slot: 'axsam', startDate: '2026-09-08', days: [1, 3, 5], status: 'active', progress: 68, completed: 14, attendance: 95, grade: 90, amount: 1201, createdAt: '2026-09-02', quizScore: 88 },
  { id: 'e15', studentId: 'u_s10', courseId: 'c1', packageTier: 'pro', mode: 'online', slot: 'gunorta', startDate: '2026-10-06', days: [2, 4], status: 'active', progress: 37, completed: 9, attendance: 90, grade: 85, amount: 809, createdAt: '2026-09-30', quizScore: 78 },
  { id: 'e16', studentId: 'u_s11', courseId: 'c8', packageTier: 'start', mode: 'online', slot: 'seher', startDate: '2026-11-11', days: [2, 4], status: 'active', progress: 25, completed: 3, attendance: 82, grade: 78, amount: 399, createdAt: '2026-11-04', quizScore: 69 },
  { id: 'e17', studentId: 'u_s12', courseId: 'c1', packageTier: 'start', mode: 'online', slot: 'heftesonu', startDate: '2026-11-15', days: [6, 7], status: 'cancelled', progress: 5, completed: 1, attendance: 40, grade: null, amount: 599, createdAt: '2026-11-02', quizScore: 45 },
  { id: 'e18', studentId: 'u_s5', courseId: 'c2', packageTier: 'start', mode: 'online', slot: 'heftesonu', startDate: '2026-12-06', days: [6, 7], status: 'pending', progress: 0, completed: 0, attendance: 0, grade: null, amount: 649, createdAt: '2026-11-19', quizScore: 58 },
]

export const seedEnrollments: Enrollment[] = ENROLLMENT_SEEDS.map((e) => {
  const lessons = seedLessons.filter((l) => l.courseId === e.courseId)
  return {
    id: e.id,
    studentId: e.studentId,
    courseId: e.courseId,
    packageTier: e.packageTier,
    mode: e.mode,
    campus: e.campus,
    slot: e.slot,
    startDate: e.startDate,
    days: e.days,
    status: e.status,
    progress: e.progress,
    completedLessonIds: lessons.slice(0, e.completed).map((l) => l.id),
    attendance: e.attendance,
    grade: e.grade,
    amount: e.amount,
    createdAt: e.createdAt,
    quizScore: e.quizScore,
  }
})

/* ------------------------------------------------------------------ */
/* Ödənişlər                                                          */
/* ------------------------------------------------------------------ */
const PAYMENT_SEEDS: {
  id: string
  enrollmentId: string
  status: Payment['status']
  holder: string
  last4: string
  brand: string
  method: Payment['method']
  date: string
  failReason?: string
}[] = [
  { id: 'p1', enrollmentId: 'e1', status: 'paid', holder: 'ORXAN NABIYEV', last4: '4242', brand: 'Visa', method: 'card', date: '2026-09-10' },
  { id: 'p2', enrollmentId: 'e2', status: 'paid', holder: 'ORXAN NABIYEV', last4: '4444', brand: 'Mastercard', method: 'card', date: '2026-09-28' },
  { id: 'p3', enrollmentId: 'e3', status: 'pending', holder: 'ORXAN NABIYEV', last4: '4242', brand: 'Visa', method: 'installment', date: '2026-11-08' },
  { id: 'p4', enrollmentId: 'e4', status: 'paid', holder: 'AYAN HAJIYEVA', last4: '1111', brand: 'Visa', method: 'card', date: '2026-08-14' },
  { id: 'p5', enrollmentId: 'e5', status: 'paid', holder: 'AYAN HAJIYEVA', last4: '1111', brand: 'Visa', method: 'card', date: '2026-09-01' },
  { id: 'p6', enrollmentId: 'e6', status: 'paid', holder: 'MURAD AHMADOV', last4: '4242', brand: 'Visa', method: 'installment', date: '2026-09-16' },
  { id: 'p7', enrollmentId: 'e7', status: 'paid', holder: 'ZEYNAB KARIMLI', last4: '4444', brand: 'Mastercard', method: 'card', date: '2026-07-06' },
  { id: 'p8', enrollmentId: 'e8', status: 'paid', holder: 'ZEYNAB KARIMLI', last4: '4242', brand: 'Visa', method: 'card', date: '2026-10-05' },
  { id: 'p9', enrollmentId: 'e9', status: 'paid', holder: 'RUFAT SOLTANOV', last4: '1111', brand: 'Visa', method: 'card', date: '2026-10-26' },
  { id: 'p10', enrollmentId: 'e10', status: 'paid', holder: 'GULNAR ABDULLAYEVA', last4: '4242', brand: 'Visa', method: 'card', date: '2026-08-02' },
  { id: 'p11', enrollmentId: 'e11', status: 'paid', holder: 'CAVID MALIKOV', last4: '4444', brand: 'Mastercard', method: 'installment', date: '2026-06-08' },
  { id: 'p12', enrollmentId: 'e12', status: 'paid', holder: 'LAMAN VALIYEVA', last4: '4242', brand: 'Visa', method: 'card', date: '2026-10-15' },
  { id: 'p13', enrollmentId: 'e13', status: 'paid', holder: 'FARID BABAYEV', last4: '1111', brand: 'Visa', method: 'card', date: '2026-09-22' },
  { id: 'p14', enrollmentId: 'e14', status: 'paid', holder: 'SABINA ISMAYILZADA', last4: '4242', brand: 'Visa', method: 'installment', date: '2026-09-02' },
  { id: 'p15', enrollmentId: 'e15', status: 'paid', holder: 'SABINA ISMAYILZADA', last4: '4444', brand: 'Mastercard', method: 'card', date: '2026-09-30' },
  { id: 'p16', enrollmentId: 'e16', status: 'paid', holder: 'TURAN ALIYEVA', last4: '4242', brand: 'Visa', method: 'card', date: '2026-11-04' },
  { id: 'p17', enrollmentId: 'e17', status: 'failed', holder: 'KAMRAN ZEYNALOV', last4: '0002', brand: 'Visa', method: 'card', date: '2026-11-02', failReason: 'Bank tərəfindən rədd edildi (insufficient funds)' },
  { id: 'p18', enrollmentId: 'e18', status: 'pending', holder: 'RUFAT SOLTANOV', last4: '4242', brand: 'Visa', method: 'installment', date: '2026-11-19' },
]

export const seedPayments: Payment[] = PAYMENT_SEEDS.map((p, i) => {
  const enrollment = seedEnrollments.find((e) => e.id === p.enrollmentId)
  return {
    id: p.id,
    enrollmentId: p.enrollmentId,
    studentId: enrollment?.studentId ?? 'u_s1',
    courseId: enrollment?.courseId ?? 'c1',
    amount: enrollment?.amount ?? 0,
    status: p.status,
    cardHolder: p.holder,
    cardLast4: p.last4,
    brand: p.brand,
    method: p.method,
    invoiceNo: `CV-2026-${String(1040 + i)}`,
    date: p.date,
    failReason: p.failReason,
  }
})

/* ------------------------------------------------------------------ */
/* Bildirişlər                                                        */
/* ------------------------------------------------------------------ */
export const seedNotifications: Notification[] = [
  { id: 'n1', userId: 'u_s1', title: 'Yeni dərs əlavə edildi', body: '«Redux Toolkit ilə state idarəsi» dərsi artıq əlçatandır.', type: 'info', read: false, date: '2026-11-19T09:12:00' },
  { id: 'n2', userId: 'u_s1', title: 'Ev tapşırığı qiymətləndirildi', body: 'Modul 3 praktik tapşırığı üzrə 92 bal aldınız.', type: 'grade', read: false, date: '2026-11-18T16:40:00' },
  { id: 'n3', userId: 'u_s1', title: 'Ödəniş uğurlu', body: 'SQL kursu üzrə ödənişiniz təsdiqləndi.', type: 'success', read: true, date: '2026-09-28T11:05:00' },
  { id: 'n4', userId: 'u_s1', title: 'Davamiyyət xəbərdarlığı', body: 'Son 2 dərsdə iştirak etməmisiniz.', type: 'warning', read: true, date: '2026-11-12T08:30:00' },
  { id: 'n5', userId: 'u_t1', title: 'Yeni tələbə qeydiyyatı', body: 'Zeynəb Kərimli kursunuza qoşuldu.', type: 'info', read: false, date: '2026-10-05T13:20:00' },
  { id: 'n6', userId: 'u_admin', title: 'Gözləyən ödəniş', body: '2 ödəniş təsdiq gözləyir.', type: 'warning', read: false, date: '2026-11-19T10:00:00' },
]

/* ------------------------------------------------------------------ */
/* Test hesablar                                                      */
/* ------------------------------------------------------------------ */
export const SAMPLE_ACCOUNTS: SampleAccount[] = [
  {
    role: 'student',
    label: 'Tələbə paneli',
    email: 'student@codevia.az',
    password: 'student123',
    name: 'Orxan Nəbiyev',
    description: 'Kurslarım, video dərslər, silabus, cədvəl və ödənişlər',
    accent: 'accent',
  },
  {
    role: 'teacher',
    label: 'Müəllim paneli',
    email: 'teacher@codevia.az',
    password: 'teacher123',
    name: 'Kamran Əliyev',
    description: 'Dərslərin, silabusun və tələbələrin idarəsi',
    accent: 'brand',
  },
  {
    role: 'admin',
    label: 'Admin paneli',
    email: 'admin@codevia.az',
    password: 'admin123',
    name: 'Elmar Süleymanov',
    description: 'Bütün platformaya tam nəzarət və analitika',
    accent: 'neon',
  },
]
