import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { 
  useGetProject, 
  useUpvoteProject,
  useDeleteProject,
  useListComments, 
  useCreateComment,
  useDeleteComment,
  useGetCurrentUser
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getGetProjectQueryKey, getListCommentsQueryKey, getGetCurrentUserQueryKey } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, ArrowUpCircle, ExternalLink, Video, 
  FileText, Users, Tag, AlertTriangle, BookOpen, Clock, 
  Link as LinkIcon, Trash2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = useAuthStore((state: any) => state.token);
  
  const [commentText, setCommentText] = useState("");

  const { data: user } = useGetCurrentUser({
    query: { enabled: !!token, retry: false, queryKey: getGetCurrentUserQueryKey() }
  });

  const { data: project, isLoading: isProjectLoading, error: projectError } = useGetProject(id, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) }
  });

  const { data: comments, isLoading: isCommentsLoading } = useListComments(id, {
    query: { enabled: !!id, queryKey: getListCommentsQueryKey(id) }
  });

  const upvoteMutation = useUpvoteProject();
  const commentMutation = useCreateComment();
  const deleteProjectMutation = useDeleteProject();
  const deleteCommentMutation = useDeleteComment();

  if (projectError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-semibold text-slate-900">Project Not Found</h2>
        <p className="mt-4 text-slate-600">The project you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-8" onClick={() => setLocation("/projects")}>Return to Browse</Button>
      </div>
    );
  }

  if (isProjectLoading || !project) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-32 bg-slate-200 animate-pulse rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 w-3/4 bg-slate-200 animate-pulse rounded"></div>
            <div className="aspect-video w-full bg-slate-200 animate-pulse rounded-xl"></div>
            <div className="h-32 w-full bg-slate-200 animate-pulse rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 w-full bg-slate-200 animate-pulse rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpvote = () => {
    if (!token) {
      toast({
        title: "Login Required",
        description: "You must be logged in to upvote projects.",
      });
      setLocation("/login");
      return;
    }
    
    upvoteMutation.mutate({ id }, {
      onSuccess: (updatedProject) => {
        queryClient.setQueryData(getGetProjectQueryKey(id), updatedProject);
        toast({
          title: "Upvoted!",
          description: "Thanks for supporting fellow engineers.",
        });
      }
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Login Required",
        description: "You must be logged in to comment.",
      });
      setLocation("/login");
      return;
    }

    if (!commentText.trim()) return;

    commentMutation.mutate({ id, data: { text: commentText } }, {
      onSuccess: () => {
        setCommentText("");
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(id) });
        toast({
          title: "Comment posted",
        });
      }
    });
  };

  const handleDeleteProject = () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    deleteProjectMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Project deleted" });
        setLocation("/projects");
      }
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    deleteCommentMutation.mutate({ id: commentId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(id) });
        toast({ title: "Comment deleted" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" className="mb-6 pl-0 text-slate-500 hover:text-slate-900" onClick={() => setLocation("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to projects
        </Button>

        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {project.courseName || 'Independent Work'}
              </span>
              {project.difficultyLevel && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                  {project.difficultyLevel}
                </span>
              )}
              {project.costLevel && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  {project.costLevel}
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl font-semibold text-slate-900 md:text-5xl" data-testid="text-project-title">
              {project.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-900">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">
                  {project.authorUsername?.charAt(0).toUpperCase()}
                </div>
                {project.authorUsername}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              </span>
              {user && user.id === project.userId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-1 text-red-600 hover:bg-red-50 hover:text-red-700 ml-auto md:ml-0" 
                  onClick={handleDeleteProject}
                  disabled={deleteProjectMutation.isPending}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Project
                </Button>
              )}
            </div>
          </div>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="flex items-center gap-2 rounded-full border-2 hover:bg-slate-50 md:min-w-[140px]"
            onClick={handleUpvote}
            disabled={upvoteMutation.isPending}
            data-testid="button-upvote"
          >
            <ArrowUpCircle className={`h-6 w-6 ${upvoteMutation.isPending ? 'text-slate-400' : 'text-blue-600'}`} />
            <span className="text-lg font-medium">{project.upvotes}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {project.imageUrl && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full object-cover max-h-[600px]"
                  data-testid="img-project-hero"
                />
              </div>
            )}

            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">Abstract & Overview</h2>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed" data-testid="text-project-description">
                {project.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>

            {project.challengesText && (
              <section className="rounded-xl bg-orange-50/50 p-8 ring-1 ring-orange-100">
                <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-semibold text-slate-900">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  Challenges & Iterations
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700">
                  {project.challengesText.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>
            )}

            {/* Comments Section */}
            <section className="pt-8 border-t border-slate-200">
              <h2 className="mb-6 font-serif text-2xl font-semibold text-slate-900">Discussion ({comments?.length || 0})</h2>
              
              {token ? (
                <form onSubmit={handleComment} className="mb-8 flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="Add a scholarly observation or question..." 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="bg-white"
                      data-testid="input-comment"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={commentMutation.isPending || !commentText.trim()} size="sm" data-testid="button-submit-comment">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 rounded-lg bg-slate-100 p-4 text-center text-sm text-slate-600">
                  <Link href="/login" className="font-medium text-blue-600 hover:underline">Log in</Link> to join the discussion.
                </div>
              )}

              <div className="space-y-6">
                {isCommentsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-16 bg-slate-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments?.length === 0 ? (
                  <p className="text-slate-500 italic">No comments yet. Be the first to start the discussion.</p>
                ) : (
                  comments?.map(comment => (
                    <div key={comment.id} className="flex gap-4" data-testid={`comment-${comment.id}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-medium">
                        {comment.authorUsername?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-slate-900">{comment.authorUsername}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                            {user && user.id === comment.userId && (
                              <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                                disabled={deleteCommentMutation.isPending}
                                title="Delete comment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-4 font-serif text-xl font-semibold text-slate-900">Project Details</h3>
              
              <dl className="space-y-4 text-sm">
                {project.teamMembers && (
                  <div>
                    <dt className="flex items-center gap-2 font-medium text-slate-500 mb-1">
                      <Users className="h-4 w-4" /> Team Members
                    </dt>
                    <dd className="text-slate-900 leading-relaxed">{project.teamMembers}</dd>
                  </div>
                )}
                
                {project.componentsTags && (
                  <div>
                    <dt className="flex items-center gap-2 font-medium text-slate-500 mb-2">
                      <Tag className="h-4 w-4" /> Components / Stack
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {project.componentsTags.split(',').map((tag, i) => (
                        <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {tag.trim()}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              
              {(project.reportLink || project.videoLink || project.inspiredByLink) && (
                <>
                  <Separator className="my-6" />
                  <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">Resources</h3>
                  <div className="space-y-3">
                    {project.reportLink && (
                      <a href={project.reportLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors group">
                        <div className="rounded-md bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Full Report</p>
                          <p className="text-xs text-slate-500">PDF or Document</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                      </a>
                    )}
                    {project.videoLink && (
                      <a href={project.videoLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors group">
                        <div className="rounded-md bg-red-50 p-2 text-red-600 group-hover:bg-red-100">
                          <Video className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Demo Video</p>
                          <p className="text-xs text-slate-500">Watch the project</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                      </a>
                    )}
                    {project.inspiredByLink && (
                      <a href={project.inspiredByLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors group">
                        <div className="rounded-md bg-slate-100 p-2 text-slate-600 group-hover:bg-slate-200">
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Inspired By</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">{project.inspiredByLink}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
