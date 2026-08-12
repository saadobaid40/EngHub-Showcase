import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateProject } from "@workspace/api-client-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Link as LinkIcon, Cpu } from "lucide-react";
import { useEffect } from "react";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(10, "Abstract must be at least 10 characters"),
  courseName: z.string().optional(),
  teamMembers: z.string().optional(),
  componentsTags: z.string().optional(),
  costLevel: z.string().optional(),
  difficultyLevel: z.string().optional(),
  inspiredByLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  challengesText: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  reportLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  videoLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function SubmitProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = useAuthStore((state: any) => state.token);
  
  useEffect(() => {
    if (!token) {
      toast({ title: "Login required", description: "You must log in to submit a project" });
      setLocation("/login");
    }
  }, [token, setLocation, toast]);

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

  const createMutation = useCreateProject();

  const onSubmit = (data: ProjectFormValues) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: (project) => {
          toast({
            title: "Project Submitted",
            description: "Your work has been added to the archive.",
          });
          setLocation(`/projects/${project.id}`);
        },
        onError: (error: any) => {
          toast({
            title: "Submission Failed",
            description: error.message || "An error occurred during submission.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" className="mb-6 pl-0 text-slate-500 hover:text-slate-900" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Button>

        <div className="mb-8 border-b border-slate-200 pb-8">
          <h1 className="font-serif text-4xl font-semibold text-slate-900">Submit Project</h1>
          <p className="mt-3 text-lg text-slate-600">
            Document your engineering work. Be thorough, honest about challenges, and proud of your solutions.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10" data-testid="form-submit-project">
            
            {/* Core Info */}
            <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="font-serif text-xl font-medium text-slate-900">Core Information</h2>
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Project Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Autonomous Mars Rover Prototype" {...field} className="bg-slate-50" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Abstract / Overview <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the problem, your approach, and the final result..." 
                          className="min-h-[150px] bg-slate-50 resize-y" 
                          {...field} 
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormDescription>Aim for 2-3 paragraphs. Be descriptive.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic Context */}
            <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Cpu className="h-5 w-5 text-blue-600" />
                <h2 className="font-serif text-xl font-medium text-slate-900">Academic Context</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Course (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ME 401, CS 350" {...field} className="bg-slate-50" data-testid="input-course" />
                      </FormControl>
                      <FormDescription>If this was a class project</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Team Members (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Doe, John Smith" {...field} className="bg-slate-50" data-testid="input-team" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 text-slate-700" data-testid="select-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Estimated Cost</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 text-slate-700" data-testid="select-cost">
                            <SelectValue placeholder="Select cost level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Under $50">Under $50</SelectItem>
                          <SelectItem value="$50 - $200">$50 - $200</SelectItem>
                          <SelectItem value="$200 - $500">$200 - $500</SelectItem>
                          <SelectItem value="$500+">$500+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="componentsTags"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-slate-700 font-medium">Components / Stack Used</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Arduino, Python, 3D Printing, OpenCV (comma separated)" {...field} className="bg-slate-50" data-testid="input-tags" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="challengesText"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-slate-700 font-medium">Challenges & Iterations</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What didn't work the first time? How did you fix it?" 
                          className="min-h-[100px] bg-slate-50" 
                          {...field} 
                          data-testid="input-challenges"
                        />
                      </FormControl>
                      <FormDescription>Engineering is about solving problems. Share your hurdles.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Media & Links */}
            <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <LinkIcon className="h-5 w-5 text-blue-600" />
                <h2 className="font-serif text-xl font-medium text-slate-900">Media & Resources</h2>
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                        <ImageIcon className="h-4 w-4" /> Cover Image URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} className="bg-slate-50" data-testid="input-image" />
                      </FormControl>
                      <FormDescription>A high-quality photo of your completed project.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reportLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Full Report / Documentation URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} className="bg-slate-50" data-testid="input-report" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Video Demo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/..." {...field} className="bg-slate-50" data-testid="input-video" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="ghost" className="mr-4" onClick={() => setLocation("/projects")}>
                Cancel
              </Button>
              <Button type="submit" size="lg" className="min-w-[150px]" disabled={createMutation.isPending} data-testid="button-submit">
                {createMutation.isPending ? "Submitting..." : "Publish to Archive"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
