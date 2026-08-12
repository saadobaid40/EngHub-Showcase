import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import {
  useGetProject,
  useUpdateProject,
  getGetProjectQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Cpu,
} from "lucide-react";

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
  "Other",
] as const;

const COST_LEVELS = [
  "Low ($0–$50)",
  "Medium ($50–$200)",
  "High ($200+)",
] as const;

const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  courseName: z.string().min(1, "Please select a course"),
  teamMembers: z.string().optional(),
  componentsTags: z.string().optional(),
  costLevel: z.string().optional(),
  difficultyLevel: z.string().optional(),
  inspiredByLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  challengesText: z.string().optional(),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  reportLink: z.string().min(1, "Report link is required").url("Must be a valid URL"),
  videoLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function EditProject() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = useAuthStore((state: any) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      toast({
        title: "Login required",
        description: "You must log in to edit a project.",
      });
      setLocation(`/login?redirect=/projects/${id}/edit`);
    }
  }, [token, setLocation, toast, id]);

  const { data: project, isLoading, error } = useGetProject(id, {
    query: { enabled: !!id && !!token, queryKey: getGetProjectQueryKey(id) },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      courseName: "",
      teamMembers: "",
      componentsTags: "",
      costLevel: "",
      difficultyLevel: "",
      inspiredByLink: "",
      challengesText: "",
      imageUrl: "",
      reportLink: "",
      videoLink: "",
    },
  });

  // Populate form once the project data arrives
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title ?? "",
        description: project.description ?? "",
        courseName: project.courseName ?? "",
        teamMembers: project.teamMembers ?? "",
        componentsTags: project.componentsTags ?? "",
        costLevel: project.costLevel ?? "",
        difficultyLevel: project.difficultyLevel ?? "",
        inspiredByLink: project.inspiredByLink ?? "",
        challengesText: project.challengesText ?? "",
        imageUrl: project.imageUrl ?? "",
        reportLink: project.reportLink ?? "",
        videoLink: project.videoLink ?? "",
      });
    }
  }, [project, form]);

  const updateMutation = useUpdateProject();

  const onSubmit = (data: ProjectFormValues) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
          toast({
            title: "Project updated",
            description: "Your changes have been saved.",
          });
          setLocation(`/projects/${updated.id}`);
        },
        onError: (error: any) => {
          toast({
            title: "Update failed",
            description:
              error?.data?.error || error?.message || "An error occurred. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!token) return null;

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Project not found
        </h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          This project doesn't exist or you don't have permission to edit it.
        </p>
        <Button className="mt-8" onClick={() => setLocation("/profile")}>
          Back to Profile
        </Button>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="container mx-auto max-w-2xl px-4 space-y-6">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Back */}
        <Button
          variant="ghost"
          className="mb-6 pl-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          onClick={() => setLocation(`/projects/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to project
        </Button>

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
          <h1 className="font-serif text-4xl font-semibold text-slate-900 dark:text-slate-100">
            Edit Project
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
            Update your project details. Fields marked{" "}
            <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            data-testid="form-edit-project"
          >
            {/* ── Section 1: Core Information ── */}
            <section className="rounded-xl bg-white dark:bg-slate-900 p-7 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <FileText className="h-4 w-4 text-blue-600" />
                <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Core Information
                </h2>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Autonomous Line-Following Robot"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the problem you solved, your approach, and the outcome…"
                          className="min-h-[130px] resize-y bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        Aim for 2–3 paragraphs. Be clear and specific.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course Name */}
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Course Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            data-testid="select-course"
                          >
                            <SelectValue placeholder="Select the course…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COURSES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Team Members */}
                <FormField
                  control={form.control}
                  name="teamMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Team Members{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Jane Doe, John Smith"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-team"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        Comma-separated names of all contributors.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ── Section 2: Technical Details ── */}
            <section className="rounded-xl bg-white dark:bg-slate-900 p-7 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Cpu className="h-4 w-4 text-blue-600" />
                <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Technical Details
                </h2>
              </div>

              <div className="space-y-5">
                {/* Components & Tools */}
                <FormField
                  control={form.control}
                  name="componentsTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Components &amp; Tools Used{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Arduino, 555 Timer, Resistors, MATLAB"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-tags"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        Comma-separated. These power the component search on the Browse page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cost + Difficulty side-by-side */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="costLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">
                          Cost Level{" "}
                          <span className="text-slate-400 font-normal text-xs">
                            (optional)
                          </span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              data-testid="select-cost"
                            >
                              <SelectValue placeholder="Select…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COST_LEVELS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficultyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">
                          Difficulty{" "}
                          <span className="text-slate-400 font-normal text-xs">
                            (optional)
                          </span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              data-testid="select-difficulty"
                            >
                              <SelectValue placeholder="Select…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIFFICULTY_LEVELS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Inspired By */}
                <FormField
                  control={form.control}
                  name="inspiredByLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Inspired By{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/paper-or-project"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-inspired"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        A URL to a paper, tutorial, or project that inspired this work.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Challenges & Solutions */}
                <FormField
                  control={form.control}
                  name="challengesText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">
                        Challenges &amp; Solutions{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What didn't work the first time? How did you adapt?"
                          className="min-h-[100px] resize-y bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-challenges"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        Engineering is about iteration. Share your hurdles honestly.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ── Section 3: Media & Links ── */}
            <section className="rounded-xl bg-white dark:bg-slate-900 p-7 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <LinkIcon className="h-4 w-4 text-blue-600" />
                <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Media &amp; Links
                </h2>
              </div>

              <div className="space-y-5">
                {/* Circuit Diagram / Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Circuit Diagram / Image URL{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://…/circuit.png"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-image"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        A direct link to an image (PNG, JPG, SVG) hosted online.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Report Link */}
                <FormField
                  control={form.control}
                  name="reportLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <FileText className="h-3.5 w-3.5" />
                        Report / Documentation Link{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://docs.google.com/…"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-report"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        Link to your project report, Google Doc, or PDF.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video Link */}
                <FormField
                  control={form.control}
                  name="videoLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Demo Video Link{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/watch?v=…"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          data-testid="input-video"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400 text-xs">
                        YouTube or direct video link. Shown as an embedded player.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ── Submit ── */}
            <div className="flex items-center justify-end gap-3 pb-8">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                onClick={() => setLocation(`/projects/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-save-project"
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
