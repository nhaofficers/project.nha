'use client';
import { useParams } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
export default function EditProject(){const {id}=useParams<{id:string}>();return <ProjectForm id={id}/>}
