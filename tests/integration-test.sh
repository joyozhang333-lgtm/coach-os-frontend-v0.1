#!/bin/bash
# CoachOS V0.3 — Integration Test Suite
# Tests the complete 归处 AI + Coach 协同机制 recommendation pipeline
set -e

BASE="http://localhost:3001/api"
PASS=0
FAIL=0
TOTAL=0

log_test() {
  TOTAL=$((TOTAL + 1))
  local name="$1"
  local result="$2"
  local detail="$3"
  if [ "$result" = "PASS" ]; then
    PASS=$((PASS + 1))
    echo "  ✅ [$TOTAL] $name"
  else
    FAIL=$((FAIL + 1))
    echo "  ❌ [$TOTAL] $name — $detail"
  fi
}

echo "═══════════════════════════════════════════════════"
echo " CoachOS V0.3 Integration Test Suite"
echo " 归处 AI + Coach 协同机制 完整链路测试"
echo "═══════════════════════════════════════════════════"
echo ""

# ═══ 1. Health Check ═══
echo "▸ 1. Health Check"
HEALTH=$(curl -s "$BASE/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  log_test "Health endpoint returns OK" "PASS"
else
  log_test "Health endpoint returns OK" "FAIL" "$HEALTH"
fi

if echo "$HEALTH" | grep -q '"guichu-ai"'; then
  log_test "Health reports guichu-ai feature" "PASS"
else
  log_test "Health reports guichu-ai feature" "FAIL" "$HEALTH"
fi

if echo "$HEALTH" | grep -q '"recommendation-engine"'; then
  log_test "Health reports recommendation-engine feature" "PASS"
else
  log_test "Health reports recommendation-engine feature" "FAIL" "$HEALTH"
fi

if echo "$HEALTH" | grep -q '"0.3.0"'; then
  log_test "Version is 0.3.0" "PASS"
else
  log_test "Version is 0.3.0" "FAIL" "$HEALTH"
fi

if echo "$HEALTH" | grep -q '"session-cleanup"'; then
  log_test "Health reports session-cleanup feature (V0.3)" "PASS"
else
  log_test "Health reports session-cleanup feature (V0.3)" "FAIL" "$HEALTH"
fi

if echo "$HEALTH" | grep -q '"stats"'; then
  log_test "Health includes store stats (V0.3)" "PASS"
else
  log_test "Health includes store stats (V0.3)" "FAIL" "$HEALTH"
fi

echo ""

# ═══ 2. Coach List API ═══
echo "▸ 2. Coach List API"
COACHES=$(curl -s "$BASE/coach-chat/coaches")
if echo "$COACHES" | grep -q '"mainAI"'; then
  log_test "GET /coach-chat/coaches returns mainAI" "PASS"
else
  log_test "GET /coach-chat/coaches returns mainAI" "FAIL" "$COACHES"
fi

if echo "$COACHES" | grep -q '"归处 AI"'; then
  log_test "Main AI is 归处 AI" "PASS"
else
  log_test "Main AI is 归处 AI" "FAIL" "$COACHES"
fi

SPECIALIST_COUNT=$(echo "$COACHES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('specialists',[])))" 2>/dev/null || echo "0")
if [ "$SPECIALIST_COUNT" = "11" ]; then
  log_test "11 specialist coaches returned" "PASS"
else
  log_test "11 specialist coaches returned" "FAIL" "Got $SPECIALIST_COUNT"
fi

HUMAN_COUNT=$(echo "$COACHES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('humanCoaches',[])))" 2>/dev/null || echo "0")
if [ "$HUMAN_COUNT" = "3" ]; then
  log_test "3 human coaches returned" "PASS"
else
  log_test "3 human coaches returned" "FAIL" "Got $HUMAN_COUNT"
fi

echo ""

# ═══ 3. Main Chat (create session) ═══
echo "▸ 3. Main Chat — Create Session"
CHAT1=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"我最近压力很大","history":[{"role":"user","content":"我最近压力很大"}]}')

SESSION_ID=$(echo "$CHAT1" | grep -o '"sessionId":"[^"]*"' | tail -1 | cut -d'"' -f4)
if [ -n "$SESSION_ID" ]; then
  log_test "Chat creates session and returns sessionId" "PASS"
else
  log_test "Chat creates session and returns sessionId" "FAIL" "No sessionId in response"
  # Try to extract from SSE stream
  SESSION_ID="test-session-$(date +%s)"
fi

echo ""

# ═══ 4. Recommendation Evaluate — Below Threshold ═══
echo "▸ 4. Recommendation Evaluate — Below Threshold"
EVAL1=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"currentMessage\":\"你好\"}")

if echo "$EVAL1" | grep -q '"shouldRecommend":false'; then
  log_test "Below threshold: shouldRecommend=false" "PASS"
else
  log_test "Below threshold: shouldRecommend=false" "FAIL" "$EVAL1"
fi

echo ""

# ═══ 5. Build up messages to trigger recommendation ═══
echo "▸ 5. Build Session for Recommendation Trigger"
# Send 3+ messages to build up the session
for i in 1 2 3; do
  curl -s -X POST "$BASE/chat" \
    -H "Content-Type: application/json" \
    -d "{\"coachId\":\"siyu\",\"sessionId\":\"$SESSION_ID\",\"message\":\"我和父母的关系很紧张，总是吵架\",\"history\":[{\"role\":\"user\",\"content\":\"我和父母的关系很紧张\"},{\"role\":\"assistant\",\"content\":\"听起来你和父母之间有一些紧张\"},{\"role\":\"user\",\"content\":\"是的，我的童年很不开心\"}]}" > /dev/null 2>&1
done
log_test "Sent 3 messages to build session" "PASS"

echo ""

# ═══ 6. Recommendation Evaluate — With Trigger ═══
echo "▸ 6. Recommendation Evaluate — With Semantic Trigger"
EVAL2=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"currentMessage\":\"我和父母的关系很紧张，童年很不开心，总觉得不被爱\",\"messageCount\":5,\"messages\":[{\"role\":\"user\",\"content\":\"我最近心情不好\"},{\"role\":\"assistant\",\"content\":\"能说说是什么让你心情不好吗？\"},{\"role\":\"user\",\"content\":\"和父母吵架了\"},{\"role\":\"assistant\",\"content\":\"和父母的冲突让你很难受\"},{\"role\":\"user\",\"content\":\"是的，从小就这样\"},{\"role\":\"assistant\",\"content\":\"听起来这个模式持续了很久\"},{\"role\":\"user\",\"content\":\"我和父母的关系很紧张，童年很不开心，总觉得不被爱\"}]}")

if echo "$EVAL2" | grep -q '"shouldRecommend":true'; then
  log_test "Semantic trigger: shouldRecommend=true" "PASS"
else
  log_test "Semantic trigger: shouldRecommend=true" "FAIL" "$EVAL2"
fi

REC_ID=$(echo "$EVAL2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('id',''))" 2>/dev/null || echo "")
REC_TYPE=$(echo "$EVAL2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('type',''))" 2>/dev/null || echo "")
REC_COACH=$(echo "$EVAL2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('coachName',''))" 2>/dev/null || echo "")
REC_REASON=$(echo "$EVAL2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('displayReason',''))" 2>/dev/null || echo "")

if [ -n "$REC_ID" ]; then
  log_test "Recommendation has ID: $REC_ID" "PASS"
else
  log_test "Recommendation has ID" "FAIL" "Empty"
fi

if [ "$REC_TYPE" = "specialist_ai" ] || [ "$REC_TYPE" = "human_coach" ]; then
  log_test "Recommendation type: $REC_TYPE" "PASS"
else
  log_test "Recommendation type is valid" "FAIL" "Got: $REC_TYPE"
fi

if [ -n "$REC_COACH" ]; then
  log_test "Recommended coach: $REC_COACH" "PASS"
else
  log_test "Recommended coach name present" "FAIL" "Empty"
fi

if [ -n "$REC_REASON" ]; then
  log_test "Display reason present" "PASS"
else
  log_test "Display reason present" "FAIL" "Empty"
fi

echo ""

# ═══ 7. Get Current Recommendation ═══
echo "▸ 7. Get Current Recommendation"
CURRENT=$(curl -s "$BASE/recommendations/current?sessionId=$SESSION_ID")

if echo "$CURRENT" | grep -q '"hasRecommendation":true'; then
  log_test "Current recommendation exists" "PASS"
else
  log_test "Current recommendation exists" "FAIL" "$CURRENT"
fi

echo ""

# ═══ 8. Respond to Recommendation — Dismiss ═══
echo "▸ 8. Respond to Recommendation — Dismiss"
if [ -n "$REC_ID" ]; then
  DISMISS=$(curl -s -X POST "$BASE/recommendations/respond" \
    -H "Content-Type: application/json" \
    -d "{\"recommendationId\":\"$REC_ID\",\"action\":\"dismiss_once\"}")

  if echo "$DISMISS" | grep -q '"success":true'; then
    log_test "Dismiss recommendation succeeds" "PASS"
  else
    log_test "Dismiss recommendation succeeds" "FAIL" "$DISMISS"
  fi

  if echo "$DISMISS" | grep -q '"status":"dismissed"'; then
    log_test "Status updated to dismissed" "PASS"
  else
    log_test "Status updated to dismissed" "FAIL" "$DISMISS"
  fi
else
  log_test "Dismiss recommendation (skipped - no REC_ID)" "FAIL" "No recommendation to dismiss"
  log_test "Status updated (skipped)" "FAIL" "No recommendation"
fi

echo ""

# ═══ 9. New Recommendation — Accept (open specialist) ═══
echo "▸ 9. New Recommendation — Accept Specialist"
EVAL3=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"new-session-$(date +%s)\",\"currentMessage\":\"我总是重复同样的模式，为什么我总是这样\",\"messageCount\":4,\"messages\":[{\"role\":\"user\",\"content\":\"我最近总是焦虑\"},{\"role\":\"assistant\",\"content\":\"焦虑是什么样的感觉？\"},{\"role\":\"user\",\"content\":\"就是不断重复\"},{\"role\":\"assistant\",\"content\":\"你注意到了一个模式\"},{\"role\":\"user\",\"content\":\"我总是重复同样的模式，为什么我总是这样\"}]}")

REC_ID2=$(echo "$EVAL3" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('id',''))" 2>/dev/null || echo "")

if [ -n "$REC_ID2" ]; then
  ACCEPT=$(curl -s -X POST "$BASE/recommendations/respond" \
    -H "Content-Type: application/json" \
    -d "{\"recommendationId\":\"$REC_ID2\",\"action\":\"open_specialist_ai\"}")

  if echo "$ACCEPT" | grep -q '"success":true'; then
    log_test "Accept specialist recommendation succeeds" "PASS"
  else
    log_test "Accept specialist recommendation succeeds" "FAIL" "$ACCEPT"
  fi

  if echo "$ACCEPT" | grep -q '"status":"accepted"'; then
    log_test "Status updated to accepted" "PASS"
  else
    log_test "Status updated to accepted" "FAIL" "$ACCEPT"
  fi

  NEW_SESSION=$(echo "$ACCEPT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('newSessionId',''))" 2>/dev/null || echo "")
  if [ -n "$NEW_SESSION" ]; then
    log_test "New specialist session created: $NEW_SESSION" "PASS"
  else
    log_test "New specialist session created" "FAIL" "Empty"
  fi
else
  log_test "Accept specialist (skipped - no recommendation)" "FAIL" "No recommendation generated"
  log_test "Status updated (skipped)" "FAIL" ""
  log_test "New session (skipped)" "FAIL" ""
fi

echo ""

# ═══ 10. Specialist Coach Chat ═══
echo "▸ 10. Specialist Coach Chat"
SPEC_CHAT=$(curl -s -X POST "$BASE/coach-chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"chen-haixian","message":"我在纠结要不要换工作","history":[{"role":"user","content":"我在纠结要不要换工作"}]}')

if echo "$SPEC_CHAT" | grep -q "sessionId"; then
  log_test "Specialist chat returns response with sessionId" "PASS"
else
  log_test "Specialist chat returns response" "FAIL" "$(echo $SPEC_CHAT | head -c 200)"
fi

SPEC_SESSION=$(echo "$SPEC_CHAT" | grep -o '"sessionId":"[^"]*"' | tail -1 | cut -d'"' -f4)

echo ""

# ═══ 11. Return to Main AI ═══
echo "▸ 11. Return to Main AI"
if [ -n "$SPEC_SESSION" ]; then
  RETURN=$(curl -s -X POST "$BASE/coach/sessions/$SPEC_SESSION/return-to-main" \
    -H "Content-Type: application/json" \
    -d '{"reason":"user_exit"}')

  if echo "$RETURN" | grep -q '"success":true'; then
    log_test "Return to main AI succeeds" "PASS"
  else
    log_test "Return to main AI succeeds" "FAIL" "$RETURN"
  fi

  if echo "$RETURN" | grep -q '"mainSessionId"'; then
    log_test "Return includes mainSessionId" "PASS"
  else
    log_test "Return includes mainSessionId" "FAIL" "$RETURN"
  fi

  if echo "$RETURN" | grep -q '"summary"'; then
    log_test "Return includes summary" "PASS"
  else
    log_test "Return includes summary" "FAIL" "$RETURN"
  fi
else
  log_test "Return to main (skipped - no session)" "FAIL" ""
  log_test "MainSessionId (skipped)" "FAIL" ""
  log_test "Summary (skipped)" "FAIL" ""
fi

echo ""

# ═══ 12. Risk Trigger Test ═══
echo "▸ 12. Risk Trigger Test"
RISK_EVAL=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"risk-test-$(date +%s)\",\"currentMessage\":\"我不想活了，感觉活着没有意义\"}")

if echo "$RISK_EVAL" | grep -q '"shouldRecommend":true'; then
  log_test "Risk trigger: recommendation generated" "PASS"
else
  log_test "Risk trigger: recommendation generated" "FAIL" "$RISK_EVAL"
fi

RISK_TYPE=$(echo "$RISK_EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('type',''))" 2>/dev/null || echo "")
if [ "$RISK_TYPE" = "human_coach" ]; then
  log_test "High risk → human_coach recommendation" "PASS"
else
  log_test "High risk → human_coach recommendation" "FAIL" "Got: $RISK_TYPE"
fi

RISK_LEVEL=$(echo "$RISK_EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('riskLevel',''))" 2>/dev/null || echo "")
if [ "$RISK_LEVEL" = "high" ] || [ "$RISK_LEVEL" = "critical" ]; then
  log_test "Risk level is high/critical: $RISK_LEVEL" "PASS"
else
  log_test "Risk level is high/critical" "FAIL" "Got: $RISK_LEVEL"
fi

echo ""

# ═══ 13. Audit Log Verification ═══
echo "▸ 13. Audit Log Verification"
AUDIT=$(curl -s "$BASE/recommendations/audit?limit=50")

if echo "$AUDIT" | grep -q '"recommendation_generated"'; then
  log_test "Audit: recommendation_generated logged" "PASS"
else
  log_test "Audit: recommendation_generated logged" "FAIL" ""
fi

if echo "$AUDIT" | grep -q '"recommendation_dismissed"' || echo "$AUDIT" | grep -q '"recommendation_accepted"'; then
  log_test "Audit: recommendation response logged" "PASS"
else
  log_test "Audit: recommendation response logged" "FAIL" ""
fi

AUDIT_COUNT=$(echo "$AUDIT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('total',0))" 2>/dev/null || echo "0")
if [ "$AUDIT_COUNT" -gt 0 ]; then
  log_test "Audit logs present: $AUDIT_COUNT entries" "PASS"
else
  log_test "Audit logs present" "FAIL" "Count: $AUDIT_COUNT"
fi

echo ""

# ═══ 14. Store Stats ═══
echo "▸ 14. Store Stats"
STATS=$(curl -s "$BASE/recommendations/stats")
if echo "$STATS" | grep -q '"sessions"'; then
  log_test "Store stats endpoint works" "PASS"
else
  log_test "Store stats endpoint works" "FAIL" "$STATS"
fi

if echo "$STATS" | grep -q '"activeSessions"'; then
  log_test "Store stats includes activeSessions (V0.3)" "PASS"
else
  log_test "Store stats includes activeSessions (V0.3)" "FAIL" "$STATS"
fi

echo ""

# ═══ 15. Error Handling ═══
echo "▸ 15. Error Handling"
ERR1=$(curl -s -X POST "$BASE/recommendations/evaluate" -H "Content-Type: application/json" -d '{}')
if echo "$ERR1" | grep -q '"error"'; then
  log_test "Missing sessionId returns error" "PASS"
else
  log_test "Missing sessionId returns error" "FAIL" "$ERR1"
fi

ERR2=$(curl -s -X POST "$BASE/recommendations/respond" -H "Content-Type: application/json" -d '{}')
if echo "$ERR2" | grep -q '"error"'; then
  log_test "Missing params returns error" "PASS"
else
  log_test "Missing params returns error" "FAIL" "$ERR2"
fi

ERR3=$(curl -s -X POST "$BASE/recommendations/respond" -H "Content-Type: application/json" -d '{"recommendationId":"nonexistent","action":"dismiss_once"}')
if echo "$ERR3" | grep -q '"error"' || echo "$ERR3" | grep -q '404'; then
  log_test "Nonexistent recommendation returns error" "PASS"
else
  log_test "Nonexistent recommendation returns error" "FAIL" "$ERR3"
fi

ERR4=$(curl -s -X POST "$BASE/coach/sessions/nonexistent/return-to-main" -H "Content-Type: application/json" -d '{"reason":"user_exit"}')
if echo "$ERR4" | grep -q '"error"'; then
  log_test "Nonexistent session return returns error" "PASS"
else
  log_test "Nonexistent session return returns error" "FAIL" "$ERR4"
fi

echo ""

# ═══ 16. Continue Main AI Response ═══
echo "▸ 16. Continue Main AI Response"
EVAL4=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"continue-test-$(date +%s)\",\"currentMessage\":\"我觉得很焦虑，害怕未来，感觉一切都失控了\",\"messageCount\":4,\"messages\":[{\"role\":\"user\",\"content\":\"我很焦虑\"},{\"role\":\"assistant\",\"content\":\"焦虑的感觉是怎样的？\"},{\"role\":\"user\",\"content\":\"害怕未来\"},{\"role\":\"assistant\",\"content\":\"对未来的恐惧让你很不安\"},{\"role\":\"user\",\"content\":\"我觉得很焦虑，害怕未来，感觉一切都失控了\"}]}")

REC_ID3=$(echo "$EVAL4" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('id',''))" 2>/dev/null || echo "")

if [ -n "$REC_ID3" ]; then
  CONTINUE=$(curl -s -X POST "$BASE/recommendations/respond" \
    -H "Content-Type: application/json" \
    -d "{\"recommendationId\":\"$REC_ID3\",\"action\":\"continue_main_ai\"}")

  if echo "$CONTINUE" | grep -q '"success":true'; then
    log_test "Continue with main AI succeeds" "PASS"
  else
    log_test "Continue with main AI succeeds" "FAIL" "$CONTINUE"
  fi
else
  log_test "Continue with main AI (skipped)" "FAIL" "No recommendation"
fi

echo ""

# ═══ Summary ═══
echo "═══════════════════════════════════════════════════"
echo " Test Results: $PASS passed / $FAIL failed / $TOTAL total"
echo "═══════════════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
  echo " 🎉 All tests passed!"
else
  echo " ⚠️  Some tests failed. Review output above."
fi

# Save results
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_FILE="$PROJECT_DIR/test-results.json"
echo "{\"passed\":$PASS,\"failed\":$FAIL,\"total\":$TOTAL,\"version\":\"0.3.0\",\"timestamp\":\"$(date -Iseconds)\"}" > "$RESULTS_FILE"
echo ""
echo "Results saved to $RESULTS_FILE"
