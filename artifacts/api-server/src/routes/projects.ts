import { Router, type IRouter } from "express";
import { eq, desc, ilike, or, sql } from "drizzle-orm";
import { db, projectsTable, usersTable } from "@workspace/db";
import {
  ListProjectsQueryParams,
  CreateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
  UpvoteProjectParams,
} from "@workspace/api-zod";
import { getUserIdFromRequest } from "./users";

const router: IRouter = Router();

function formatProject(p: any, authorUsername: string | null) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    courseName: p.courseName ?? null,
    teamMembers: p.teamMembers ?? null,
    componentsTags: p.componentsTags ?? null,
    costLevel: p.costLevel ?? null,
    difficultyLevel: p.difficultyLevel ?? null,
    inspiredByLink: p.inspiredByLink ?? null,
    challengesText: p.challengesText ?? null,
    imageUrl: p.imageUrl ?? null,
    reportLink: p.reportLink ?? null,
    videoLink: p.videoLink ?? null,
    upvotes: p.upvotes,
    userId: p.userId,
    authorUsername: authorUsername ?? null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

router.get("/projects", async (req, res): Promise<void> => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { course_name, difficulty_level, cost_level, search, sort } = parsed.data;

  let query = db
    .select({
      project: projectsTable,
      username: usersTable.username,
    })
    .from(projectsTable)
    .leftJoin(usersTable, eq(projectsTable.userId, usersTable.id))
    .$dynamic();

  const conditions: any[] = [];
  if (course_name) conditions.push(eq(projectsTable.courseName, course_name));
  if (difficulty_level) conditions.push(eq(projectsTable.difficultyLevel, difficulty_level));
  if (cost_level) conditions.push(eq(projectsTable.costLevel, cost_level));
  if (search) {
    conditions.push(
      or(
        ilike(projectsTable.title, `%${search}%`),
        ilike(projectsTable.description, `%${search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`);
  }

  if (sort === "upvotes") {
    query = query.orderBy(desc(projectsTable.upvotes));
  } else {
    query = query.orderBy(desc(projectsTable.createdAt));
  }

  const rows = await query;
  const projects = rows.map((r) => formatProject(r.project, r.username));
  res.json(projects);
});

router.post("/projects", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({ ...parsed.data, userId })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  req.log.info({ projectId: project.id }, "Project created");
  res.status(201).json(formatProject(project, user?.username ?? null));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ project: projectsTable, username: usersTable.username })
    .from(projectsTable)
    .leftJoin(usersTable, eq(projectsTable.userId, usersTable.id))
    .where(eq(projectsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(formatProject(row.project, row.username));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set(parsed.data)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json(formatProject(updated, user?.username ?? null));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/projects/:id/upvote", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = UpvoteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set({ upvotes: existing.upvotes + 1 })
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId));
  res.json(formatProject(updated, user?.username ?? null));
});

export default router;
