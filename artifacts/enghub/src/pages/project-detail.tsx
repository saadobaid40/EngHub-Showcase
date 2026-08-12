import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import {
  useGetProject,
  useUpvoteProject,
  useDeleteProject,
  useListComments,
  useCreateComment,
  useDeleteComment,
  useGetCurrentUser,
  getGetProjectQueryKey,
  getListCommentsQueryKey,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  FileText,
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Cpu,
  Link as LinkIcon,
  Trash2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/** Extract a YouTube video ID from any common YouTube URL format */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // youtube.com/embed/VIDEO_ID (already embedded)
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProjectDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = useAuthStore((state: any) => state.token);

  const [commentText, setCommentText] = useState("");

  const { data: user } = useGetCurrentUser({
    query: { enabled: !!token, retry: false, queryKey: getGetCurrentUserQueryKey() },
  });

  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProject(id, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) },
  });

  const { data: comments, isLoading: isCommentsLoading } = useListComments(id, {
    query: { enabled: !!id, queryKey: getListCommentsQueryKey(id) },
  });

  const upvoteMutation = useUpvoteProject();
  const commentMutation = useCreateComment();
  const deleteProjectMutation = useDeleteProject();
  const deleteCommentMutation = useDeleteComment();

  /* ── Handlers ─────────────────────────────────────────── */

  const handleUpvote = () => {
    if (!token) {
      toast({ title: "Login required", description: "Log in to upvote projects." });
      setLocation("/login");
      return;
    }
    upvoteMutation.mutate(
      { id },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetProjectQueryKey(id), updated);
          toast({ title: "Upvoted!", description: "Thanks for supporting this project." });
        },
      }
    );
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Login required", description: "Log in to comment." });
      setLocation("/login");
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(
      { id, data: { text: commentText } },
      {
        onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(id) });
        },
      }
    );
  };

  const handleDeleteProject = () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    deleteProjectMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Project deleted" });
          setLocation("/projects");
        },
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    deleteCommentMutation.mutate(
      { id: commentId },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(id) }),
      }
    );
  };

  /* ── Loading / error states ───────────────────────────── */

  if (projectError) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-semibold text-slate-900">Project not found</h2>
        <p className="mt-4 text-slate-500">
          This project doesn't exist or has been removed from the archive.
        </p>
        <Button className="mt-8" onClick={() => setLocation("/projects")}>
          Back to Browse
        </Button>
      </div>
    );
  }

  if (isProjectLoading || !project) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mb-8 aspect-video w-full animate-pulse rounded-2xl bg-slate-200" />
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="h-10 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-32 animate-pulse rounded bg-slate-200" />
              <div className="h-20 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = project.videoLink ? getYouTubeEmbedUrl(project.videoLink) : null;
  const isOwner = user && user.id === project.userId;

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Hero image ──────────────────────────────────── */}
      {project.imageUrl && (
        <div className="w-full overflow-hidden bg-slate-100 lg:max-h-[480px]">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover"
            data-testid="img-project-hero"
          />
        </div>
      )}

      <div className="container mx-auto max-w-5xl px-4 pt-8">

        {/* ── Back nav ────────────────────────────────────── */}
        <Button
          variant="ghost"
          className="mb-6 pl-0 text-slate-500 hover:text-slate-900"
          onClick={() => setLocation("/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        {/* ── Title + badges + upvote row ─────────────────── */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {project.courseName || "Independent Work"}
              </span>
              {project.difficultyLevel && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  {project.difficultyLevel}
                </span>
              )}
              {project.costLevel && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {project.costLevel}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="font-serif text-4xl font-semibold leading-tight text-slate-900 md:text-5xl"
              data-testid="text-project-title"
            >
              {project.title}
            </h1>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold text-slate-700">
                  {project.authorUsername?.charAt(0).toUpperCase()}
                </div>
                {project.authorUsername}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              </span>
              {isOwner && (
                <button
                  onClick={handleDeleteProject}
                  disabled={deleteProjectMutation.isPending}
                  className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 sm:ml-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete project
                </button>
              )}
            </div>
          </div>

          {/* ── Upvote button ── */}
          <button
            onClick={handleUpvote}
            disabled={upvoteMutation.isPending}
            data-testid="button-upvote"
            className="group flex shrink-0 flex-col items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 shadow-sm transition hover:border-blue-400 hover:shadow-md disabled:opacity-60"
          >
            <ArrowUp
              className="h-6 w-6 text-slate-400 transition group-hover:text-blue-600"
              strokeWidth={2.5}
            />
            <span className="text-2xl font-bold leading-none text-slate-800">
              {project.upvotes}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 group-hover:text-blue-500">
              Upvote
            </span>
          </button>
        </div>

        <Separator className="mb-10" />

        {/* ── Two-column body ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* ── Main column ─────────────────────────────── */}
          <div className="space-y-10 lg:col-span-2">

            {/* Description */}
            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">
                Description
              </h2>
              <div
                className="prose prose-slate max-w-none leading-relaxed text-slate-700"
                data-testid="text-project-description"
              >
                {project.description.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* Challenges */}
            {project.challengesText && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="mb-3 font-serif text-xl font-semibold text-slate-900">
                  Challenges &amp; Solutions
                </h2>
                <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
                  {project.challengesText.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Demo video embed */}
            {embedUrl && (
              <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">
                  Demo Video
                </h2>
                <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200">
                  <div className="aspect-video w-full bg-slate-100">
                    <iframe
                      src={embedUrl}
                      title="Demo video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* View Full Report CTA */}
            {project.reportLink && (
              <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">
                  Full Report
                </h2>
                <a
                  href={project.reportLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-6 py-4 text-blue-800 shadow-sm transition hover:bg-blue-100 hover:shadow-md"
                  data-testid="link-report"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">View Full Report</p>
                    <p className="text-xs text-blue-600">PDF / Document</p>
                  </div>
                  <ExternalLink className="ml-2 h-4 w-4 text-blue-400" />
                </a>
              </section>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-5 font-serif text-lg font-semibold text-slate-900">
                Project Details
              </h3>

              <dl className="space-y-5 text-sm">

                {/* Course */}
                <div>
                  <dt className="mb-1 flex items-center gap-2 font-medium text-slate-400 uppercase tracking-wider text-xs">
                    <BookOpen className="h-3.5 w-3.5" /> Course
                  </dt>
                  <dd className="font-medium text-slate-800">
                    {project.courseName || "Independent Work"}
                  </dd>
                </div>

                {/* Team Members */}
                {project.teamMembers && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 font-medium text-slate-400 uppercase tracking-wider text-xs">
                      <Users className="h-3.5 w-3.5" /> Team Members
                    </dt>
                    <dd className="text-slate-700 leading-relaxed">
                      {project.teamMembers}
                    </dd>
                  </div>
                )}

                {/* Cost */}
                {project.costLevel && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 font-medium text-slate-400 uppercase tracking-wider text-xs">
                      <DollarSign className="h-3.5 w-3.5" /> Estimated Cost
                    </dt>
                    <dd className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      {project.costLevel}
                    </dd>
                  </div>
                )}

                {/* Difficulty */}
                {project.difficultyLevel && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 font-medium text-slate-400 uppercase tracking-wider text-xs">
                      <BarChart3 className="h-3.5 w-3.5" /> Difficulty
                    </dt>
                    <dd className="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {project.difficultyLevel}
                    </dd>
                  </div>
                )}

                {/* Components */}
                {project.componentsTags && (
                  <div>
                    <dt className="mb-2 flex items-center gap-2 font-medium text-slate-400 uppercase tracking-wider text-xs">
                      <Cpu className="h-3.5 w-3.5" /> Components &amp; Tools
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {project.componentsTags.split(",").map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {/* Inspired By */}
                {project.inspiredByLink && (
                  <div>
                    <dt className="mb-1 flex items-center gap-2 font-medium text-slate-400 uppercase tracking-wider text-xs">
                      <LinkIcon className="h-3.5 w-3.5" /> Inspired By
                    </dt>
                    <dd>
                      <a
                        href={project.inspiredByLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs break-all"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {project.inspiredByLink}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Extra resource links (video when no embed possible) */}
              {project.videoLink && !embedUrl && (
                <>
                  <Separator className="my-5" />
                  <a
                    href={project.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    Watch Demo Video
                  </a>
                </>
              )}
            </div>
          </aside>
        </div>

        {/* ── Comments section (full width below columns) ── */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-8 flex items-center gap-2 font-serif text-2xl font-semibold text-slate-900">
            <MessageSquare className="h-6 w-6 text-slate-400" />
            Discussion
            <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-500">
              {comments?.length ?? 0}
            </span>
          </h2>

          {/* Comment input */}
          {token ? (
            <form onSubmit={handleComment} className="mb-10">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Leave a question, observation, or suggestion for the team…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="resize-none bg-white border-slate-200 text-sm focus-visible:ring-blue-500"
                    data-testid="input-comment"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={commentMutation.isPending || !commentText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-submit-comment"
                    >
                      {commentMutation.isPending ? "Posting…" : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-10 rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center">
              <p className="text-sm text-slate-500">
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                  Log in
                </Link>{" "}
                to join the discussion.
              </p>
            </div>
          )}

          {/* Comment list */}
          {isCommentsLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments?.length === 0 ? (
            <p className="text-sm italic text-slate-400">
              No comments yet. Be the first to start the discussion.
            </p>
          ) : (
            <div className="space-y-5">
              {comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3"
                  data-testid={`comment-${comment.id}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                    {comment.authorUsername?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {comment.authorUsername}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {user && user.id === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="text-slate-300 transition hover:text-red-500"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
