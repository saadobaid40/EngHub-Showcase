import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/auth";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const token = useAuthStore((state: any) => state.token);
  const logout = useAuthStore((state: any) => state.logout);

  const { data: user } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetCurrentUserQueryKey()
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-semibold text-slate-900">EngHub</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-slate-900 ${
              location === "/" ? "text-slate-900" : "text-slate-500"
            }`}
            data-testid="link-nav-home"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className={`text-sm font-medium transition-colors hover:text-slate-900 ${
              location.startsWith("/projects") && location !== "/projects/new" ? "text-slate-900" : "text-slate-500"
            }`}
            data-testid="link-nav-browse"
          >
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {token && user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 sm:inline-block" data-testid="text-username">
                {user.username}
              </span>
              <Button asChild variant="default" className="shadow-sm">
                <Link href="/submit" data-testid="link-nav-submit">Submit Project</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900">
                <Link href="/login" data-testid="link-nav-login">Login</Link>
              </Button>
              <Button asChild variant="default" className="shadow-sm">
                <Link href="/register" data-testid="link-nav-register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
