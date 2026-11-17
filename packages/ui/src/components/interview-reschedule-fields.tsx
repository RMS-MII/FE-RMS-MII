import { DatePicker } from "@workspace/ui/components/date-picker"
import { TimePicker } from "@workspace/ui/components/time-picker"
import { getWibDateKey } from "@workspace/ui/lib/wib"

export interface InterviewRescheduleSchedule {
  date: string
  startTime: string
  endTime: string
}

export function InterviewRescheduleFields({
  id, value, onChange, disabled,
}: {
  id: string
  value: InterviewRescheduleSchedule
  onChange: (value: InterviewRescheduleSchedule) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor={id + "-date"}>Proposed date</label>
        <DatePicker id={id + "-date"} value={value.date} minDate={getWibDateKey(new Date())}
          placeholder="Select a date" disabled={disabled}
          onChange={(date) => onChange({ ...value, date })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label htmlFor={id + "-start"}>Start time</label>
          <TimePicker id={id + "-start"} value={value.startTime} placeholder="Select time"
            disabled={disabled} onChange={(startTime) => onChange({ ...value, startTime })} />
        </div>
        <div className="grid gap-2">
          <label htmlFor={id + "-end"}>End time</label>
          <TimePicker id={id + "-end"} value={value.endTime} minTime={value.startTime || undefined}
            placeholder="Select time" disabled={disabled}
            onChange={(endTime) => onChange({ ...value, endTime })} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Times are in WIB (UTC+7).</p>
    </div>
  )
}
