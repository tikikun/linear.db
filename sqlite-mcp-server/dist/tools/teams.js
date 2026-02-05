import { query, getOne } from "../db.js";
import { success, error } from "./base.js";
export function getTeamTools() {
    return [
        {
            name: "list_teams",
            description: "List all teams",
            inputSchema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Search query" },
                    limit: { type: "number" },
                    includeArchived: { type: "boolean" },
                },
            },
        },
        {
            name: "get_team",
            description: "Get a team by ID, key, or name",
            inputSchema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Team UUID, key, or name" },
                },
                required: ["query"],
            },
        },
        {
            name: "list_issue_statuses",
            description: "List available issue statuses in a team",
            inputSchema: {
                type: "object",
                properties: {
                    team: { type: "string", description: "Team name, key, or ID (required)" },
                },
                required: ["team"],
            },
        },
    ];
}
export function registerTeamTools(registerHandler) {
    registerHandler("list_teams", async (args) => {
        let sql = `SELECT * FROM teams WHERE name IS NOT NULL`;
        const params = [];
        if (args.query) {
            sql += ` AND (name LIKE ? OR key LIKE ?)`;
            params.push(`%${args.query}%`, `%${args.query}%`);
        }
        sql += ` ORDER BY updated_at DESC`;
        if (args.limit) {
            sql += ` LIMIT ?`;
            params.push(args.limit);
        }
        return success(await query(sql, params));
    });
    registerHandler("get_team", async (args) => {
        const team = await getOne(`SELECT * FROM teams WHERE id = ? OR key = ? OR name = ?`, [args.query, args.query, args.query]);
        if (!team)
            return error("Team not found");
        return success(team);
    });
    registerHandler("list_issue_statuses", async (args) => {
        const team = await getOne(`SELECT id FROM teams WHERE id = ? OR key = ? OR name = ?`, [args.team, args.team, args.team]);
        if (!team)
            return error("Team not found");
        return success(await query(`SELECT * FROM issue_statuses WHERE team_id = ? ORDER BY id ASC`, [team.id]));
    });
}
//# sourceMappingURL=teams.js.map