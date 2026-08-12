import { useState } from "react";
import { useGetPlatformStats, useListProjects, useGetCourseBreakdown } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Cpu, FileText, ChevronRight } from "lucide-react";
import { ProjectCard } from "@/components/project-card";

const COURSES = [
  "Creativity in Engineering Design",
  "Digital Logic Design",
  "Electronics",
  "Electromagnetic Field Theory",
  "Signals and Systems",
  "Electrical Power System",
  "Communication Theory",
  "Microprocessor",
  "Senior Design Project (SDP)",
  "Control Theory",
  "Other"
];

export default function Home() {
  const [trendingSort, setTrendingSort] = useState<"newest" | "upvotes">("upvotes");
  
  const { data: stats } = useGetPlatformStats();
  const { data: listProjectsData } = useListProjects({ sort: trendingSort });
  const { data: courseBreakdown } = useGetCourseBreakdown();

  const trending = listProjectsData?.slice(0, 4) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white sm:py-32">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-4xl font-serif text-5xl font-medium tracking-tight sm:text-7xl">
            A Scholarly Showcase for <br className="hidden sm:block" />
            Engineering Projects
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Discover, share, and celebrate academic and personal engineering work. 
            From robotics to thermodynamics, an organized archive of what students build.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-blue-600 text-white hover:bg-blue-700 px-8 text-base shadow-lg">
              <Link href="/projects" data-testid="link-hero-browse">
                Browse Archive
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-slate-700 bg-transparent text-white hover:bg-slate-800 hover:text-white px-8 text-base">
              <Link href="/submit" data-testid="link-hero-submit">
                Submit Work <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <p className="text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100" data-testid="stat-projects">
                {stats?.totalProjects ?? "—"}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Projects</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100" data-testid="stat-users">
                {stats?.totalUsers ?? "—"}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Engineers</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100" data-testid="stat-courses">
                {courseBreakdown?.length ?? "—"}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Courses</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100" data-testid="stat-upvotes">
                {stats?.totalUpvotes ?? "—"}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Upvotes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-slate-50 dark:bg-slate-950 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            
            {/* Trending Projects Grid */}
            <div className="lg:col-span-2">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-slate-100">Trending Work</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={trendingSort === "newest" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrendingSort("newest")}
                      className={trendingSort === "newest" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 dark:border-slate-800"}
                    >
                      Newest
                    </Button>
                    <Button
                      variant={trendingSort === "upvotes" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrendingSort("upvotes")}
                      className={trendingSort === "upvotes" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 dark:border-slate-800"}
                    >
                      Most Upvoted
                    </Button>
                  </div>
                </div>
                <Link href="/projects" className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" data-testid="link-view-all">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {trending?.map((project) => (
                  <ProjectCard key={project.id} project={project as any} />
                ))}
                
                {trending.length === 0 && (
                  <div className="col-span-2 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                    <p className="text-slate-500 dark:text-slate-400">No trending projects yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar / Course Breakdown */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <h3 className="mb-6 font-serif text-2xl font-semibold text-slate-900 dark:text-slate-100">Course Index</h3>
                <div className="space-y-1">
                  {COURSES.map((course) => {
                    const count = courseBreakdown?.find(c => c.courseName === course)?.count;
                    return (
                      <Link 
                        href={`/projects?course_name=${encodeURIComponent(course)}`} 
                        key={course}
                        className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                        data-testid={`link-course-${course}`}
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{course}</span>
                        {count ? (
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">{count}</span>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-8 rounded-xl bg-slate-900 dark:bg-slate-800 p-6 text-white shadow-sm ring-1 ring-slate-800 dark:ring-slate-700">
                <h3 className="mb-2 font-serif text-xl font-medium">Join the Archive</h3>
                <p className="mb-4 text-sm text-slate-300 dark:text-slate-400">
                  Document your engineering journey, share schematics, and get feedback from peers.
                </p>
                <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/register" data-testid="link-sidebar-register">Create Account</Link>
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
