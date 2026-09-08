export function LoadingState({ label = 'তথ্য লোড হচ্ছে…' }: { label?: string }) {
  return <div className="card state" role="status"><span className="spinner" aria-hidden="true"/><span>{label}</span></div>;
}
export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="card state state-empty"><div className="empty-mark" aria-hidden="true">◇</div><strong>{title}</strong><p>{detail}</p>{action}</div>;
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error state-inline" role="alert"><span>{message}</span>{retry ? <button className="btn btn-small btn-secondary" onClick={retry}>আবার চেষ্টা করুন</button> : null}</div>;
}
