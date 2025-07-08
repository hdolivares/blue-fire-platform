// In frontend/src/app/admin/projects/new/page.tsx
import { CreateProjectForm } from "@/components/admin/CreateProjectForm";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <main className="container mx-auto p-8">
      <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 mb-6 inline-block">
        &larr; Back to Admin Dashboard
      </Link>
      <h1 className="text-4xl font-bold mb-8">Create New Project Proposal</h1>
      <CreateProjectForm />
    </main>
  );
}