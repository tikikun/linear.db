export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority_id: string | null;
  priority_value: number;
  status_id: string | null;
  project_id: string | null;
  team_id: string | null;
  assignee_id: string | null;
  creator_id: string | null;
  parent_id: string | null;
  cycle_id: string | null;
  milestone_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  completed_at: string | null;
  canceled_at: string | null;
  due_date: string | null;
  estimate: number | null;
  git_branch_name: string | null;
  url: string | null;
}

export interface IssueWithRelations extends Issue {
  assignee?: User | null;
  creator?: User | null;
  project?: Project | null;
  team?: Team | null;
  status?: IssueStatus | null;
  priority?: IssuePriority | null;
  labels?: Label[];
  parent?: Issue | null;
  sub_issues?: Issue[];
  blocks?: Issue[];
  blocked_by?: Issue[];
  related?: Issue[];
  duplicate_of?: Issue | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  key: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  url: string | null;
  status: string | null;
  start_date: string | null;
  target_date: string | null;
  lead_id: string | null;
  team_id: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  is_group: number;
  parent_id: string | null;
  team_id: string | null;
  created_at: string;
}

export interface IssueStatus {
  id: string;
  type: string;
  name: string;
  color: string | null;
  team_id: string | null;
}

export interface IssuePriority {
  id: string;
  value: number;
  name: string;
  icon: string | null;
}

export interface Cycle {
  id: string;
  name: string | null;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  team_id: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string | null;
  target_date: string | null;
  status: string | null;
  project_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  body: string;
  issue_id: string;
  user_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  title: string | null;
  subtitle: string | null;
  filename: string | null;
  content_type: string | null;
  size: number | null;
  url: string | null;
  issue_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string | null;
  icon: string | null;
  color: string | null;
  project_id: string | null;
  initiative_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  target_date: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IssueRelation {
  source_issue_id: string;
  target_issue_id: string;
  relation_type: string;
}

export interface IssueLabel {
  issue_id: string;
  label_id: string;
}