import { query, getOne } from "../db.js";
import { Tool, success, error } from "./base.js";

export function getUserTools(): Tool[] {
  return [
    {
      name: "list_users",
      description: "List all users",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Filter by name or email" },
          limit: { type: "number" },
        },
      },
    },
    {
      name: "get_user",
      description: "Get a user by ID, name, email, or 'me'",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "User ID, name, email, or 'me'" },
        },
        required: ["query"],
      },
    },
  ];
}

export function registerUserTools(registerHandler: (name: string, handler: (args: any) => Promise<any>) => void) {
  registerHandler("list_users", async (args) => {
    let sql = "SELECT * FROM users WHERE 1=1";
    const params: any[] = [];
    if (args.query) { sql += " AND (name LIKE ? OR email LIKE ?)"; params.push(`%${args.query}%`, `%${args.query}%`); }
    sql += " ORDER BY name ASC";
    if (args.limit) { sql += " LIMIT ?"; params.push(args.limit); }
    return success(await query(sql, params));
  });

  registerHandler("get_user", async (args) => {
    if (args.query === 'me') {
      const user = await getOne("SELECT * FROM users LIMIT 1");
      if (!user) return error("No users found");
      return success(user);
    }
    const user = await getOne("SELECT * FROM users WHERE id = ? OR name = ? OR email = ?", [args.query, args.query, args.query]);
    if (!user) return error("User not found");
    return success(user);
  });
}
