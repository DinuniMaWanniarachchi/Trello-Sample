import MainLayout from '@/layouts/MainLayout';
import { ProjectProvider } from '@/contexts/ProjectContext';

export default function KanbanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectProvider><MainLayout>{children}</MainLayout></ProjectProvider>;
}