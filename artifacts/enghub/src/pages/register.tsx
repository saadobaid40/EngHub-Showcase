import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // We don't automatically log in after registration in this flow,
  // we just redirect to login page. Or we can log them in if the API returns a token.
  // Wait, the API spec says `registerUser` returns `UserProfile`, not `AuthResponse`.
  // So we must redirect to login.

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useRegisterUser();

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({
            title: "Account Created",
            description: "Welcome to the archive! Please log in to continue.",
          });
          setLocation("/login");
        },
        onError: (error: any) => {
          toast({
            title: "Registration Failed",
            description: error.message || "An error occurred during registration.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h2 className="mt-2 text-center font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Join the Archive
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500" data-testid="link-to-login">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm ring-1 ring-slate-200 sm:rounded-xl sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-register">
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} className="bg-slate-50" data-testid="input-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="student@university.edu" {...field} className="bg-slate-50" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="bg-slate-50" data-testid="input-password" />
                    </FormControl>
                    <FormDescription>At least 6 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-submit-register">
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
