import type { ComponentProps } from "react";
import { AuthHeading } from "./AuthHeading";
import { AuthSurface } from "./AuthSurface";

type AuthCardProps = Omit<ComponentProps<typeof AuthSurface>, "className"> & {
  title: string;
  subtitle: string;
};

export function AuthCard({ title, subtitle, children, ...surface }: AuthCardProps) {
  return (
    <AuthSurface {...surface}>
      <AuthHeading title={title} subtitle={subtitle} />
      {children}
    </AuthSurface>
  );
}
