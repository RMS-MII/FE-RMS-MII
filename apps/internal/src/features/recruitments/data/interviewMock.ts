import type { InterviewSessionItem } from "../types"
import { mockEmployees } from "./mock"

// =====================================================================
// Mock Interview Sessions for Recruitment Batches
// Conforms to Document/ERD.sql (InterviewSession, SessionInterview,
// InterviewAssessment, RescheduleRequest)
// =====================================================================

export const mockInterviewSessions: InterviewSessionItem[] = [
  // Session 1: Past / Completed (2026-03-05) - HR Interview
  {
    id: "is-10000000-0000-4000-8000-000000000001",
    applicationStageId: "as-10000000-0000-4000-8000-000000000001",
    recruitmentBatchId: "r1",
    stageId: "s3",
    stageName: "HR Interview",
    sessionName: "HR Culture & Competency Interview - Andi Saputra",
    scheduledStart: "2026-03-05T09:00:00",
    scheduledEnd: "2026-03-05T10:00:00",
    isOnline: false,
    location: "APL Tower Lt. 37, Meeting Room 2",
    meetingUrl: null,
    status: "completed",
    fileSubmission: null,
    endedSubmissionAt: null,
    candidateId: "c1",
    candidateName: "Andi Saputra",
    candidateEmail: "andi.saputra@email.com",
    codeApplication: "APP-2026-001",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000001",
        stageEmployeeId: "se-01",
        employeeId: mockEmployees[3].id, // Dewi Lestari
        employeeName: mockEmployees[3].fullName,
        employeeEmail: mockEmployees[3].email,
        role: "HR Interviewer",
        status: "completed",
        assessment: {
          id: "ia-01",
          score: 88,
          recommendation: "Strong Hire",
          notes: "Kandidat memiliki kemampuan komunikasi sangat baik, pemahaman visi karir jelas, motivasi tinggi.",
          assessedAt: "2026-03-05T10:15:00",
        },
      },
    ],
    rescheduleRequest: null,
  },

  // Session 2: Past / Completed (2026-03-06) - User / Tech Interview
  {
    id: "is-10000000-0000-4000-8000-000000000002",
    applicationStageId: "as-10000000-0000-4000-8000-000000000002",
    recruitmentBatchId: "r1",
    stageId: "s4",
    stageName: "User Interview",
    sessionName: "Technical Deep-Dive & Architecture - Siti Rahmawati",
    scheduledStart: "2026-03-06T13:30:00",
    scheduledEnd: "2026-03-06T15:00:00",
    isOnline: true,
    location: "Microsoft Teams",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_siti_rahmawati",
    status: "completed",
    fileSubmission: "siti_takehome_clean_arch.zip",
    endedSubmissionAt: "2026-03-05T23:59:00",
    candidateId: "c2",
    candidateName: "Siti Rahmawati",
    candidateEmail: "siti.rahmawati@email.com",
    codeApplication: "APP-2026-002",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000002",
        stageEmployeeId: "se-02",
        employeeId: mockEmployees[1].id, // Rina Kusumawati
        employeeName: mockEmployees[1].fullName,
        employeeEmail: mockEmployees[1].email,
        role: "Lead Interviewer",
        status: "completed",
        assessment: {
          id: "ia-02",
          score: 84,
          recommendation: "Recommend",
          notes: "Pemahaman SOLID dan CQRS bagus. Perlu bimbingan sedikit di Kafka consumer error handling.",
          assessedAt: "2026-03-06T15:10:00",
        },
      },
      {
        id: "si-10000000-0000-4000-8000-000000000003",
        stageEmployeeId: "se-03",
        employeeId: mockEmployees[2].id, // Bambang Sutrisno
        employeeName: mockEmployees[2].fullName,
        employeeEmail: mockEmployees[2].email,
        role: "Technical Panelist",
        status: "completed",
        assessment: {
          id: "ia-03",
          score: 82,
          recommendation: "Recommend",
          notes: "Hasil live coding memuaskan, kode bersih dan test coverage baik.",
          assessedAt: "2026-03-06T15:20:00",
        },
      },
    ],
    rescheduleRequest: null,
  },

  // Session 3: Past (2026-03-09) - HR Interview
  {
    id: "is-10000000-0000-4000-8000-000000000003",
    applicationStageId: "as-10000000-0000-4000-8000-000000000003",
    recruitmentBatchId: "r1",
    stageId: "s3",
    stageName: "HR Interview",
    sessionName: "HR Interview - Budi Hartono",
    scheduledStart: "2026-03-09T10:00:00",
    scheduledEnd: "2026-03-09T11:00:00",
    isOnline: false,
    location: "APL Tower Lt. 37, Meeting Room 1",
    meetingUrl: null,
    status: "completed",
    fileSubmission: null,
    endedSubmissionAt: null,
    candidateId: "c3",
    candidateName: "Budi Hartono",
    candidateEmail: "budi.hartono@email.com",
    codeApplication: "APP-2026-003",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000004",
        stageEmployeeId: "se-04",
        employeeId: mockEmployees[0].id, // Fajar Mahendra
        employeeName: mockEmployees[0].fullName,
        employeeEmail: mockEmployees[0].email,
        role: "Talent Acquisition",
        status: "completed",
        assessment: {
          id: "ia-04",
          score: 79,
          recommendation: "Neutral",
          notes: "Pengalaman relevan tapi orientasi team player masih perlu dievaluasi lebih lanjut.",
          assessedAt: "2026-03-09T11:15:00",
        },
      },
    ],
    rescheduleRequest: null,
  },

  // Session 4: TODAY (2026-03-10) - Morning Session
  {
    id: "is-10000000-0000-4000-8000-000000000004",
    applicationStageId: "as-10000000-0000-4000-8000-000000000004",
    recruitmentBatchId: "r1",
    stageId: "s3",
    stageName: "HR Interview",
    sessionName: "HR Behavioral Interview - Putri Anggraini",
    scheduledStart: "2026-03-10T09:30:00",
    scheduledEnd: "2026-03-10T10:30:00",
    isOnline: true,
    location: "Google Meet",
    meetingUrl: "https://meet.google.com/xyz-putri-rec",
    status: "scheduled",
    fileSubmission: null,
    endedSubmissionAt: null,
    candidateId: "c4",
    candidateName: "Putri Anggraini",
    candidateEmail: "putri.anggraini@email.com",
    codeApplication: "APP-2026-004",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000005",
        stageEmployeeId: "se-05",
        employeeId: mockEmployees[0].id, // Fajar Mahendra
        employeeName: mockEmployees[0].fullName,
        employeeEmail: mockEmployees[0].email,
        role: "Talent Acquisition",
        status: "accepted",
        assessment: null,
      },
    ],
    rescheduleRequest: null,
  },

  // Session 5: TODAY (2026-03-10) - Afternoon Session
  {
    id: "is-10000000-0000-4000-8000-000000000005",
    applicationStageId: "as-10000000-0000-4000-8000-000000000005",
    recruitmentBatchId: "r1",
    stageId: "s4",
    stageName: "User Interview",
    sessionName: "Technical Architecture Assessment - Rizky Firmansyah",
    scheduledStart: "2026-03-10T14:00:00",
    scheduledEnd: "2026-03-10T15:30:00",
    isOnline: false,
    location: "APL Tower Lt. 37, Boardroom Tech",
    meetingUrl: null,
    status: "scheduled",
    fileSubmission: "rizky_fullstack_demo.zip",
    endedSubmissionAt: "2026-03-09T18:00:00",
    candidateId: "c5",
    candidateName: "Rizky Firmansyah",
    candidateEmail: "rizky.firmansyah@email.com",
    codeApplication: "APP-2026-005",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000006",
        stageEmployeeId: "se-06",
        employeeId: mockEmployees[1].id, // Rina Kusumawati
        employeeName: mockEmployees[1].fullName,
        employeeEmail: mockEmployees[1].email,
        role: "Engineering Manager",
        status: "accepted",
        assessment: null,
      },
      {
        id: "si-10000000-0000-4000-8000-000000000007",
        stageEmployeeId: "se-07",
        employeeId: mockEmployees[2].id, // Bambang Sutrisno
        employeeName: mockEmployees[2].fullName,
        employeeEmail: mockEmployees[2].email,
        role: "Lead Architect",
        status: "assigned",
        assessment: null,
      },
    ],
    rescheduleRequest: null,
  },

  // Session 6: Tomorrow (2026-03-11) - Scheduled
  {
    id: "is-10000000-0000-4000-8000-000000000006",
    applicationStageId: "as-10000000-0000-4000-8000-000000000006",
    recruitmentBatchId: "r1",
    stageId: "s3",
    stageName: "HR Interview",
    sessionName: "HR Interview - Nur Aisyah",
    scheduledStart: "2026-03-11T10:00:00",
    scheduledEnd: "2026-03-11T11:00:00",
    isOnline: true,
    location: "Microsoft Teams",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_nur_aisyah",
    status: "scheduled",
    fileSubmission: null,
    endedSubmissionAt: null,
    candidateId: "c6",
    candidateName: "Nur Aisyah",
    candidateEmail: "nur.aisyah@email.com",
    codeApplication: "APP-2026-006",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000008",
        stageEmployeeId: "se-08",
        employeeId: mockEmployees[3].id, // Dewi Lestari
        employeeName: mockEmployees[3].fullName,
        employeeEmail: mockEmployees[3].email,
        role: "HR Interviewer",
        status: "accepted",
        assessment: null,
      },
    ],
    rescheduleRequest: null,
  },

  // Session 7: Upcoming (2026-03-12) - HAS PENDING RESCHEDULE REQUEST!
  {
    id: "is-10000000-0000-4000-8000-000000000007",
    applicationStageId: "as-10000000-0000-4000-8000-000000000007",
    recruitmentBatchId: "r1",
    stageId: "s4",
    stageName: "User Interview",
    sessionName: "System Design & Live Coding - Dimas Prakoso",
    scheduledStart: "2026-03-12T10:00:00",
    scheduledEnd: "2026-03-12T11:30:00",
    isOnline: true,
    location: "Google Meet",
    meetingUrl: "https://meet.google.com/dimas-interview-rms",
    status: "scheduled",
    fileSubmission: "dimas_portfolio_services.pdf",
    endedSubmissionAt: "2026-03-11T12:00:00",
    candidateId: "c7",
    candidateName: "Dimas Prakoso",
    candidateEmail: "dimas.prakoso@email.com",
    codeApplication: "APP-2026-007",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000009",
        stageEmployeeId: "se-09",
        employeeId: mockEmployees[1].id, // Rina Kusumawati
        employeeName: mockEmployees[1].fullName,
        employeeEmail: mockEmployees[1].email,
        role: "Tech Manager",
        status: "accepted",
        assessment: null,
      },
    ],
    // PENDING RESCHEDULE REQUEST FROM CANDIDATE
    rescheduleRequest: {
      id: "rr-10000000-0000-4000-8000-000000000001",
      interviewSessionId: "is-10000000-0000-4000-8000-000000000007",
      requesterEmail: "dimas.prakoso@email.com",
      proposedStart: "2026-03-13T14:00:00",
      proposedEnd: "2026-03-13T15:30:00",
      reason: "Jadwal bentrok dengan ujian komprehensif skripsi di kampus. Mohon pergeseran waktu ke Jumat sore.",
      status: "pending",
      reviewedBy: null,
      reviewedByName: null,
      reviewedAt: null,
      reviewNotes: null,
    },
  },

  // Session 8: Upcoming (2026-03-13) - Scheduled Onsite
  {
    id: "is-10000000-0000-4000-8000-000000000008",
    applicationStageId: "as-10000000-0000-4000-8000-000000000008",
    recruitmentBatchId: "r1",
    stageId: "s3",
    stageName: "HR Interview",
    sessionName: "HR Culture Fit Interview - Ayu Wulandari",
    scheduledStart: "2026-03-13T09:00:00",
    scheduledEnd: "2026-03-13T10:00:00",
    isOnline: false,
    location: "APL Tower Lt. 37, Meeting Room 2",
    meetingUrl: null,
    status: "scheduled",
    fileSubmission: null,
    endedSubmissionAt: null,
    candidateId: "c8",
    candidateName: "Ayu Wulandari",
    candidateEmail: "ayu.wulandari@email.com",
    codeApplication: "APP-2026-008",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000010",
        stageEmployeeId: "se-10",
        employeeId: mockEmployees[0].id, // Fajar Mahendra
        employeeName: mockEmployees[0].fullName,
        employeeEmail: mockEmployees[0].email,
        role: "Talent Acquisition",
        status: "assigned",
        assessment: null,
      },
    ],
    rescheduleRequest: null,
  },

  // Session 9: Upcoming Next Week (2026-03-16) - Scheduled Online
  {
    id: "is-10000000-0000-4000-8000-000000000009",
    applicationStageId: "as-10000000-0000-4000-8000-000000000009",
    recruitmentBatchId: "r1",
    stageId: "s4",
    stageName: "User Interview",
    sessionName: "User Technical Review - Hendra Gunawan",
    scheduledStart: "2026-03-16T11:00:00",
    scheduledEnd: "2026-03-16T12:30:00",
    isOnline: true,
    location: "Microsoft Teams",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_hendra_gunawan",
    status: "scheduled",
    fileSubmission: "hendra_system_overview.pdf",
    endedSubmissionAt: "2026-03-15T20:00:00",
    candidateId: "c9",
    candidateName: "Hendra Gunawan",
    candidateEmail: "hendra.gunawan@email.com",
    codeApplication: "APP-2026-009",
    interviewers: [
      {
        id: "si-10000000-0000-4000-8000-000000000011",
        stageEmployeeId: "se-11",
        employeeId: mockEmployees[2].id, // Bambang Sutrisno
        employeeName: mockEmployees[2].fullName,
        employeeEmail: mockEmployees[2].email,
        role: "Backend Architect",
        status: "assigned",
        assessment: null,
      },
    ],
    rescheduleRequest: null,
  },
]

/**
 * Helper to fetch interview sessions for a specific recruitment batch.
 */
export function getRecruitmentInterviewSessions(
  recruitmentBatchId: string
): InterviewSessionItem[] {
  return mockInterviewSessions.filter(
    (s) => s.recruitmentBatchId === recruitmentBatchId
  )
}

