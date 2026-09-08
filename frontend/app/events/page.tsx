import ResourcePage from '@/components/ResourcePage';
export default function Events(){return <ResourcePage title="কার্যক্রমসমূহ" description="দাপ্তরিক কার্যক্রম, পরিদর্শন, সভা ও অনুষ্ঠান।" endpoint="/events" nameKey="eventName" createHref="/events/create" detailBase="/events" columns={[["কোড","eventCode"],["কার্যক্রম","eventName"],["তারিখ","eventDate"],["অবস্থান","location"]]}/>}
