export function Spinner() {
  return (
    <div className="grid h-full min-h-40 place-items-center" role="status" aria-label="Loading">
      <div className="h-7 w-7 animate-spin rounded-full border-3 border-slate-300 border-t-amber-500" />
    </div>
  )
}
