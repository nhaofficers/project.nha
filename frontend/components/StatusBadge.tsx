export default function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase().replaceAll('_', '-');
  const labels: Record<string, string> = {
    ACTIVE: 'সক্রিয়', DISABLED: 'নিষ্ক্রিয়', UPLOADED: 'আপলোড হয়েছে',
    PENDING_REVIEW: 'অনুমোদনের অপেক্ষায়', APPROVED: 'অনুমোদিত',
    REJECTED: 'প্রত্যাখ্যাত', ARCHIVED: 'আর্কাইভকৃত', DRAFT: 'খসড়া',
    GENERATING: 'তৈরি হচ্ছে', COMPLETED: 'সম্পন্ন', FAILED: 'ব্যর্থ',
  };
  return <span className={`status status-${normalized}`}>{labels[value] ?? value.replaceAll('_', ' ')}</span>;
}
