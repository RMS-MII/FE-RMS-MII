import type { Tone } from "@/shared/components"
import type { Recruitment, RecruitmentStatus, Stage, StageType, PipelineItem, Department } from "../types"
import { candidates } from "@/data/mock"

export const mockDepartments: Department[] = [
  {
    id: "dept-1",
    code: "SD",
    name: "Software Development",
    description: "Software engineering, architecture, and development.",
  },
  {
    id: "dept-2",
    code: "BI",
    name: "Business Intelligence",
    description: "Data analysis, data science, and reporting.",
  },
  {
    id: "dept-3",
    code: "IS",
    name: "Infrastructure Services",
    description: "Network, cloud infrastructure, and security operations.",
  },
  {
    id: "dept-4",
    code: "HR",
    name: "Human Resources",
    description: "People operations, talent acquisition, and employee relations.",
  },
]

const st = (id: string, name: string, type: StageType, durationDays: number, ownerId: string): Stage =>
  ({ id, name, type, durationDays, ownerId })

export const initialRecruitments: Recruitment[] = [
  {
    id: "r1",
    code: "REC-001",
    name: "Backend Developer 2026",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 3,
    openDate: "2026-01-12",
    closeDate: "2026-03-31",
    status: "running",
    currentStage: 2,
    ownerId: "u1",
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
    id: "r2",
    code: "REC-002",
    name: "Data Analyst Batch Q1 2026",
    division: "Business Intelligence",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-02-02",
    closeDate: "2026-04-15",
    status: "running",
    currentStage: 1,
    ownerId: "u4",
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
    id: "r3",
    code: "REC-003",
    name: "Network Engineer 2026",
    division: "Infrastructure Services",
    location: "Surabaya",
    quota: 2,
    openDate: "2025-12-01",
    closeDate: "2026-02-28",
    status: "running",
    currentStage: 4,
    ownerId: "u1",
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
    id: "r4",
    code: "REC-004",
    name: "Frontend Developer 2026",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2026-03-23",
    closeDate: "2026-05-29",
    status: "draft",
    currentStage: -1,
    ownerId: "u1",
    description: "Build internal application UIs and customer portals with React and TypeScript.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u1"),
      st("s2", "Logic Test", "test", 5, "u1"),
      st("s3", "User Interview", "interview", 10, "u2"),
      st("s4", "Offering", "offering", 7, "u1"),
    ],
  },
  {
    id: "r5",
    code: "REC-005",
    name: "QA Engineer 2025",
    division: "Software Development",
    location: "Jakarta, APL Tower",
    quota: 2,
    openDate: "2025-09-01",
    closeDate: "2025-11-28",
    status: "completed",
    currentStage: 4,
    ownerId: "u4",
    description: "Design manual and automated test scenarios for web and mobile applications.",
    stages: [
      st("s1", "Document Screening", "screening", 7, "u4"),
      st("s2", "Logic Test", "test", 5, "u4"),
      st("s3", "User Interview", "interview", 10, "u7"),
      st("s4", "Offering", "offering", 7, "u4"),
    ],
  },
]

export const recruitmentStatusMeta: Record<RecruitmentStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  running: { label: "Running", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  closed: { label: "Closed", tone: "danger" },
}

export function activeCandidateCount(r: Recruitment): number {
  return candidates.filter(
    (c) =>
      c.recruitmentId === r.id &&
      (c.status === "in_progress" || c.status === "pending")
  ).length
}

export function recruitmentPipeline(r: Recruitment): PipelineItem[] {
  return r.stages.map((s, i) => ({
    name: s.name,
    count: candidates.filter(
      (c) =>
        c.recruitmentId === r.id &&
        c.stageIndex === i &&
        (c.status === "in_progress" || c.status === "pending" || c.status === "accepted")
    ).length,
    state: i < r.currentStage ? "done" : i === r.currentStage ? "current" : "upcoming",
  }))
}

