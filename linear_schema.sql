-- Linear-style Ticketing System Schema for SQLite
-- Reverse-engineered from Linear's data model

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    name TEXT,
    key TEXT UNIQUE,
    icon TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_key ON teams(key);

-- ============================================
-- INITIATIVES TABLE (Optional high-level grouping)
-- ============================================
CREATE TABLE initiatives (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    status TEXT, -- 'Planned', 'Active', 'Completed'
    target_date DATETIME,
    owner_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    icon TEXT,
    color TEXT,
    description TEXT,
    url TEXT,
    status TEXT, -- 'started', 'planned', 'completed', 'canceled', 'archived'
    start_date DATETIME,
    target_date DATETIME,
    lead_id TEXT,
    team_id TEXT,
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_lead ON projects(lead_id);

-- ============================================
-- LABELS TABLE
-- ============================================
CREATE TABLE labels (
    id TEXT PRIMARY KEY,
    name TEXT,
    color TEXT,
    description TEXT,
    is_group BOOLEAN DEFAULT 0,
    parent_id TEXT,
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES labels(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_labels_team ON labels(team_id);

-- ============================================
-- ISSUE STATUSES TABLE
-- ============================================
CREATE TABLE issue_statuses (
    id TEXT PRIMARY KEY,
    type TEXT, -- 'backlog', 'unstarted', 'started', 'completed', 'canceled'
    name TEXT,
    color TEXT,
    team_id TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_issue_statuses_team ON issue_statuses(team_id);

-- ============================================
-- ISSUE PRIORITIES TABLE
-- ============================================
CREATE TABLE issue_priorities (
    id TEXT PRIMARY KEY,
    value INTEGER UNIQUE,
    name TEXT, -- 'None', 'Urgent', 'High', 'Normal', 'Low'
    icon TEXT
);

-- ============================================
-- CYCLES TABLE (Sprints)
-- ============================================
CREATE TABLE cycles (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    status TEXT, -- 'current', 'previous', 'next'
    start_date DATETIME,
    end_date DATETIME,
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_cycles_team ON cycles(team_id);

-- ============================================
-- MILESTONES TABLE
-- ============================================
CREATE TABLE milestones (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    target_date DATETIME,
    status TEXT,
    project_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_milestones_project ON milestones(project_id);

-- ============================================
-- ISSUES TABLE (Core entity)
-- ============================================
CREATE TABLE issues (
    id TEXT PRIMARY KEY,
    identifier TEXT UNIQUE,
    title TEXT,
    description TEXT,
    priority_id TEXT,
    status_id TEXT,
    project_id TEXT,
    team_id TEXT,
    assignee_id TEXT,
    creator_id TEXT,
    parent_id TEXT, -- For sub-issues
    cycle_id TEXT,
    milestone_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    archived_at DATETIME,
    completed_at DATETIME,
    canceled_at DATETIME,
    due_date DATETIME,
    estimate INTEGER, -- Story points
    git_branch_name TEXT,
    url TEXT,
    priority_value INTEGER DEFAULT 3, -- Denormalized for sorting
    FOREIGN KEY (priority_id) REFERENCES issue_priorities(id),
    FOREIGN KEY (status_id) REFERENCES issue_statuses(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id),
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES issues(id),
    FOREIGN KEY (cycle_id) REFERENCES cycles(id),
    FOREIGN KEY (milestone_id) REFERENCES milestones(id)
);

CREATE INDEX idx_issues_identifier ON issues(identifier);
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_team ON issues(team_id);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_creator ON issues(creator_id);
CREATE INDEX idx_issues_status ON issues(status_id);
CREATE INDEX idx_issues_parent ON issues(parent_id);
CREATE INDEX idx_issues_due_date ON issues(due_date);

-- ============================================
-- ISSUE-LABELS many-to-many relationship
-- ============================================
CREATE TABLE issue_labels (
    issue_id TEXT,
    label_id TEXT,
    PRIMARY KEY (issue_id, label_id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- ============================================
-- ISSUE RELATIONS (blocks, blockedBy, related, duplicateOf)
-- ============================================
CREATE TABLE issue_relations (
    source_issue_id TEXT,
    target_issue_id TEXT,
    relation_type TEXT, -- 'blocks', 'blockedBy', 'related', 'duplicateOf'
    PRIMARY KEY (source_issue_id, target_issue_id, relation_type),
    FOREIGN KEY (source_issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (target_issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

CREATE INDEX idx_issue_relations_source ON issue_relations(source_issue_id);
CREATE INDEX idx_issue_relations_target ON issue_relations(target_issue_id);

-- ============================================
-- ATTACHMENTS TABLE
-- ============================================
CREATE TABLE attachments (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    filename TEXT,
    content_type TEXT,
    size INTEGER,
    url TEXT,
    issue_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

CREATE INDEX idx_attachments_issue ON attachments(issue_id);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    icon TEXT,
    color TEXT,
    project_id TEXT,
    initiative_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_initiative ON documents(initiative_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    body TEXT,
    issue_id TEXT,
    user_id TEXT,
    parent_id TEXT, -- For comment threads
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE INDEX idx_comments_issue ON comments(issue_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Issue priorities (matching Linear's values)
INSERT INTO issue_priorities (id, value, name) VALUES
('prio_none', 0, 'None'),
('prio_urgent', 1, 'Urgent'),
('prio_high', 2, 'High'),
('prio_normal', 3, 'Normal'),
('prio_low', 4, 'Low');

-- Common statuses (can be customized per team)
INSERT INTO issue_statuses (id, type, name, color) VALUES
('status_backlog', 'backlog', 'Backlog', '#bec2c8'),
('status_todo', 'unstarted', 'Todo', '#4EA7FC'),
('status_in_progress', 'started', 'In Progress', '#5e6ad2'),
('status_done', 'completed', 'Done', '#5e6ad2'),
('status_canceled', 'canceled', 'Canceled', '#bec2c8'),
('status_duplicate', 'canceled', 'Duplicate', '#bec2c8');

-- ============================================
-- VIEWS
-- ============================================

-- View for active issues
CREATE VIEW active_issues AS
SELECT i.*,
       u.name as assignee_name,
       p.name as project_name,
       t.name as team_name,
       s.name as status_name,
       s.type as status_type
FROM issues i
LEFT JOIN users u ON i.assignee_id = u.id
LEFT JOIN projects p ON i.project_id = p.id
LEFT JOIN teams t ON i.team_id = t.id
LEFT JOIN issue_statuses s ON i.status_id = s.id
WHERE s.type NOT IN ('completed', 'canceled');

-- View for issue with labels
CREATE VIEW issues_with_labels AS
SELECT i.*,
       GROUP_CONCAT(l.name, ', ') as labels
FROM issues i
LEFT JOIN issue_labels il ON i.id = il.issue_id
LEFT JOIN labels l ON il.label_id = l.id
GROUP BY i.id;

-- ============================================
-- TRIGGERS (for updated_at)
-- ============================================

CREATE TRIGGER update_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_teams_updated_at
AFTER UPDATE ON teams
FOR EACH ROW
BEGIN
    UPDATE teams SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_projects_updated_at
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_issues_updated_at
AFTER UPDATE ON issues
FOR EACH ROW
BEGIN
    UPDATE issues SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_documents_updated_at
AFTER UPDATE ON documents
FOR EACH ROW
BEGIN
    UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_comments_updated_at
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
    UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;