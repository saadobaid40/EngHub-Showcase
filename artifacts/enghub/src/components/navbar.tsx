import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/auth";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { BookOpen, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const token = useAuthStore((state: any) => state.token);
  const logout = useAuthStore((state: any) => state.logout);
  const { theme, setTheme } = useTheme();

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-semibold text-slate-900 dark:text-slate-100">EngiNexus</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-slate-100 ${
              location === "/" ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
            }`}
            data-testid="link-nav-home"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className={`text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-slate-100 ${
              location.startsWith("/projects") && location !== "/projects/new" ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
            }`}
            data-testid="link-nav-browse"
          >
            Browse
          </Link>
          {token && user && (
            <Link
              href="/profile"
              className={`hidden sm:inline text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-slate-100 ${
                location.startsWith("/profile") ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              My Projects
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {token && user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 sm:inline-block" data-testid="text-username">
                {user.username}
              </span>
              <Button asChild variant="default" className="shadow-sm">
                <Link href="/submit" data-testid="link-nav-submit">Submit Project</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
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
