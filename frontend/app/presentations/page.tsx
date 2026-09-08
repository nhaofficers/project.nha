import ResourcePage from '@/components/ResourcePage';
export default function Presentations(){return <ResourcePage title="উপস্থাপনাসমূহ" description="আর্কাইভের ছবি নকল না করে পুনর্ব্যবহারযোগ্য উপস্থাপনা তৈরি করুন।" endpoint="/presentations" nameKey="title" createHref="/presentations/create" detailBase="/presentations" columns={[["শিরোনাম","title"],["অবস্থা","status"],["হালনাগাদ","updatedAt"]]}/>}
