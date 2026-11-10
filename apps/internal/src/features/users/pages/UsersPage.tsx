import { useState } from "react"
import { safeFormatWibDateTime } from "@/shared/lib/utcDateTime"
import { UserRound } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import {
  DataTablePagination,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  SearchInput,
  StatusBadge,
  TableSkeleton,
} from "@/shared/components"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { cn } from "@/shared/lib/utils"
import { useGetUsersQuery } from "../api/users-api"

const PAGE_SIZE = 10
const accountStatusItems = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data
    if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
      return data.detail
    }
  }
  return "Something went wrong while fetching users. Please check your connection and try again."
}

export function UsersPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [activeFilter, setActiveFilter] = useState("all")
  const [page, setPage] = useState(1)

  const { data, error, isLoading, isFetching, isError, refetch } = useGetUsersQuery({
    search: debouncedSearch,
    isActive: activeFilter === "all" ? undefined : activeFilter === "active",
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="View RMS accounts, assigned roles, and account activity."
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search name, username, email, or role..."
              containerClassName="sm:w-80"
            />
            <Select
              items={accountStatusItems}
              value={activeFilter}
              onValueChange={(value) => {
                setActiveFilter(value ?? "all")
                setPage(1)
              }}
            >
              <SelectTrigger className="h-10 w-40 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 shadow-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card p-1 shadow-md">
                <SelectItem value="all" className="cursor-pointer rounded-lg text-sm">All Status</SelectItem>
                <SelectItem value="active" className="cursor-pointer rounded-lg text-sm">Active</SelectItem>
                <SelectItem value="inactive" className="cursor-pointer rounded-lg text-sm">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={cn("overflow-x-auto", isFetching && !isLoading && "opacity-60")}>
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Account status</TableHead>
                <TableHead className="pr-5">Last login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton
                  rowCount={5}
                  colWidths={[["w-36", "w-28", "w-32"], "w-24", "w-28", "w-20", "w-16", "w-32"]}
                  cellClassNames={["pl-5", "", "", "", "", "pr-5"]}
                />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <ErrorState
                      title="Failed to load users"
                      description={getErrorMessage(error)}
                      onRetry={() => refetch()}
                    />
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <EmptyState
                      icon={<UserRound className="size-6 stroke-[1.75]" />}
                      title="No user accounts found"
                      description="Try changing your search or status filter."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((user) => (
                  <TableRow key={user.accountId} className="border-b border-border transition-colors hover:bg-muted/40">
                    <TableCell className="min-w-56 py-3.5 pl-5">
                      <div className="font-medium text-foreground">{user.fullName}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{user.email}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {user.employeeNumber} · {user.jobTitle || "Employee"}
                        {!user.employeeIsActive && <span className="ml-1 text-warning">(employee inactive)</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-sm">{user.username}</TableCell>
                    <TableCell className="py-3.5 text-sm">{user.departmentName}</TableCell>
                    <TableCell className="py-3.5 text-sm">{user.role}</TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge tone={user.isActive ? "success" : "neutral"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3.5 pr-5 text-sm text-muted-foreground">
                      {safeFormatWibDateTime(user.lastLoginAt, "Never")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && !isError && (data?.totalItems ?? 0) > 0 && (
          <div className="border-t border-border px-5 py-4">
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={data?.totalItems ?? 0}
              onPageChange={setPage}
            />
          </div>
        )}
      </Panel>
    </div>
  )
}
