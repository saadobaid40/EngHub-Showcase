import { Router, type IRouter } from "express";
import { desc, count, sum, sql } from "drizzle-orm";
import { db, projectsTable, usersTable, commentsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/platform", async (_req, res): Promise<void> => {
  const [projectCount] = await db.select({ count: count() }).from(projectsTable);
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [commentCount] = await db.select({ count: count() }).from(commentsTable);
  const [upvoteSum] = await db.select({ total: sum(projectsTable.upvotes) }).from(projectsTable);

  res.json({
    totalProjects: projectCount?.count ?? 0,
    totalUsers: userCount?.count ?? 0,
    totalComments: commentCount?.count ?? 0,
    totalUpvotes: Number(upvoteSum?.total ?? 0),
  });
});

router.get("/stats/trending", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ project: projectsTable, username: usersTable.username })
    .from(projectsTable)
    .leftJoin(usersTable, sql`${projectsTable.userId} = ${usersTable.id}`)
    .orderBy(desc(projectsTable.upvotes))
    .limit(6);

  const projects = rows.map((r) => ({
    id: r.project.id,
    title: r.project.title,
    description: r.project.description,
    courseName: r.project.courseName ?? null,
    teamMembers: r.project.teamMembers ?? null,
    componentsTags: r.project.componentsTags ?? null,
    costLevel: r.project.costLevel ?? null,
    difficultyLevel: r.project.difficultyLevel ?? null,
    inspiredByLink: r.project.inspiredByLink ?? null,
    challengesText: r.project.challengesText ?? null,
    imageUrl: r.project.imageUrl ?? null,
    reportLink: r.project.reportLink ?? null,
    videoLink: r.project.videoLink ?? null,
    upvotes: r.project.upvotes,
    userId: r.project.userId,
    authorUsername: r.username ?? null,
    createdAt: r.project.createdAt instanceof Date
      ? r.project.createdAt.toISOString()
      : String(r.project.createdAt),
  }));

  res.json(projects);
});

router.get("/stats/courses", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      courseName: projectsTable.courseName,
      count: count(),
    })
    .from(projectsTable)
    .where(sql`${projectsTable.courseName} IS NOT NULL`)
    .groupBy(projectsTable.courseName)
    .orderBy(desc(count()));

  const result = rows.map((r) => ({
    courseName: r.courseName ?? "Unknown",
    count: r.count,
  }));

  res.json(result);
});

export default router;
