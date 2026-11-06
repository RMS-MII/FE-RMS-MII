import { useMemo } from "react"
import { Trash2, Users, Loader2 } from "lucide-react"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { SearchCombobox, type SearchComboboxOption } from "@/shared/components"
import { mockDepartments, mockEmployees } from "../data/mock"
import type { StageEmployeeStatus, StageInterviewerAssignment, Employee } from "../types"
import { useGetEmployeesQuery } from "../api/employees-api"
import { useGetDepartmentsQuery } from "../api/departments-api"

export interface InterviewerAssignSectionProps {
  id?: string
  assignments: StageInterviewerAssignment[]
  onChange: (assignments: StageInterviewerAssignment[]) => void
  label?: string
  optional?: boolean
  helperText?: string
  className?: string
  employees?: Employee[]
  isLoadingEmployees?: boolean
}

const statusBadgeStyles: Record<StageEmployeeStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  declined: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
}

const statusBadgeLabels: Record<StageEmployeeStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
}

export function InterviewerAssignSection({
  id = "assign-interviewers",
  assignments,
  onChange,
  label = "Interviewers",
  optional = false,
  helperText = "Newly assigned interviewers will have Pending status until confirmed.",
  className,
  employees: propEmployees,
  isLoadingEmployees: propIsLoadingEmployees,
}: InterviewerAssignSectionProps) {
  // Query employees if not passed from parent
  const {
    data: apiEmployees,
    isLoading: isFetchingEmployees,
  } = useGetEmployeesQuery(undefined, {
    skip: Boolean(propEmployees),
  })

  // Query departments for grouping in combobox
  const { data: apiDepartments } = useGetDepartmentsQuery()

  const finalEmployees = useMemo(() => {
    if (propEmployees && propEmployees.length > 0) return propEmployees
    if (apiEmployees && apiEmployees.length > 0) return apiEmployees
    return mockEmployees
  }, [propEmployees, apiEmployees])

  const finalDepartments = useMemo(() => {
    if (apiDepartments && apiDepartments.length > 0) return apiDepartments
    return mockDepartments
  }, [apiDepartments])

  const isLoading = propIsLoadingEmployees ?? isFetchingEmployees

  const departmentCategories = useMemo(() => {
    return finalDepartments.map((d) => ({
      label: d.name,
      value: d.id,
    }))
  }, [finalDepartments])

  const employeeOptions = useMemo<SearchComboboxOption[]>(() => {
    return finalEmployees.map((e) => {
      const dept = finalDepartments.find((d) => d.id === e.departmentId)
      return {
        id: e.id,
        label: e.fullName,
        subLabel: e.jobTitle || "Employee",
        category: e.departmentId,
        categoryLabel: e.departmentName || dept?.name || "General",
        meta: e.employeeNumber,
      }
    })
  }, [finalEmployees, finalDepartments])

  const selectedIds = useMemo(() => {
    return assignments.map((a) => a.employeeId)
  }, [assignments])

  const assignedEmployees = useMemo(() => {
    return assignments
      .map((item) => {
        const emp = finalEmployees.find((e) => e.id === item.employeeId)
        if (!emp) return null
        const dept = finalDepartments.find((d) => d.id === emp.departmentId)
        return {
          ...emp,
          status: item.status,
          departmentName: (emp.departmentName || dept?.name) ?? "General",
        }
      })
      .filter(Boolean) as (Employee & {
        status: StageEmployeeStatus
        departmentName: string
      })[]
  }, [assignments, finalEmployees, finalDepartments])

  const handleAdd = (employeeId: string) => {
    if (!employeeId || assignments.some((a) => a.employeeId === employeeId)) return
    // Default status: pending (awaiting confirmation)
    const updated: StageInterviewerAssignment[] = [
      ...assignments,
      { employeeId, status: "pending" },
    ]
    onChange(updated)
  }

  const handleRemove = (employeeId: string) => {
    const updated = assignments.filter((a) => a.employeeId !== employeeId)
    onChange(updated)
  }

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex items-center justify-between px-1">
        <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1.5">
          <Users className="size-3.5 text-muted-foreground" />
          <span>{label}</span>
          {optional && (
            <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
          )}
        </Label>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Loading...
            </span>
          )}
          {assignedEmployees.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums font-normal">
              {assignedEmployees.length} assigned
            </span>
          )}
        </div>
      </div>

      <SearchCombobox
        id={id}
        options={employeeOptions}
        categories={departmentCategories}
        placeholder={isLoading ? "Loading interviewers..." : "+ Add interviewer..."}
        searchPlaceholder="Search by name, title, or employee ID..."
        emptyText="No interviewers found in this department."
        selectedIds={selectedIds}
        onSelect={(opt) => handleAdd(opt.id)}
        disabled={isLoading}
        closeOnSelect={false}
      />

      {helperText && (
        <p className="text-xs text-muted-foreground px-1">{helperText}</p>
      )}

      {assignedEmployees.length > 0 && (
        <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1 pt-1">
          {assignedEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {emp.fullName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {emp.fullName}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-medium ${statusBadgeStyles[emp.status]}`}
                    >
                      {statusBadgeLabels[emp.status]}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {emp.jobTitle || "Interviewer"} • {emp.departmentName}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemove(emp.id)}
                title={`Remove ${emp.fullName}`}
                className="size-7 shrink-0 rounded-full border-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
