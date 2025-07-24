'use client';

import { CreateProjectForm } from "@/components/admin/CreateProjectForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NewProjectPage() {
  return (
    <main className="container-main">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => window.location.href = '/admin/dashboard'}
        className="mb-6"
      >
        &larr; Back to Admin Dashboard
      </Button>
      <h1 className="section-header">Create New Project Proposal</h1>
      <CreateProjectForm />
    </main>
  );
}