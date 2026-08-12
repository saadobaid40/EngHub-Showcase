import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useListProjects,
  useDeleteProject,
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { Pencil, Trash2, Plus, Cpu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = useAuthStore((state: any) => state.token);
  const queryClient = useQueryClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      toast({ title: "Login required", description: "Please log in to view your profile." });
      setLocation("/login?redirect=/profile");
    }
  }, [token]);

  const { data: user } = useGetCurrentUser({
    query: { enabled: !!token, retry: false, queryKey: getGetCurrentUserQueryKey() },
  });

  const { data: allProjects, isLoading } = useListProjects({});

  // Filter to only this user's projects, client-side
  const myProjects = allProjects?.filter((p) => p.userId === user?.id) ?? [];

  const deleteProjectMutation = useDeleteProject();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    deleteProjectMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Project deleted" });
          queryClient.invalidateQueries();
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Delete failed", variant: "destructive" });
          setDeletingId(null);
        },
      }
    );
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container mx-auto max-w-5xl px-4">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-sm">
              {user?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <h1 className="font-serif text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {user?.username ?? "My Profile"}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit New Project
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
            <p className="font-serif text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {isLoading ? "—" : myProjects.length}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">Projects</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
            <p className="font-serif text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {isLoading ? "—" : myProjects.reduce((acc, p) => acc + p.upvotes, 0)}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">Total Upvotes</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center col-span-2 sm:col-span-1">
            <p className="font-serif text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {isLoading ? "—" : new Set(myProjects.map((p) => p.courseName).filter(Boolean)).size}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">Courses</p>
          </div>
        </div>

        {/* Projects list */}
        <h2 className="mb-6 font-serif text-2xl font-semibold text-slate-900 dark:text-slate-100">
          My Projects
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : myProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-20 text-center">
            <Cpu className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h3 className="font-serif text-xl font-medium text-slate-900 dark:text-slate-100">No projects yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Document your engineering work and share it with the community.
            </p>
            <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/submit">Submit Your First Project</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:flex-row sm:items-center"
              >
                {/* Thumbnail */}
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Cpu className="h-7 w-7 opacity-40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {project.courseName && (
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                        {project.courseName}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="block font-serif text-lg font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {project.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {project.upvotes} upvote{project.upvotes !== 1 ? "s" : ""}
                    {project.difficultyLevel ? ` · ${project.difficultyLevel}` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Link href={`/projects/${project.id}`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    disabled={deletingId === project.id}
                    onClick={() => handleDelete(project.id, project.title)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {deletingId === project.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
