import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DialogFooter } from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton, DatePicker } from "@/shared/components"
import {
  useRegisterNewCandidate,
  genderOptions,
  type UseRegisterNewCandidateProps,
} from "../../hooks/useRegisterNewCandidate"

export interface RegisterNewCandidateTabProps extends UseRegisterNewCandidateProps {}

export function RegisterNewCandidateTab({
  recruitment,
  existingApplicationCount,
  onSuccess,
  onCancel,
}: RegisterNewCandidateTabProps) {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    gender,
    setGender,
    birthDate,
    setBirthDate,
    address,
    setAddress,
    education,
    setEducation,
    institution,
    setInstitution,
    gpa,
    setGpa,
    expectedSalary,
    setExpectedSalary,
    cv,
    setCv,
    portfolio,
    setPortfolio,
    errors,
    setErrors,
    submitError,
    hasStages,
    isSubmitting,
    handleSubmit,
  } = useRegisterNewCandidate({
    recruitment,
    existingApplicationCount,
    onSuccess,
    onCancel,
  })

  return (
    <>
      <div className="p-6 pt-4 space-y-4 max-h-[65vh] overflow-y-auto">
        {submitError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive font-medium">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cand-fullname" className="text-sm font-medium px-1">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cand-fullname"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }))
                }}
                placeholder="e.g. Budi Raharjo"
                aria-invalid={!!errors.fullName}
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive px-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="cand-email" className="text-sm font-medium px-1">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cand-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                }}
                placeholder="e.g. budi.raharjo@gmail.com"
                aria-invalid={!!errors.email}
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
              {errors.email && (
                <p className="text-xs text-destructive px-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="cand-phone" className="text-sm font-medium px-1">
                Phone Number
              </Label>
              <Input
                id="cand-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +62 812-3456-7890"
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>

            {/* Gender & Birth Date Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="cand-gender" className="text-sm font-medium px-1">
                  Gender
                </Label>
                <Select
                  items={genderOptions}
                  value={gender}
                  onValueChange={(val) => val && setGender(val)}
                >
                  <SelectTrigger
                    id="cand-gender"
                    className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/60 outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                  >
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectGroup>
                      {genderOptions.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-birthdate" className="text-sm font-medium px-1">
                  Birth Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  id="cand-birthdate"
                  value={birthDate}
                  defaultMonth="2000-01-01"
                  fromYear={1960}
                  toYear={new Date().getFullYear()}
                  onChange={(val) => {
                    setBirthDate(val)
                    if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: "" }))
                  }}
                  aria-invalid={!!errors.birthDate}
                  placeholder="dd/mm/yyyy"
                />
                {errors.birthDate && (
                  <p className="text-xs text-destructive px-1">{errors.birthDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Academic & documents */}
          <div className="space-y-3.5">
            {/* Education Degree & Major */}
            <div className="space-y-1.5">
              <Label htmlFor="cand-edu" className="text-sm font-medium px-1">
                Education Degree & Major
              </Label>
              <Input
                id="cand-edu"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. S1 Computer Science"
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>

            {/* University / Institution */}
            <div className="space-y-1.5">
              <Label htmlFor="cand-institution" className="text-sm font-medium px-1">
                University / Campus
              </Label>
              <Input
                id="cand-institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Universitas Indonesia"
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>

            {/* GPA & Expected Salary Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="cand-gpa" className="text-sm font-medium px-1">
                  GPA
                </Label>
                <Input
                  id="cand-gpa"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="e.g. 3.75"
                  className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cand-salary" className="text-sm font-medium px-1">
                  Expected Salary
                </Label>
                <Input
                  id="cand-salary"
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. 10000000"
                  className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                />
              </div>
            </div>

            {/* CV / Resume Link */}
            <div className="space-y-1.5">
              <Label htmlFor="cand-cv" className="text-sm font-medium px-1">
                CV / Resume URL (e.g. Google Drive)
              </Label>
              <Input
                id="cand-cv"
                value={cv}
                onChange={(e) => setCv(e.target.value)}
                placeholder="https://drive.google.com/... or resume URL"
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="cand-address" className="text-sm font-medium px-1">
            Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cand-address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              if (errors.address) setErrors((prev) => ({ ...prev, address: "" }))
            }}
            placeholder="e.g. Jl. Jendral Sudirman No. 12, Jakarta Selatan"
            aria-invalid={!!errors.address}
            className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
          />
          {errors.address && (
            <p className="text-xs text-destructive px-1">{errors.address}</p>
          )}
        </div>

        {/* Portfolio URL */}
        <div className="space-y-1.5">
          <Label htmlFor="cand-portfolio" className="text-sm font-medium px-1">
            Portfolio / GitHub URL (Optional)
          </Label>
          <Input
            id="cand-portfolio"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="https://github.com/username or personal website"
            className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
          />
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="pb-9 px-9 border-t border-border bg-card flex items-center justify-end gap-2.5">
        <CancelButton onClick={onCancel} disabled={isSubmitting} />
        <SaveButton
          type="button"
          onClick={handleSubmit}
          disabled={!hasStages}
          isLoading={isSubmitting}
          loadingText="Saving..."
        >
          Save Candidate
        </SaveButton>
      </DialogFooter>
    </>
  )
}
