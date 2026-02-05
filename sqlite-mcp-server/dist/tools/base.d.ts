export type Tool = {
    name: string;
    description: string;
    inputSchema?: {
        type: "object";
        properties?: Record<string, any>;
        required?: string[];
    };
};
export declare function success(data: any): {
    success: boolean;
    data: any;
};
export declare function error(message: string): {
    success: boolean;
    error: string;
};
export declare function getTeamId(team: string): Promise<string | null>;
export declare function getUserId(user: string): Promise<string | null>;
export declare function getProjectId(project: string, teamId?: string): Promise<string | null>;
export declare function getIssueId(issue: string): Promise<string | null>;
export declare function getLabelId(label: string, teamId?: string): Promise<string | null>;
export declare function generateIssueIdentifier(teamId: string): Promise<string>;
declare const PRIORITY_MAP: Record<number, string>;
export { PRIORITY_MAP };
//# sourceMappingURL=base.d.ts.map