import ResourcePage from '@/components/ResourcePage';
export default function Roles(){return <ResourcePage title="ভূমিকা ও অনুমতি" description="আর্কাইভের বিভিন্ন সুবিধায় প্রবেশাধিকার নিয়ন্ত্রণকারী অনুমতি-গোষ্ঠী।" endpoint="/roles" nameKey="name" columns={[["ভূমিকা","name"],["বিবরণ","description"],["ব্যবহারকারী","userCount"],["অনুমতি","permissionCount"]]}/>}
