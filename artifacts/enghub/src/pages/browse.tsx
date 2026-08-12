import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Cpu, ArrowUpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Browse() {
  const [searchParams] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [courseFilter, setCourseFilter] = useState(urlParams.get("course_name") || "");
  const [sort, setSort] = useState<"newest" | "upvotes">((urlParams.get("sort") as any) || "newest");
  
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  // Custom simple debounce
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  });

  const { data: projects, isLoading } = useListProjects({
    search: debouncedSearch || undefined,
    course_name: courseFilter || undefined,
    sort: sort,
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-semibold text-slate-900">Project Archive</h1>
          <p className="mt-4 text-lg text-slate-600">Browse the collective engineering works.</p>
        </div>

        {/* Filters & Search */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search projects by title or description..."
              className="pl-10 bg-slate-50 border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={sort === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("newest")}
              className="whitespace-nowrap"
              data-testid="button-sort-newest"
            >
              Newest
            </Button>
            <Button
              variant={sort === "upvotes" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("upvotes")}
              className="whitespace-nowrap"
              data-testid="button-sort-upvotes"
            >
              Most Upvoted
            </Button>
            {courseFilter && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCourseFilter("")}
                className="whitespace-nowrap ml-2 text-blue-700 bg-blue-100 hover:bg-blue-200"
                data-testid="button-clear-course"
              >
                Clear Course: {courseFilter}
              </Button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-24 text-center ring-1 ring-slate-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-slate-900">No projects found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your search or filters.</p>
            <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setCourseFilter(""); }} data-testid="button-reset-filters">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="group block h-full" data-testid={`link-project-${project.id}`}>
                <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                        <Cpu className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {project.courseName || 'Independent'}
                      </span>
                      {project.difficultyLevel && (
                        <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          {project.difficultyLevel}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-medium text-slate-900 line-clamp-1">{project.title}</h3>
                    <p className="mb-6 text-sm text-slate-600 line-clamp-2 flex-1">{project.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-medium">
                          {project.authorUsername?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="ml-1 text-xs font-medium truncate max-w-[100px]">{project.authorUsername}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                          <ArrowUpCircle className="h-4 w-4" />
                          {project.upvotes}
                        </span>
                        <span>{formatDistanceToNow(new Date(project.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
