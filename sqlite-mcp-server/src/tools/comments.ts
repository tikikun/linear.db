import type { Tool } from "./base.js";
import { query, getOne, run } from "../db.js";
import { success, getUserId, getIssueId } from "./base.js";

export function getCommentTools(): Tool[] {
  return [
    {
      name: "list_comments",
      description: "List comments for an issue",
      inputSchema: { type: "object", properties: { issueId: { type: "string" } }, required: ["issueId"] },
    },
    {
      name: "create_comment",
      description: "Add a comment to an issue",
      inputSchema: { type: "object", properties: { issueId: { type: "string" }, body: { type: "string" }, parentId: { type: "string" } }, required: ["issueId", "body"] },
    },
    {
      name: "update_comment",
      description: "Update a comment",
      inputSchema: { type: "object", properties: { id: { type: "string" }, body: { type: "string" } }, required: ["id"] },
    },
    {
      name: "delete_comment",
      description: "Delete a comment",
      inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
  ];
}

export function registerCommentTools(registerHandler: (name: string, handler: (args: any) => Promise<any>) => void) {
  registerHandler("list_comments", async (args) => {
    const issueId = await getIssueId(args.issueId);
    if (!issueId) return { success: false, error: "Issue not found" };
    const comments = await query(`SELECT c.*, u.name as user_name, u.email as user_email FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.issue_id = ? ORDER BY c.created_at ASC`, [issueId]);
    return success(comments);
  });

  registerHandler("create_comment", async (args) => {
    const issueId = await getIssueId(args.issueId);
    if (!issueId) return { success: false, error: "Issue not found" };
    const userId = await getUserId("me");
    const id = `comment_${Date.now()}`;
    await run("INSERT INTO comments (id, body, issue_id, user_id, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      [id, args.body, issueId, userId, args.parentId || null]);
    const comment = await getOne("SELECT c.*, u.name as user_name FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?", [id]);
    return success(comment);
  });

  registerHandler("update_comment", async (args) => {
    const comment = await getOne("SELECT * FROM comments WHERE id = ?", [args.id]);
    if (!comment) return { success: false, error: "Comment not found" };
    await run("UPDATE comments SET body = ?, updated_at = datetime('now') WHERE id = ?", [args.body, args.id]);
    const updated = await getOne("SELECT c.*, u.name as user_name FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?", [args.id]);
    return success(updated);
  });

  registerHandler("delete_comment", async (args) => {
    await run("DELETE FROM comments WHERE id = ?", [args.id]);
    return success({ deleted: true });
  });
}