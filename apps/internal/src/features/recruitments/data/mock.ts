import type { Tone } from "@/shared/components"
import type {
  Department,
  StageTypeEntity,
  Employee,
  BatchApplication,
  Recruitment,
  Stage,
  LegacyStageType,
} from "../types"
import { candidates } from "@/data/mock"

// =====================================================================
// 1. Department Table (ERD.sql)
// =====================================================================
export const mockDepartments: Department[] = [
  {
    id: "d1000000-0000-4000-8000-000000000001",
    parentDepartmentId: null,
    code: "IT",
    name: "Information Technology",
    description: "Corporate information technology, enterprise architecture, and shared IT services.",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "d1000000-0000-4000-8000-000000000002",
    parentDepartmentId: "d1000000-0000-4000-8000-000000000001",
    code: "SD",
    name: "Software Development",
    description: "Enterprise application engineering, frontend/backend architecture, and digital solutions.",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "d1000000-0000-4000-8000-000000000003",
    parentDepartmentId: "d1000000-0000-4000-8000-000000000001",
    code: "BI",
    name: "Business Intelligence",
    description: "Enterprise data pipelines, business intelligence, data science, and reporting dashboards.",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "d1000000-0000-4000-8000-000000000004",
    parentDepartmentId: "d1000000-0000-4000-8000-000000000001",
    code: "IS",
    name: "Infrastructure Services",
    description: "Cloud infrastructure, data center operations, network engineering, and cybersecurity.",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "d1000000-0000-4000-8000-000000000005",
    parentDepartmentId: null,
    code: "HR",
    name: "Human Resources",
    description: "Human capital management, employee development, and talent acquisition.",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
]

// =====================================================================
// 2. StageType Table (ERD.sql)
// =====================================================================
export const mockStageTypes: StageTypeEntity[] = [
  {
    id: "st-10000000-0000-4000-8000-000000000001",
    name: "Document Screening",
    description: "Initial verification of candidate CV, academic records, and administrative criteria.",
    stageCategory: "Screening",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "st-10000000-0000-4000-8000-000000000002",
    name: "Logic & Technical Test",
    description: "Online assessment testing cognitive reasoning, algorithms, and domain knowledge.",
    stageCategory: "Online Test",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "st-10000000-0000-4000-8000-000000000003",
    name: "HR Interview",
    description: "Structured interview focusing on communication, cultural alignment, and career aspirations.",
    stageCategory: "Interview",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "st-10000000-0000-4000-8000-000000000004",
    name: "User / Technical Interview",
    description: "Comprehensive technical deep-dive and project discussion with hiring manager / tech lead.",
    stageCategory: "Interview",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "st-10000000-0000-4000-8000-000000000005",
    name: "Offering Letter",
    description: "Final remuneration package presentation, negotiation, and contract issuance.",
    stageCategory: "Offering",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: null,
  },
]

// =====================================================================
// 3. Employee Table (ERD.sql)
// =====================================================================
export const mockEmployees: Employee[] = [
  {
    id: "e1000000-0000-4000-8000-000000000001",
    managerId: null,
    departmentId: "d1000000-0000-4000-8000-000000000005",
    employeeNumber: "EMP-2024-001",
    fullName: "Fajar Mahendra",
    email: "fajar.mahendra@metrodata.co.id",
    gender: "Male",
    jobTitle: "Talent Acquisition Specialist",
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "e1000000-0000-4000-8000-000000000002",
    managerId: null,
    departmentId: "d1000000-0000-4000-8000-000000000002",
    employeeNumber: "EMP-2023-014",
    fullName: "Rina Kusumawati",
    email: "rina.kusumawati@metrodata.co.id",
    gender: "Female",
    jobTitle: "Engineering Manager",
    isActive: true,
    createdAt: "2023-03-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "e1000000-0000-4000-8000-000000000003",
    managerId: "e1000000-0000-4000-8000-000000000002",
    departmentId: "d1000000-0000-4000-8000-000000000002",
    employeeNumber: "EMP-2022-089",
    fullName: "Bambang Sutrisno",
    email: "bambang.sutrisno@metrodata.co.id",
    gender: "Male",
    jobTitle: "Lead .NET Backend Architect",
    isActive: true,
    createdAt: "2022-08-10T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "e1000000-0000-4000-8000-000000000004",
    managerId: null,
    departmentId: "d1000000-0000-4000-8000-000000000005",
    employeeNumber: "EMP-2024-042",
    fullName: "Dewi Lestari",
    email: "dewi.lestari@metrodata.co.id",
    gender: "Female",
    jobTitle: "HR Business Partner",
    isActive: true,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "e1000000-0000-4000-8000-000000000005",
    managerId: null,
    departmentId: "d1000000-0000-4000-8000-000000000004",
    employeeNumber: "EMP-2021-105",
    fullName: "Agus Pratama",
    email: "agus.pratama@metrodata.co.id",
    gender: "Male",
    jobTitle: "Infrastructure Services Lead",
    isActive: true,
    createdAt: "2021-06-15T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "e1000000-0000-4000-8000-000000000006",
    managerId: null,
    departmentId: "d1000000-0000-4000-8000-000000000003",
    employeeNumber: "EMP-2022-057",
    fullName: "Sri Wahyuni",
    email: "sri.wahyuni@metrodata.co.id",
    gender: "Female",
    jobTitle: "Business Intelligence Lead",
    isActive: true,
    createdAt: "2022-05-20T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "e1000000-0000-4000-8000-000000000007",
    managerId: "e1000000-0000-4000-8000-000000000002",
    departmentId: "d1000000-0000-4000-8000-000000000002",
    employeeNumber: "EMP-2021-033",
    fullName: "Yohanes Siregar",
    email: "yohanes.siregar@metrodata.co.id",
    gender: "Male",
    jobTitle: "Senior QA Automation Engineer",
    isActive: true,
    createdAt: "2021-09-01T00:00:00Z",
    updatedAt: null,
  },
]

// =====================================================================
// Helper to construct BatchStage items matching ERD schema
// =====================================================================
const createStage = (
  id: string,
  batchId: string,
  stageTypeId: string,
  name: string,
  type: LegacyStageType,
  durationDays: number,
  ownerId: string,
  nextStageId: string | null = null,
  passingScore: number | null = null,
  startDate: string | null = null,
  endDate: string | null = null,
  interviewerIds: string[] = [],
  assignedInterviewers?: import("../types").StageInterviewerAssignment[]
): Stage => {
  const ids =
    interviewerIds.length > 0 ? interviewerIds : ownerId ? [ownerId] : []
  const assignments =
    assignedInterviewers && assignedInterviewers.length > 0
      ? assignedInterviewers
      : ids.map((empId, idx) => ({
          employeeId: empId,
          status: idx === 0 ? ("accepted" as const) : ("pending" as const),
        }))

  return {
    id,
    name,
    type,
    durationDays,
    ownerId,
    interviewerIds: ids,
    assignedInterviewers: assignments,
    batchStageId: `bs-${id}`,
    recruitmentBatchId: batchId,
    stageTypeId,
    nextStageId,
    passingScore,
    startDate,
    endDate,
    isActive: true,
  }
}

// =====================================================================
// 4. RecruitmentBatch Table (ERD.sql) + Stage Sequence (BatchStage)
// =====================================================================
export const initialRecruitments: Recruitment[] = [
  {
    id: "r1",
    code: "REC-2026-001",
    batchCode: "REC-2026-001",
    name: "Backend Developer 2026",
    departmentId: "d1000000-0000-4000-8000-000000000002",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 3,
    openDate: "2026-01-12",
    startDate: "2026-01-12T00:00:00Z",
    closeDate: "2026-03-31",
    endDate: "2026-03-31T23:59:59Z",
    status: "running",
    currentStage: 2,
    createdBy: "e1000000-0000-4000-8000-000000000001",
    ownerId: "u1",
    description: "Develop and maintain robust .NET 8 backend microservices and APIs for enterprise banking integrations.",
    createdAt: "2026-01-08T09:00:00Z",
    updatedAt: "2026-03-01T14:30:00Z",
    stages: [
      createStage(
        "s1-1", "r1", "st-10000000-0000-4000-8000-000000000001",
        "Document Screening", "screening", 7, "u1",
        "s1-2", 70, "2026-01-12", "2026-01-19"
      ),
      createStage(
        "s1-2", "r1", "st-10000000-0000-4000-8000-000000000002",
        "Logic Test", "test", 5, "u1",
        "s1-3", 75, "2026-01-20", "2026-01-25"
      ),
      createStage(
        "s1-3", "r1", "st-10000000-0000-4000-8000-000000000003",
        "HR Interview", "interview", 10, "e1000000-0000-4000-8000-000000000001",
        "s1-4", 75, "2026-01-26", "2026-02-05",
        ["e1000000-0000-4000-8000-000000000001", "e1000000-0000-4000-8000-000000000002"],
        [
          { employeeId: "e1000000-0000-4000-8000-000000000001", status: "accepted" },
          { employeeId: "e1000000-0000-4000-8000-000000000002", status: "pending" },
        ]
      ),
      createStage(
        "s1-4", "r1", "st-10000000-0000-4000-8000-000000000004",
        "User Interview", "interview", 10, "u2",
        "s1-5", 80, "2026-02-06", "2026-02-16"
      ),
      createStage(
        "s1-5", "r1", "st-10000000-0000-4000-8000-000000000005",
        "Offering", "offering", 7, "u1",
        null, 100, "2026-02-17", "2026-02-24"
      ),
    ],
  },
  {
    id: "r2",
    code: "REC-2026-002",
    batchCode: "REC-2026-002",
    name: "Data Analyst Batch Q1 2026",
    departmentId: "d1000000-0000-4000-8000-000000000003",
    division: "Business Intelligence",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-02-02",
    startDate: "2026-02-02T00:00:00Z",
    closeDate: "2026-04-15",
    endDate: "2026-04-15T23:59:59Z",
    status: "running",
    currentStage: 1,
    createdBy: "e1000000-0000-4000-8000-000000000004",
    ownerId: "u4",
    description: "Build automated reporting pipelines, Power BI dashboards, and commercial sales analytics for retail divisions.",
    createdAt: "2026-01-28T10:00:00Z",
    updatedAt: "2026-02-20T11:15:00Z",
    stages: [
      createStage(
        "s2-1", "r2", "st-10000000-0000-4000-8000-000000000001",
        "Document Screening", "screening", 7, "u4",
        "s2-2", 70, "2026-02-02", "2026-02-09"
      ),
      createStage(
        "s2-2", "r2", "st-10000000-0000-4000-8000-000000000002",
        "Logic Test", "test", 5, "u4",
        "s2-3", 75, "2026-02-10", "2026-02-15"
      ),
      createStage(
        "s2-3", "r2", "st-10000000-0000-4000-8000-000000000002",
        "Case Study", "test", 7, "u6",
        "s2-4", 80, "2026-02-16", "2026-02-23"
      ),
      createStage(
        "s2-4", "r2", "st-10000000-0000-4000-8000-000000000004",
        "User Interview", "interview", 10, "u6",
        "s2-5", 80, "2026-02-24", "2026-03-05"
      ),
      createStage(
        "s2-5", "r2", "st-10000000-0000-4000-8000-000000000005",
        "Offering", "offering", 7, "u4",
        null, 100, "2026-03-06", "2026-03-13"
      ),
    ],
  },
  {
    id: "r3",
    code: "REC-2026-003",
    batchCode: "REC-2026-003",
    name: "Network Engineer 2026",
    departmentId: "d1000000-0000-4000-8000-000000000004",
    division: "Infrastructure Services",
    location: "Surabaya",
    quota: 2,
    openDate: "2025-12-01",
    startDate: "2025-12-01T00:00:00Z",
    closeDate: "2026-02-28",
    endDate: "2026-02-28T23:59:59Z",
    status: "running",
    currentStage: 4,
    createdBy: "e1000000-0000-4000-8000-000000000001",
    ownerId: "u1",
    description: "Design, install, configure, and monitor high-availability campus and data center networks in East Java branch.",
    createdAt: "2025-11-20T08:30:00Z",
    updatedAt: "2026-02-15T09:45:00Z",
    stages: [
      createStage(
        "s3-1", "r3", "st-10000000-0000-4000-8000-000000000001",
        "Document Screening", "screening", 7, "u1",
        "s3-2", 70, "2025-12-01", "2025-12-08"
      ),
      createStage(
        "s3-2", "r3", "st-10000000-0000-4000-8000-000000000002",
        "Technical Test", "test", 5, "u5",
        "s3-3", 75, "2025-12-09", "2025-12-14"
      ),
      createStage(
        "s3-3", "r3", "st-10000000-0000-4000-8000-000000000003",
        "HR Interview", "interview", 10, "u4",
        "s3-4", 75, "2025-12-15", "2025-12-25"
      ),
      createStage(
        "s3-4", "r3", "st-10000000-0000-4000-8000-000000000004",
        "User Interview", "interview", 10, "u5",
        "s3-5", 80, "2025-12-26", "2026-01-05"
      ),
      createStage(
        "s3-5", "r3", "st-10000000-0000-4000-8000-000000000005",
        "Offering", "offering", 7, "u1",
        null, 100, "2026-01-06", "2026-01-13"
      ),
    ],
  },
  {
    id: "r4",
    code: "REC-2026-004",
    batchCode: "REC-2026-004",
    name: "Frontend Developer 2026",
    departmentId: "d1000000-0000-4000-8000-000000000002",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-03-23",
    startDate: "2026-03-23T00:00:00Z",
    closeDate: "2026-05-29",
    endDate: "2026-05-29T23:59:59Z",
    status: "draft",
    currentStage: -1,
    createdBy: "e1000000-0000-4000-8000-000000000001",
    ownerId: "u1",
    description: "Build modern, accessible internal applications and candidate portals with React 19, TanStack, and Tailwind CSS.",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: null,
    stages: [
      createStage(
        "s4-1", "r4", "st-10000000-0000-4000-8000-000000000001",
        "Document Screening", "screening", 7, "u1",
        "s4-2", 70
      ),
      createStage(
        "s4-2", "r4", "st-10000000-0000-4000-8000-000000000002",
        "Logic Test", "test", 5, "u1",
        "s4-3", 75
      ),
      createStage(
        "s4-3", "r4", "st-10000000-0000-4000-8000-000000000004",
        "User Interview", "interview", 10, "u2",
        "s4-4", 80
      ),
      createStage(
        "s4-4", "r4", "st-10000000-0000-4000-8000-000000000005",
        "Offering", "offering", 7, "u1",
        null, 100
      ),
    ],
  },
  {
    id: "r5",
    code: "REC-2025-005",
    batchCode: "REC-2025-005",
    name: "QA Engineer 2025",
    departmentId: "d1000000-0000-4000-8000-000000000002",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2025-09-01",
    startDate: "2025-09-01T00:00:00Z",
    closeDate: "2025-11-28",
    endDate: "2025-11-28T23:59:59Z",
    status: "completed",
    currentStage: 4,
    createdBy: "e1000000-0000-4000-8000-000000000004",
    ownerId: "u4",
    description: "Design manual test scenarios and automated end-to-end testing suites for client banking platforms.",
    createdAt: "2025-08-20T08:00:00Z",
    updatedAt: "2025-11-29T16:00:00Z",
    stages: [
      createStage(
        "s5-1", "r5", "st-10000000-0000-4000-8000-000000000001",
        "Document Screening", "screening", 7, "u4",
        "s5-2", 70, "2025-09-01", "2025-09-08"
      ),
      createStage(
        "s5-2", "r5", "st-10000000-0000-4000-8000-000000000002",
        "Logic Test", "test", 5, "u4",
        "s5-3", 75, "2025-09-09", "2025-09-14"
      ),
      createStage(
        "s5-3", "r5", "st-10000000-0000-4000-8000-000000000004",
        "User Interview", "interview", 10, "u7",
        "s5-4", 80, "2025-09-15", "2025-09-25"
      ),
      createStage(
        "s5-4", "r5", "st-10000000-0000-4000-8000-000000000005",
        "Offering", "offering", 7, "u4",
        null, 100, "2025-09-26", "2025-10-03"
      ),
    ],
  },
  {
    id: "r6",
    code: "REC-2026-006",
    batchCode: "REC-2026-006",
    name: "Mobile App Engineer 2026",
    departmentId: "d1000000-0000-4000-8000-000000000002",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-04-01",
    startDate: "2026-04-01T00:00:00Z",
    closeDate: "2026-06-30",
    endDate: "2026-06-30T23:59:59Z",
    status: "draft",
    currentStage: -1,
    createdBy: "e1000000-0000-4000-8000-000000000001",
    ownerId: "u1",
    description: "Develop cross-platform Flutter and native mobile applications for customer banking portals.",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: null,
    stages: [],
  },
]

// =====================================================================
// 5. BatchApplications Table (ERD.sql)
// =====================================================================
export const mockBatchApplications: BatchApplication[] = candidates.map((c, index) => ({
  id: `ba-${c.id}`,
  candidateId: c.id,
  recruitmentBatchId: c.recruitmentId,
  codeApplication: `APP-2026-${String(index + 1).padStart(3, "0")}`,
  appliedAt: `${c.appliedAt}T09:00:00Z`,
  finalStatus: c.status === "accepted" ? "Accepted" : c.status === "rejected" ? "Rejected" : "In Progress",
  status: c.status,
  note: "Candidate application submitted",
  fileOfferingLetter: c.status === "accepted" ? "OL-2026-FINAL.pdf" : null,
  offeringLetterStatus: c.status === "accepted" ? "Signed" : null,
  createdAt: `${c.appliedAt}T09:00:00Z`,
  updatedAt: null,
}))

// =====================================================================
// UI Status Metadata & Helpers
// =====================================================================
export const recruitmentStatusMeta: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  running: { label: "Open", tone: "success" },
  completed: { label: "Closed", tone: "danger" },
  closed: { label: "Closed", tone: "danger" },
  Draft: { label: "Draft", tone: "neutral" },
  Open: { label: "Open", tone: "success" },
  Closed: { label: "Closed", tone: "danger" },
  "1": { label: "Draft", tone: "neutral" },
  "2": { label: "Open", tone: "success" },
  "3": { label: "Closed", tone: "danger" },
}

export function activeCandidateCount(r: Recruitment): number {
  return candidates.filter(
    (c) =>
      c.recruitmentId === r.id &&
      (c.status === "in_progress" || c.status === "pending")
  ).length
}
