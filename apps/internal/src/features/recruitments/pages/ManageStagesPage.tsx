import { BackButton, Panel, ErrorState } from "@/shared/components"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  StageOverviewBanner,
  StageList,
  StageConfigForm,
} from "../components/stages"
import { useManageStages, type UseManageStagesProps } from "../hooks/useManageStages"

export interface ManageStagesPageProps extends UseManageStagesProps {}

export function ManageStagesPage({ id }: ManageStagesPageProps) {
  const {
    recruitment,
    isLoading,
    isError,
    refetch,
    stages,
    selectedTempId,
    setSelectedTempId,
    selectedIndex,
    selectedStage,
    nextStage,
    savedSuccess,
    errorMessage,
    handleFieldChange,
    handleMoveUp,
    handleMoveDown,
    handleReorder,
    handleRemoveStage,
    handleAddStage,
    handleCancel,
    handleSave,
  } = useManageStages({ id })

  if (isLoading && !recruitment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3.5">
          <BackButton to="/recruitments" label="Back to Recruitments" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-60 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError && !recruitment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton to="/recruitments" label="Back to Recruitments" />
          <h1 className="text-xl font-bold text-foreground">Manage Selection Stages</h1>
        </div>
        <Panel className="p-8">
          <ErrorState
            title="Failed to load recruitment batch"
            description="Unable to fetch recruitment batch stages. Please try again."
            onRetry={() => refetch()}
          />
        </Panel>
      </div>
    )
  }

  if (!recruitment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton to="/recruitments" label="Back to Recruitments" />
          <h1 className="text-xl font-bold text-foreground">Recruitment Not Found</h1>
        </div>
        <Panel className="p-8 text-center text-muted-foreground">
          No recruitment found with ID: {id}
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-start gap-3.5">
        <BackButton
          to={`/recruitments/${recruitment.id}?tab=stages`}
          label="Back to Recruitment Detail"
        />

        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manage Selection Stages
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure sequential pipeline, passing criteria, and schedules for{" "}
            <span className="font-semibold text-foreground">{recruitment.name}</span>.
          </p>
        </div>
      </div>

      <StageOverviewBanner
        recruitment={recruitment}
        totalStages={stages.length}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaved={savedSuccess}
      />

      {errorMessage && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        <StageList
          stages={stages}
          selectedId={selectedTempId}
          onSelect={setSelectedTempId}
          onAddStage={handleAddStage}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onReorder={handleReorder}
          onRemoveStage={handleRemoveStage}
        />

        <StageConfigForm
          selectedStage={selectedStage}
          selectedIndex={selectedIndex}
          totalStages={stages.length}
          nextStage={nextStage}
          onFieldChange={handleFieldChange}
          onRemoveStage={handleRemoveStage}
        />
      </div>
    </div>
  )
}
