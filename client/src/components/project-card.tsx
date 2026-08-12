import { Link, useLocation } from "wouter";
import { Cpu, ArrowUpCircle } from "lucide-react";
import type { Project as ListProjectsResponseItem } from "@workspace/api-client-react";

interface ProjectCardProps {
  project: ListProjectsResponseItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [, setLocation] = useLocation();
  const tags = project.componentsTags ? project.componentsTags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const displayTags = tags.slice(0, 4);
  const extraTagsCount = tags.length - 4;

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation('/projects?search=' + encodeURIComponent(tag));
  };

  return (
    <Link href={`/projects/${project.id}`} className="group block h-full w-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-all hover:shadow-md hover:ring-slate-300 dark:hover:ring-slate-700">
        <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
          {project.imageUrl ? (
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Cpu className="h-12 w-12 opacity-50" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start">
            <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              {project.courseName || 'Independent'}
            </span>
          </div>
          <h3 className="mb-3 font-serif text-lg font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{project.title}</h3>
          
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {displayTags.map((tag, i) => (
                <button 
                  key={i} 
                  onClick={(e) => handleTagClick(e, tag)}
                  className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
              {extraTagsCount > 0 && (
                <span className="rounded-md bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  +{extraTagsCount} more
                </span>
              )}
            </div>
          )}
          
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
                {project.authorUsername?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-xs font-medium truncate max-w-[120px]">{project.authorUsername || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <ArrowUpCircle className="h-4 w-4" />
              <span>{project.upvotes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
