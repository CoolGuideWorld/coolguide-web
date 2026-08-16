import { requireStudioAdmin } from "@/lib/studio/requireStudioAdmin";
import StudioShell from "@/components/studio/StudioShell";

export default async function StudioPrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { admin } = await requireStudioAdmin();
  const displayName = admin.display_name?.trim() || "Laurent";

  return <StudioShell displayName={displayName}>{children}</StudioShell>;
}
