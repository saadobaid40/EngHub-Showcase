import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProjects, useGetCourseBreakdown } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
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

export default function Browse() {
  const [searchParams] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [courseFilter, setCourseFilter] = useState(urlParams.get("course_name") || "");
  const [sort, setSort] = useState<"newest" | "upvotes">((urlParams.get("sort") as any) || "newest");
  
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: projects, isLoading } = useListProjects({
    search: debouncedSearch || undefined,
    course_name: courseFilter || undefined,
    sort: sort,
  });

  const { data: courseBreakdown } = useGetCourseBreakdown();

  const getCourseCount = (courseName: string) => {
    return courseBreakdown?.find(c => c.courseName === courseName)?.count;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Course Filters */}
          <div className="lg:hidden flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 no-scrollbar">
            <button
              onClick={() => setCourseFilter("")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                courseFilter === "" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              All Projects
            </button>
            {COURSES.map(course => (
              <button
                key={course}
                onClick={() => setCourseFilter(course)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  courseFilter === course 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {course}
                {getCourseCount(course) ? <span className={`px-1.5 py-0.5 rounded-full text-xs ${courseFilter === course ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>{getCourseCount(course)}</span> : null}
              </button>
            ))}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-4 px-3">Course Categories</h2>
              <div className="space-y-0.5">
                <button
                  onClick={() => setCourseFilter("")}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-r-lg border-l-2 transition-colors flex items-center justify-between ${
                    courseFilter === "" 
                      ? "bg-blue-50 text-blue-700 border-blue-600" 
                      : "bg-transparent text-slate-700 hover:bg-slate-50 border-transparent"
                  }`}
                >
                  All Projects
                </button>
                {COURSES.map(course => {
                  const count = getCourseCount(course);
                  return (
                    <button
                      key={course}
                      onClick={() => setCourseFilter(course)}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-r-lg border-l-2 transition-colors flex items-center justify-between ${
                        courseFilter === course 
                          ? "bg-blue-50 text-blue-700 border-blue-600" 
                          : "bg-transparent text-slate-700 hover:bg-slate-50 border-transparent"
                      }`}
                    >
                      <span className="truncate pr-2">{course}</span>
                      {count ? (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${courseFilter === course ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                          {count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by component, e.g. Arduino, FPGA, Raspberry Pi…"
                  className="pl-12 h-14 text-base bg-white border-slate-200 shadow-sm rounded-xl focus-visible:ring-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {courseFilter && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 pl-3 pr-1 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Course: {courseFilter}
                      <button
                        onClick={() => setCourseFilter("")}
                        className="rounded-full p-1 hover:bg-blue-100 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant={sort === "newest" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSort("newest")}
                    className={sort === "newest" ? "bg-slate-900 text-white" : "text-slate-600 bg-white"}
                  >
                    Newest
                  </Button>
                  <Button
                    variant={sort === "upvotes" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSort("upvotes")}
                    className={sort === "upvotes" ? "bg-slate-900 text-white" : "text-slate-600 bg-white"}
                  >
                    Most Upvoted
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200/50" />
                ))}
              </div>
            ) : projects?.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-white py-24 text-center ring-1 ring-slate-200 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-medium text-slate-900">No projects found</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">We couldn't find anything matching your criteria. Try adjusting your search or resetting filters.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setCourseFilter(""); }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects?.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
