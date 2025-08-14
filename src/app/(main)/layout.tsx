import MainLayout from '@/layouts/MainLayout';

export default function KanbanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}