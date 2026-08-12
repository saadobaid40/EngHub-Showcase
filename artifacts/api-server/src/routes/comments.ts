import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, commentsTable, usersTable } from "@workspace/db";
import {
  ListCommentsParams,
  CreateCommentParams,
  CreateCommentBody,
  DeleteCommentParams,
} from "@workspace/api-zod";
import { getUserIdFromRequest } from "./users";

const router: IRouter = Router();

router.get("/projects/:id/comments", async (req, res): Promise<void> => {
  const params = ListCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({ comment: commentsTable, username: usersTable.username })
    .from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.projectId, params.data.id))
    .orderBy(desc(commentsTable.createdAt));

  const comments = rows.map((r) => ({
    id: r.comment.id,
    text: r.comment.text,
    userId: r.comment.userId,
    projectId: r.comment.projectId,
    authorUsername: r.username ?? null,
    createdAt: r.comment.createdAt instanceof Date
      ? r.comment.createdAt.toISOString()
      : String(r.comment.createdAt),
  }));

  res.json(comments);
});

router.post("/projects/:id/comments", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = CreateCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({ text: parsed.data.text, userId, projectId: params.data.id })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  req.log.info({ commentId: comment.id }, "Comment created");
  res.status(201).json({
    id: comment.id,
    text: comment.text,
    userId: comment.userId,
    projectId: comment.projectId,
    authorUsername: user?.username ?? null,
    createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : String(comment.createdAt),
  });
});

router.delete("/comments/:id", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = DeleteCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
