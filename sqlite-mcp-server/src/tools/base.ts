import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { query, getOne, run } from "../db.js";

// Define Tool type for MCP 1.0
export type Tool = {
  name: string;
  description: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, any>;
    required?: string[];
  };
};

export function success(data: any) {
  return { success: true, data };
}

export function error(message: string) {
  return { success: false, error: message };
}

export async function getTeamId(team: string): Promise<string | null> {
  if (!team) return null;
  const result = await getOne<{id: string}>(
    `SELECT id FROM teams WHERE id = ? OR name = ? OR key = ?`,
    [team, team, team]
  );
  return result?.id || null;
}

export async function getUserId(user: string): Promise<string | null> {
  if (!user) return null;
  if (user === 'me') {
    const me = await getOne<{id: string}>(`SELECT id FROM users LIMIT 1`);
    return me?.id || null;
  }
  const result = await getOne<{id: string}>(
    `SELECT id FROM users WHERE id = ? OR email = ? OR name = ?`,
    [user, user, user]
  );
  return result?.id || null;
}

export async function getProjectId(project: string, teamId?: string): Promise<string | null> {
  if (!project) return null;
  let sql = `SELECT id FROM projects WHERE id = ? OR name = ?`;
  const params: any[] = [project, project];
  if (teamId) {
    sql += ` AND team_id = ?`;
    params.push(teamId);
  }
  const result = await getOne<{id: string}>(sql, params);
  return result?.id || null;
}

export async function getIssueId(issue: string): Promise<string | null> {
  if (!issue) return null;
  const result = await getOne<{id: string}>(
    `SELECT id FROM issues WHERE id = ? OR identifier = ?`,
    [issue, issue]
  );
  return result?.id || null;
}

export async function getLabelId(label: string, teamId?: string): Promise<string | null> {
  if (!label) return null;
  let sql = `SELECT id FROM labels WHERE id = ? OR name = ?`;
  const params: any[] = [label, label];
  if (teamId) {
    sql += ` AND (team_id = ? OR team_id IS NULL)`;
    params.push(teamId);
  }
  const result = await getOne<{id: string}>(sql, params);
  return result?.id || null;
}

export async function generateIssueIdentifier(teamId: string): Promise<string> {
  const team = await getOne<{key: string}>(`SELECT key FROM teams WHERE id = ?`, [teamId]);
  const key = team?.key || 'ISS';
  const count = await query<{cnt: number}>(`SELECT COUNT(*) as cnt FROM issues WHERE team_id = ?`, [teamId]);
  const num = (count[0]?.cnt || 0) + 1;
  return `${key}-${num}`;
}

const PRIORITY_MAP: Record<number, string> = {
  1: 'prio_urgent', 2: 'prio_high', 3: 'prio_normal', 4: 'prio_low',
};
export { PRIORITY_MAP };