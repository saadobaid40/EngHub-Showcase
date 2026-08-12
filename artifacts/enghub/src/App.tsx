import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';

/* 
 * Seed Images available for backend seeding (generated via tool):
 * - attached_assets/project_1.jpg
 * - attached_assets/project_2.jpg
 * - attached_assets/project_3.jpg
 */

import { useAuthStore } from '@/store/auth';
import { Navbar } from '@/components/navbar';

// Pages
import Home from '@/pages/home';
import Browse from '@/pages/browse';
import ProjectDetail from '@/pages/project-detail';
import SubmitProject from '@/pages/submit-project';
import Login from '@/pages/login';
import Register from '@/pages/register';

const queryClient = new QueryClient();

// Configure the generated API hooks to use our auth token
setAuthTokenGetter(() => {
  return localStorage.getItem('token');
});

function Router() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
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
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </main>
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
        <div className="container mx-auto px-4">
          <p>EngHub &copy; {new Date().getFullYear()}. A scholarly space for engineering projects.</p>
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
