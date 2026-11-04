/**
 * Internal app mock dataset.
 * "Today" is fixed so schedules and relative dates stay coherent during development.
 */
export const TODAY = "2026-03-10"

export type UserRole = "HR" | "Interviewer"
export type StageType = "screening" | "test" | "interview" | "offering"

export interface Stage {
  id: string
  name: string
  type: StageType
  durationDays: number
  ownerId: string
}

export type RecruitmentStatus = "draft" | "running" | "completed" | "closed"

export interface Recruitment {
  id: string
  /** Human-readable code, e.g. REC-001 */
  code: string
  name: string
  division: string
  location: string
  quota: number
  openDate: string
  closeDate: string
  status: RecruitmentStatus
  /** Index of the running stage. -1 when draft, stages.length when finished. */
  currentStage: number
  ownerId: string
  description: string
  stages: Stage[]
}

export type CandidateStatus =
  | "in_progress"
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  recruitmentId: string
  stageIndex: number
  status: CandidateStatus
  testScore: number | null
  appliedAt: string
  education: string
  experienceYears: number
}

export interface Interview {
  id: string
  candidateId: string
  recruitmentId: string
  stageIndex: number
  date: string
  start: string
  end: string
  interviewerIds: string[]
  mode: "Online" | "Onsite"
  location: string
}

export type Recommendation = "proceed" | "uncertain" | "reject"

export interface Evaluation {
  interviewId: string
  interviewerId: string
  scores: Record<string, number>
  recommendation: Recommendation | null
  notes: string
  status: "draft" | "submitted"
  updatedAt: string
}

export interface Offering {
  id: string
  candidateId: string
  salary: number
  startDate: string
  status: "draft" | "sent" | "accepted" | "declined"
  sentAt: string | null
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  title: string
  active: boolean
  lastActive: string
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users: User[] = [
  { id: "u1", name: "Fajar Mahendra", email: "fajar.mahendra@metrodata.co.id", role: "HR", title: "Talent Acquisition Specialist", active: true, lastActive: "2026-03-10" },
  { id: "u2", name: "Rina Kusumawati", email: "rina.kusumawati@metrodata.co.id", role: "Interviewer", title: "Engineering Manager", active: true, lastActive: "2026-03-09" },
  { id: "u3", name: "Bambang Sutrisno", email: "bambang.sutrisno@metrodata.co.id", role: "Interviewer", title: "Lead .NET Developer", active: true, lastActive: "2026-03-06" },
  { id: "u4", name: "Dewi Lestari", email: "dewi.lestari@metrodata.co.id", role: "HR", title: "HR Business Partner", active: true, lastActive: "2026-03-10" },
  { id: "u5", name: "Agus Pratama", email: "agus.pratama@metrodata.co.id", role: "Interviewer", title: "Infrastructure Lead", active: true, lastActive: "2026-03-04" },
  { id: "u6", name: "Sri Wahyuni", email: "sri.wahyuni@metrodata.co.id", role: "Interviewer", title: "Business Intelligence Lead", active: true, lastActive: "2026-02-27" },
  { id: "u7", name: "Yohanes Siregar", email: "yohanes.siregar@metrodata.co.id", role: "Interviewer", title: "Senior QA Engineer", active: false, lastActive: "2025-11-28" },
]

export const CURRENT_USER: Record<UserRole, string> = { HR: "u1", Interviewer: "u2" }

// ---------------------------------------------------------------------------
// Recruitments
// ---------------------------------------------------------------------------
const st = (id: string, name: string, type: StageType, durationDays: number, ownerId: string): Stage =>
  ({ id, name, type, durationDays, ownerId })

export const recruitments: Recruitment[] = [
  {
    id: "r1", code: "REC-001",
    name: "Backend Developer 2026",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 3,
    openDate: "2026-01-12", closeDate: "2026-03-31",
    status: "running", currentStage: 2, ownerId: "u1",
    description: "Develop and maintain .NET 8 backend services for banking client integration projects.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u1"),
      st("s2", "Logic Test", "test", 5, "u1"),
      st("s3", "HR Interview", "interview", 10, "u4"),
      st("s4", "User Interview", "interview", 10, "u2"),
      st("s5", "Offering", "offering", 7, "u1"),
    ],
  },
  {
    id: "r2", code: "REC-002",
    name: "Data Analyst Batch Q1 2026",
    division: "Business Intelligence",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-02-02", closeDate: "2026-04-15",
    status: "running", currentStage: 1, ownerId: "u4",
    description: "Build operational dashboards and sales analysis for distribution units.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u4"),
      st("s2", "Logic Test", "test", 5, "u4"),
      st("s3", "Case Study", "test", 7, "u6"),
      st("s4", "User Interview", "interview", 10, "u6"),
      st("s5", "Offering", "offering", 7, "u4"),
    ],
  },
  {
    id: "r3", code: "REC-003",
    name: "Network Engineer 2026",
    division: "Infrastructure Services",
    location: "Surabaya",
    quota: 2,
    openDate: "2025-12-01", closeDate: "2026-02-28",
    status: "running", currentStage: 4, ownerId: "u1",
    description: "Design, install, and monitor campus and data center networks in East Java.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u1"),
      st("s2", "Technical Test", "test", 5, "u5"),
      st("s3", "HR Interview", "interview", 10, "u4"),
      st("s4", "User Interview", "interview", 10, "u5"),
      st("s5", "Offering", "offering", 7, "u1"),
    ],
  },
  {
    id: "r4", code: "REC-004",
    name: "Frontend Developer 2026",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-03-23", closeDate: "2026-05-29",
    status: "draft", currentStage: -1, ownerId: "u1",
    description: "Build internal application UIs and customer portals with React and TypeScript.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u1"),
      st("s2", "Logic Test", "test", 5, "u1"),
      st("s3", "User Interview", "interview", 10, "u2"),
      st("s4", "Offering", "offering", 7, "u1"),
    ],
  },
  {
    id: "r5", code: "REC-005",
    name: "QA Engineer 2025",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2025-09-01", closeDate: "2025-11-28",
    status: "completed", currentStage: 4, ownerId: "u4",
    description: "Design manual and automated test scenarios for web and mobile applications.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u4"),
      st("s2", "Logic Test", "test", 5, "u4"),
      st("s3", "User Interview", "interview", 10, "u7"),
      st("s4", "Offering", "offering", 7, "u4"),
    ],
  },
]

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------
type Row = [
  name: string, rec: string, stage: number,
  status: CandidateStatus, score: number | null,
  source: string, applied: string, edu: string, exp: number,
]

const rows: Row[] = [
  // r1 Backend Developer 2026 (running: HR Interview)
  ["Andi Saputra", "r1", 2, "pending", 86, "LinkedIn", "2026-01-14", "S1 Computer Science, Universitas Indonesia", 3],
  ["Siti Rahmawati", "r1", 2, "in_progress", 82, "Jobstreet", "2026-01-15", "S1 Information Systems, Universitas Bina Nusantara", 2],
  ["Budi Hartono", "r1", 2, "in_progress", 79, "Referral", "2026-01-18", "S1 Computer Science, Universitas Gadjah Mada", 4],
  ["Putri Anggraini", "r1", 2, "in_progress", 88, "LinkedIn", "2026-01-20", "S1 Computer Engineering, Institut Teknologi Bandung", 2],
  ["Rizky Firmansyah", "r1", 2, "in_progress", 75, "Campus", "2026-01-21", "S1 Computer Engineering, Universitas Brawijaya", 1],
  ["Nur Aisyah", "r1", 2, "in_progress", 81, "Jobstreet", "2026-01-22", "S1 Computer Engineering, Telkom University", 3],
  ["Dimas Prakoso", "r1", 1, "in_progress", null, "Jobstreet", "2026-02-02", "S1 Computer Engineering, Universitas Diponegoro", 2],
  ["Ayu Wulandari", "r1", 1, "in_progress", null, "LinkedIn", "2026-02-03", "S1 Information Systems, Universitas Airlangga", 1],
  ["Hendra Gunawan", "r1", 1, "in_progress", null, "Referral", "2026-02-05", "S1 Computer Engineering, Universitas Trisakti", 5],
  ["Maya Sari", "r1", 1, "in_progress", null, "Campus", "2026-02-06", "S1 Computer Science, Universitas Padjadjaran", 0],
  ["Fikri Ramadhan", "r1", 1, "in_progress", null, "Jobstreet", "2026-02-09", "D4 Computer Engineering, Politeknik Negeri Jakarta", 2],
  ["Indah Permatasari", "r1", 0, "in_progress", null, "LinkedIn", "2026-03-02", "S1 Computer Engineering, Universitas Sebelas Maret", 3],
  ["Yoga Pratama", "r1", 0, "in_progress", null, "Jobstreet", "2026-03-04", "S1 Information Systems, Universitas Gunadarma", 1],
  ["Larasati Dewanti", "r1", 0, "in_progress", null, "Campus", "2026-03-05", "S1 Computer Engineering, Universitas Pelita Harapan", 0],
  ["Arif Hidayat", "r1", 0, "in_progress", null, "LinkedIn", "2026-03-06", "S1 Computer Science, IPB University", 6],
  ["Citra Kirana", "r1", 1, "rejected", 54, "Jobstreet", "2026-01-25", "S1 Computer Engineering, Universitas Mercu Buana", 1],
  ["Bayu Nugroho", "r1", 0, "rejected", null, "Jobstreet", "2026-01-28", "D3 Informatics, Universitas Gunadarma", 0],
  ["Fitri Handayani", "r1", 1, "withdrawn", 70, "LinkedIn", "2026-01-29", "S1 Computer Engineering, Telkom University", 2],
  // r2 Data Analyst Batch Q1 2026 (running: Logic Test)
  ["Galih Santoso", "r2", 1, "in_progress", null, "LinkedIn", "2026-02-04", "S1 Statistics, Institut Teknologi Sepuluh Nopember", 2],
  ["Nadia Safitri", "r2", 1, "in_progress", null, "Campus", "2026-02-05", "S1 Mathematics, Universitas Indonesia", 0],
  ["Reza Maulana", "r2", 1, "in_progress", null, "Jobstreet", "2026-02-06", "S1 Information Systems, Universitas Bina Nusantara", 3],
  ["Wulan Purnama", "r2", 1, "in_progress", null, "Referral", "2026-02-10", "S1 Statistics, Universitas Padjadjaran", 1],
  ["Teguh Setiawan", "r2", 0, "in_progress", null, "Jobstreet", "2026-02-24", "S1 Industrial Engineering, Universitas Diponegoro", 2],
  ["Anisa Febriani", "r2", 0, "in_progress", null, "LinkedIn", "2026-02-26", "S1 Actuarial Science, Universitas Gadjah Mada", 1],
  ["Ilham Akbar", "r2", 0, "in_progress", null, "Campus", "2026-03-02", "S1 Computer Science, Universitas Hasanuddin", 0],
  ["Dian Puspita", "r2", 0, "in_progress", null, "Jobstreet", "2026-03-03", "S1 Mathematics, Universitas Airlangga", 2],
  ["Kevin Tanoto", "r2", 0, "in_progress", null, "LinkedIn", "2026-03-06", "S1 Information Systems, Universitas Tarumanagara", 4],
  ["Melati Suryani", "r2", 0, "rejected", null, "Jobstreet", "2026-02-07", "S1 Accounting, Universitas Pancasila", 1],
  // r3 Network Engineer 2026 (running: Offering)
  ["Rafi Alfarizi", "r3", 4, "in_progress", 91, "Referral", "2025-12-03", "S1 Electrical Engineering, Institut Teknologi Sepuluh Nopember", 4],
  ["Sekar Ayuningtyas", "r3", 3, "pending", 84, "LinkedIn", "2025-12-05", "S1 Telecommunication Engineering, Telkom University", 3],
  ["Hafiz Kurniawan", "r3", 3, "pending", 80, "Jobstreet", "2025-12-08", "D4 Computer Engineering, Politeknik Elektronika Negeri Surabaya", 2],
  ["Tiara Oktaviani", "r3", 2, "rejected", 77, "Jobstreet", "2025-12-10", "S1 Electrical Engineering, Universitas Brawijaya", 1],
  ["Eko Wibowo", "r3", 1, "rejected", 58, "Campus", "2025-12-12", "S1 Computer Engineering, Universitas Jember", 0],
  // r5 QA Engineer 2025 (finished)
  ["Rani Marlina", "r5", 3, "accepted", 85, "LinkedIn", "2025-09-03", "S1 Information Systems, Universitas Bina Nusantara", 3],
  ["Joko Susilo", "r5", 3, "accepted", 83, "Referral", "2025-09-04", "S1 Computer Engineering, Universitas Gunadarma", 2],
  ["Vina Amelia", "r5", 2, "rejected", 78, "Jobstreet", "2025-09-08", "S1 Computer Engineering, Universitas Trisakti", 1],
  ["Aditya Wardhana", "r5", 1, "rejected", 61, "Jobstreet", "2025-09-10", "D3 Informatics, Politeknik Negeri Bandung", 0],
]

export const candidates: Candidate[] = rows.map(
  ([name, rec, stage, status, score, _source, applied, edu, exp], i) => {
    const [first, ...rest] = name.toLowerCase().split(" ")
    return {
      id: `c${i + 1}`,
      name,
      email: `${first}.${rest.join("")}@gmail.com`,
      phone: `+62 812-${3100 + i * 37}-${String(2000 + i * 113).slice(0, 4)}`,
      recruitmentId: rec,
      stageIndex: stage,
      status,
      testScore: score,
      appliedAt: applied,
      education: edu,
      experienceYears: exp,
    }
  }
)

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------
export const interviews: Interview[] = [
  { id: "i1", candidateId: "c1", recruitmentId: "r1", stageIndex: 2, date: "2026-03-05", start: "10.00", end: "11.00", interviewerIds: ["u4"], mode: "Onsite", location: "APL Tower lt. 37, Meeting Room 2" },
  { id: "i2", candidateId: "c2", recruitmentId: "r1", stageIndex: 2, date: "2026-03-06", start: "13.00", end: "14.00", interviewerIds: ["u2"], mode: "Online", location: "Microsoft Teams" },
  { id: "i3", candidateId: "c3", recruitmentId: "r1", stageIndex: 2, date: "2026-03-09", start: "09.00", end: "10.00", interviewerIds: ["u2", "u4"], mode: "Onsite", location: "APL Tower lt. 37, Meeting Room 1" },
  { id: "i4", candidateId: "c4", recruitmentId: "r1", stageIndex: 2, date: "2026-03-11", start: "10.00", end: "11.00", interviewerIds: ["u2"], mode: "Online", location: "Microsoft Teams" },
  { id: "i5", candidateId: "c5", recruitmentId: "r1", stageIndex: 2, date: "2026-03-12", start: "14.00", end: "15.00", interviewerIds: [], mode: "Onsite", location: "APL Tower lt. 37, Meeting Room 2" },
  { id: "i6", candidateId: "c6", recruitmentId: "r1", stageIndex: 2, date: "2026-03-13", start: "09.00", end: "10.00", interviewerIds: ["u3"], mode: "Online", location: "Microsoft Teams" },
  { id: "i7", candidateId: "c29", recruitmentId: "r3", stageIndex: 3, date: "2026-03-03", start: "10.00", end: "11.30", interviewerIds: ["u5"], mode: "Onsite", location: "Surabaya Office, Technical Room" },
  { id: "i8", candidateId: "c30", recruitmentId: "r3", stageIndex: 3, date: "2026-03-04", start: "13.00", end: "14.30", interviewerIds: ["u5"], mode: "Online", location: "Microsoft Teams" },
  { id: "i9", candidateId: "c29", recruitmentId: "r3", stageIndex: 3, date: "2026-02-24", start: "09.00", end: "10.30", interviewerIds: ["u5", "u2"], mode: "Onsite", location: "Surabaya Office, Technical Room" },
]

const sc = (technical: number, communication: number, problem: number, culture: number) =>
  ({ technical, communication, problem, culture })

export const evaluations: Evaluation[] = [
  { interviewId: "i1", interviewerId: "u4", scores: sc(4, 4, 4, 5), recommendation: "proceed", notes: "Communicative, solid understanding of REST and database transactions. Ready for user interview.", status: "submitted", updatedAt: "2026-03-05" },
  { interviewId: "i3", interviewerId: "u4", scores: sc(3, 4, 3, 4), recommendation: "uncertain", notes: "Relevant experience but lacked depth on automated testing.", status: "submitted", updatedAt: "2026-03-09" },
  { interviewId: "i3", interviewerId: "u2", scores: sc(3, 0, 0, 0), recommendation: null, notes: "Good understanding of dependency injection.", status: "draft", updatedAt: "2026-03-09" },
  { interviewId: "i7", interviewerId: "u5", scores: sc(4, 4, 5, 4), recommendation: "proceed", notes: "Strong VLAN configuration and OSPF troubleshooting.", status: "submitted", updatedAt: "2026-03-03" },
  { interviewId: "i8", interviewerId: "u5", scores: sc(4, 3, 4, 4), recommendation: "proceed", notes: "Strong hands-on skills, needs guidance on documentation.", status: "submitted", updatedAt: "2026-03-04" },
  { interviewId: "i9", interviewerId: "u5", scores: sc(5, 4, 5, 4), recommendation: "proceed", notes: "Strongest candidate in this batch.", status: "submitted", updatedAt: "2026-02-24" },
  { interviewId: "i9", interviewerId: "u2", scores: sc(4, 5, 4, 5), recommendation: "proceed", notes: "Great cultural fit, highly proactive.", status: "submitted", updatedAt: "2026-02-25" },
]

export const offerings: Offering[] = [
  { id: "o1", candidateId: "c29", salary: 14_500_000, startDate: "2026-04-06", status: "draft", sentAt: null },
  { id: "o2", candidateId: "c34", salary: 11_000_000, startDate: "2025-12-15", status: "accepted", sentAt: "2025-11-20" },
  { id: "o3", candidateId: "c35", salary: 10_500_000, startDate: "2025-12-15", status: "accepted", sentAt: "2025-11-21" },
]

export const CRITERIA = [
  { key: "technical", label: "Technical Skills", help: "Proficiency in technologies and concepts relevant to the position" },
  { key: "communication", label: "Communication", help: "Clarity in explaining ideas and answering questions" },
  { key: "problem", label: "Problem Solving", help: "Ability to analyze cases and build solutions" },
  { key: "culture", label: "Culture Fit", help: "Collaboration, initiative, and professional attitude" },
] as const

export const STAGE_TYPES: Record<StageType, string> = {
  screening: "Document Screening",
  test: "Online Test",
  interview: "Interview",
  offering: "Offering",
}

