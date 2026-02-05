import { query, getOne, run } from "../db.js";
import { Tool, success, error, getTeamId, getUserId, getIssueId } from "./base.js";

export function getProjectTools(): Tool[] {
  return [
    {
      name: "list_projects",
      description: "List projects with optional filtering",
      inputSchema: {
        type: "object",
        properties: {
          team: { type: "string", description: "Team name or ID" },
          state: { type: "string", description: "Project state" },
          query: { type: "string", description: "Search project name" },
          member: { type: "string", description: "Filter by member" },
          limit: { type: "number" },
          includeArchived: { type: "boolean" },
        },
      },
    },
    {
      name: "get_project",
      description: "Get a single project by ID or name",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Project ID or name" },
          includeMilestones: { type: "boolean", description: "Include milestones" },
        },
        required: ["query"],
      },
    },
    {
      name: "create_project",
      description: "Create a new project",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Project name" },
          team: { type: "string", description: "Team name or ID (required)" },
          description: { type: "string", description: "Project description" },
          icon: { type: "string", description: "Icon emoji" },
          color: { type: "string", description: "Hex color" },
          state: { type: "string", description: "Project state" },
          priority: { type: "number", description: "Priority: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low" },
          lead: { type: "string", description: "User ID, name, email, or 'me'" },
        },
        required: ["name", "team"],
      },
    },
    {
      name: "update_project",
      description: "Update an existing project",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Project ID or name" },
          name: { type: "string", description: "New project name" },
          description: { type: "string", description: "New description" },
          state: { type: "string", description: "Project state" },
          lead: { type: "string", description: "User ID, name, email, 'me', or null to remove" },
        },
        required: ["id"],
      },
    },
    {
      name: "list_milestones",
      description: "List milestones for a project",
      inputSchema: {
        type: "object",
        properties: {
          project: { type: "string", description: "Project name or ID (required)" },
        },
        required: ["project"],
      },
    },
    {
      name: "create_milestone",
      description: "Create a new milestone",
      inputSchema: {
        type: "object",
        properties: {
          project: { type: "string", description: "Project name or ID (required)" },
          name: { type: "string", description: "Milestone name (required)" },
          description: { type: "string", description: "Milestone description" },
          target_date: { type: "string", description: "Target date (ISO format)" },
        },
        required: ["project", "name"],
      },
    },
  ];
}

export function registerProjectTools(registerHandler: (name: string, handler: (args: any) => Promise<any>) => void) {
  registerHandler("list_projects", async (args) => {
    let sql = `SELECT p.*, t.name as team_name, u.name as lead_name FROM projects p
               LEFT JOIN teams t ON p.team_id = t.id LEFT JOIN users u ON p.lead_id = u.id WHERE 1=1`;
    const params: any[] = [];
    if (args.team) {
      const teamId = await getTeamId(args.team);
      if (teamId) { sql += ` AND p.team_id = ?`; params.push(teamId); }
    }
    if (args.state) { sql += ` AND p.status = ?`; params.push(args.state); }
    if (args.query) { sql += ` AND p.name LIKE ?`; params.push(`%${args.query}%`); }
    if (args.member) {
      const userId = await getUserId(args.member);
      if (userId) { sql += ` AND p.lead_id = ?`; params.push(userId); }
    }
    if (!args.includeArchived) { sql += ` AND (p.status != 'archived' OR p.status IS NULL)`; }
    sql += ` ORDER BY p.updated_at DESC`;
    if (args.limit) { sql += ` LIMIT ?`; params.push(args.limit); }
    return success(await query(sql, params));
  });

  registerHandler("get_project", async (args) => {
    const project = await getOne<any>(`SELECT p.*, t.name as team_name, u.name as lead_name FROM projects p
                                        LEFT JOIN teams t ON p.team_id = t.id LEFT JOIN users u ON p.lead_id = u.id
                                        WHERE p.id = ? OR p.name = ?`, [args.query, args.query]);
    if (!project) return error("Project not found");
    if (args.includeMilestones) {
      project.milestones = await query<any>(`SELECT * FROM milestones WHERE project_id = ? ORDER BY target_date ASC`, [project.id]);
    }
    return success(project);
  });

  registerHandler("create_project", async (args) => {
    const teamId = await getTeamId(args.team);
    if (!teamId) return error(`Team '${args.team}' not found`);
    const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const leadId = args.lead ? await getUserId(args.lead) : null;
    await run(`INSERT INTO projects (id, name, description, icon, color, status, lead_id, team_id, priority, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
               [id, args.name, args.description || null, args.icon || null, args.color || null, args.state || 'started', leadId, teamId, args.priority || 0, new Date().toISOString(), new Date().toISOString()]);
    return success({ id, ...args });
  });

  registerHandler("update_project", async (args) => {
    const project = await getOne<{id: string}>(`SELECT id FROM projects WHERE id = ? OR name = ?`, [args.id, args.id]);
    if (!project) return error("Project not found");
    const updates: string[] = [];
    const params: any[] = [];
    if (args.name !== undefined) { updates.push('name = ?'); params.push(args.name); }
    if (args.description !== undefined) { updates.push('description = ?'); params.push(args.description); }
    if (args.state !== undefined) { updates.push('status = ?'); params.push(args.state); }
    if (args.lead !== undefined) {
      const userId = args.lead === null ? null : await getUserId(args.lead);
      updates.push('lead_id = ?'); params.push(userId);
    }
    if (updates.length === 0) return success({ message: "No updates provided" });
    updates.push('updated_at = ?'); params.push(new Date().toISOString()); params.push(project.id);
    await run(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);
    return success({ id: project.id, message: "Project updated" });
  });

  registerHandler("list_milestones", async (args) => {
    const project = await getOne<{id: string}>(`SELECT id FROM projects WHERE id = ? OR name = ?`, [args.project, args.project]);
    if (!project) return error("Project not found");
    return success(await query(`SELECT * FROM milestones WHERE project_id = ? ORDER BY target_date ASC`, [project.id]));
  });

  registerHandler("create_milestone", async (args) => {
    const project = await getOne<{id: string}>(`SELECT id FROM projects WHERE id = ? OR name = ?`, [args.project, args.project]);
    if (!project) return error("Project not found");
    const id = `mile_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await run(`INSERT INTO milestones (id, name, description, target_date, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
               [id, args.name, args.description || null, args.target_date || null, project.id, new Date().toISOString()]);
    return success({ id, ...args });
  });
}