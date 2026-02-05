#!/bin/bash
# Linear.db MCP Server Test Script
# Tests all CRUD operations via HTTP JSON-RPC

set -e

BASE_URL="${MCP_URL:-http://localhost:3334}"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

mcp_call() {
  curl -s --max-time 30 -X POST "$BASE_URL/mcp" -H "Content-Type: application/json" -d "$1"
}

check_result() {
  local name="$1"
  local response="$2"
  local expected="$3"
  
  # Use regex-compatible grep for escaped JSON
  if echo "$response" | grep -qE "$expected"; then
    echo -e "${GREEN}✓ $name${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ $name${NC}"
    echo "  Response (first 200 chars): ${response:0:200}"
    ((FAILED++))
  fi
}

echo "=== Linear.db MCP Server Test Suite ==="
echo "Target: $BASE_URL"
echo ""

# Health check
echo "--- Health Check ---"
HEALTH=$(curl -s "$BASE_URL/health")
check_result "Health endpoint" "$HEALTH" '"status":"ok"'
echo ""

# JSON-RPC format check
echo "--- JSON-RPC 2.0 Format ---"
RESPONSE=$(mcp_call '{"jsonrpc":"2.0","id":1,"method":"tools/list"}')
check_result "Has jsonrpc field" "$RESPONSE" '"jsonrpc":"2.0"'
check_result "Has id field" "$RESPONSE" '"id":1'
check_result "Has result key" "$RESPONSE" '"result":'
echo ""

# Tools availability
echo "--- Tools Available ---"
TOOLS_COUNT=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('result',{}).get('tools',[])))" 2>/dev/null || echo "0")
if [ "$TOOLS_COUNT" -gt 20 ]; then
  echo -e "${GREEN}✓ Tools loaded ($TOOLS_COUNT tools)${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Tools not loaded (only $TOOLS_COUNT)${NC}"
  ((FAILED++))
fi
echo ""

# Teams
echo "--- Teams ---"
RESPONSE=$(mcp_call '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_teams","arguments":{}}}')
check_result "list_teams returns result" "$RESPONSE" 'success.*true'
echo ""

# Issue Statuses
echo "--- Issue Statuses ---"
# First check if we have a team
TEAM_RESPONSE=$(mcp_call '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_teams","arguments":{}}}')
HAS_TEAMS=$(echo "$TEAM_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result',{}).get('content',[{}])[0].get('text','{}'); data=json.loads(r); print('yes' if data.get('data') else 'no')" 2>/dev/null || echo "no")

if [ "$HAS_TEAMS" = "yes" ]; then
  RESPONSE=$(mcp_call '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_issue_statuses","arguments":{"team":""}}}')
  # Check for global statuses (the fix ensures team_id IS NULL statuses are returned)
  STATUS_COUNT=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result',{}).get('content',[{}])[0].get('text','{}'); data=json.loads(r); print(len(data.get('data',[])))" 2>/dev/null || echo "0")
  if [ "$STATUS_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✓ list_issue_statuses returns global statuses ($STATUS_COUNT found)${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ list_issue_statuses missing global statuses (only $STATUS_COUNT)${NC}"
    ((FAILED++))
  fi
else
  echo -e "${YELLOW}⚠ Skipping status test (no teams in database)${NC}"
fi
echo ""

# Projects CRUD
echo "--- Projects CRUD ---"
if [ "$HAS_TEAMS" = "yes" ]; then
  # Get first team key
  TEAM_KEY=$(echo "$TEAM_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result',{}).get('content',[{}])[0].get('text','{}'); data=json.loads(r); teams=data.get('data',[]); print(teams[0].get('key','') if teams else '')" 2>/dev/null || echo "")
  
  if [ -n "$TEAM_KEY" ]; then
    RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"create_project\",\"arguments\":{\"name\":\"Test Project $(date +%s)\",\"team\":\"$TEAM_KEY\"}}}")
    check_result "$name" "$RESPONSE" 'success.*true'
    
    RESPONSE=$(mcp_call '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_projects","arguments":{}}}')
    check_result "$name" "$RESPONSE" 'success.*true'
  fi
else
  echo -e "${YELLOW}⚠ Skipping project tests (no teams)${NC}"
fi
echo ""

# Issues CRUD
echo "--- Issues CRUD ---"
if [ -n "$TEAM_KEY" ]; then
  RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"create_issue\",\"arguments\":{\"title\":\"Test Issue $(date +%s)\",\"team\":\"$TEAM_KEY\",\"priority\":2}}}")
  check_result "$name" "$RESPONSE" 'success.*true'
  
  # Extract issue identifier
  ISSUE_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result',{}).get('content',[{}])[0].get('text','{}'); data=json.loads(r); print(data.get('data',{}).get('identifier',''))" 2>/dev/null || echo "")
  
  if [ -n "$ISSUE_ID" ]; then
    RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"get_issue\",\"arguments\":{\"id\":\"$ISSUE_ID\"}}}")
    check_result "$name" "$RESPONSE" 'success.*true'
    
    RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"update_issue\",\"arguments\":{\"id\":\"$ISSUE_ID\",\"title\":\"Updated Title\"}}}")
    check_result "$name" "$RESPONSE" 'success.*true'
  fi
  
  RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"list_issues\",\"arguments\":{\"team\":\"$TEAM_KEY\"}}}")
  check_result "$name" "$RESPONSE" 'success.*true'
else
  echo -e "${YELLOW}⚠ Skipping issue tests (no teams)${NC}"
fi
echo ""

# Labels CRUD
echo "--- Labels CRUD ---"
if [ -n "$TEAM_KEY" ]; then
  RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"create_issue_label\",\"arguments\":{\"name\":\"test-label-$(date +%s)\",\"team\":\"$TEAM_KEY\",\"color\":\"#00FF00\"}}}")
  check_result "$name" "$RESPONSE" 'success.*true'
  
  RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"list_issue_labels\",\"arguments\":{\"team\":\"$TEAM_KEY\"}}}")
  check_result "$name" "$RESPONSE" 'success.*true'
else
  echo -e "${YELLOW}⚠ Skipping label tests (no teams)${NC}"
fi
echo ""

# Cycles CRUD
echo "--- Cycles CRUD ---"
if [ -n "$TEAM_KEY" ]; then
  RESPONSE=$(mcp_call "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"create_cycle\",\"arguments\":{\"team\":\"$TEAM_KEY\",\"name\":\"Test Sprint $(date +%s)\",\"startDate\":\"2026-01-01\",\"endDate\":\"2026-01-14\"}}}")
  check_result "$name" "$RESPONSE" 'success.*true'
  
  RESPONSE=$(mcp_call '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_cycles","arguments":{}}}')
  check_result "$name" "$RESPONSE" 'success.*true'
else
  echo -e "${YELLOW}⚠ Skipping cycle tests (no teams)${NC}"
fi
echo ""

# Summary
echo "=== Test Summary ==="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ "$FAILED" -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
