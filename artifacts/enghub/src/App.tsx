import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from 'next-themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import { useAuthStore } from '@/store/auth';
import { Navbar } from '@/components/navbar';

// Pages
import Home from '@/pages/home';
import Browse from '@/pages/browse';
import ProjectDetail from '@/pages/project-detail';
import SubmitProject from '@/pages/submit-project';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Profile from '@/pages/profile';

const queryClient = new QueryClient();

setAuthTokenGetter(() => {
  return localStorage.getItem('token');
});

function Router() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/projects" component={Browse} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/submit" component={SubmitProject} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </main>
      <footer className="border-t border-border bg-card py-12 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>EngiNexus &copy; {new Date().getFullYear()}. A scholarly space for engineering projects.</p>
        </div>
      </footer>
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
