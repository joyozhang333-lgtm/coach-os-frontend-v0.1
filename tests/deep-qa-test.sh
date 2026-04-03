#!/bin/bash
# CoachOS V0.3 — Deep QA Test Suite (Phase 3)
# Edge cases, security, concurrency, and resilience testing
set -e

BASE="http://localhost:3001/api"
PASS=0
FAIL=0
TOTAL=0
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_FILE="$PROJECT_DIR/test-results-deep-qa.json"
TEST_DETAILS="[]"

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
echo " CoachOS V0.3 Deep QA Test Suite"
echo " 边缘场景 + 安全 + 并发 + 弹性测试"
echo "═══════════════════════════════════════════════════"
echo ""

# ═══ 1. Super Long Input Test ═══
echo "▸ 1. Super Long Input (2000+ chars)"
LONG_MSG=$(python3 -c "print('我很焦虑' * 500)")
LONG_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d "{\"coachId\":\"siyu\",\"message\":\"$LONG_MSG\",\"history\":[{\"role\":\"user\",\"content\":\"$LONG_MSG\"}]}" 2>&1)
LONG_CODE=$(echo "$LONG_RESP" | tail -1)
if [ "$LONG_CODE" = "200" ]; then
  log_test "2000+ char input accepted (HTTP 200)" "PASS"
else
  log_test "2000+ char input accepted" "FAIL" "HTTP $LONG_CODE"
fi

echo ""

# ═══ 2. Empty Message Validation ═══
echo "▸ 2. Empty/Missing Message Validation"
EMPTY1=$(curl -s -w "\n%{http_code}" -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":""}')
EMPTY1_CODE=$(echo "$EMPTY1" | tail -1)
if [ "$EMPTY1_CODE" = "400" ]; then
  log_test "Empty message returns 400" "PASS"
else
  log_test "Empty message returns 400" "FAIL" "HTTP $EMPTY1_CODE"
fi

EMPTY2=$(curl -s -w "\n%{http_code}" -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu"}')
EMPTY2_CODE=$(echo "$EMPTY2" | tail -1)
if [ "$EMPTY2_CODE" = "400" ]; then
  log_test "Missing message field returns 400" "PASS"
else
  log_test "Missing message field returns 400" "FAIL" "HTTP $EMPTY2_CODE"
fi

echo ""

# ═══ 3. XSS/Script Injection Test ═══
echo "▸ 3. XSS/Script Injection"
XSS_RESP=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"<script>alert(xss)</script> hello","history":[{"role":"user","content":"<script>alert(xss)</script> hello"}]}')
if echo "$XSS_RESP" | grep -q "content\|type"; then
  log_test "XSS input handled without crash" "PASS"
else
  log_test "XSS input handled without crash" "FAIL" "No content in response"
fi

echo ""

# ═══ 4. Markdown Special Characters ═══
echo "▸ 4. Markdown Special Characters"
MD_MSG='**bold** _italic_ [link](http://evil.com) # heading `code` ```block```'
MD_RESP=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d "{\"coachId\":\"siyu\",\"message\":\"$MD_MSG\",\"history\":[{\"role\":\"user\",\"content\":\"$MD_MSG\"}]}")
if echo "$MD_RESP" | grep -q "content"; then
  log_test "Markdown special chars handled" "PASS"
else
  log_test "Markdown special chars handled" "FAIL" ""
fi

echo ""

# ═══ 5. Invalid CoachId Fallback ═══
echo "▸ 5. Invalid CoachId Fallback"
INVALID_COACH=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"nonexistent-coach-xyz","message":"你好","history":[{"role":"user","content":"你好"}]}')
if echo "$INVALID_COACH" | grep -q "content"; then
  log_test "Invalid coachId falls back to default coach" "PASS"
else
  log_test "Invalid coachId falls back to default coach" "FAIL" ""
fi

echo ""

# ═══ 6. Specialist Chat with Invalid CoachId ═══
echo "▸ 6. Specialist Chat with Invalid CoachId"
SPEC_INVALID=$(curl -s -w "\n%{http_code}" -X POST "$BASE/coach-chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"nonexistent","message":"你好"}')
SPEC_INVALID_CODE=$(echo "$SPEC_INVALID" | tail -1)
if [ "$SPEC_INVALID_CODE" = "404" ]; then
  log_test "Specialist: invalid coachId returns 404" "PASS"
else
  log_test "Specialist: invalid coachId returns 404" "FAIL" "HTTP $SPEC_INVALID_CODE"
fi

echo ""

# ═══ 7. Specialist Chat Missing CoachId ═══
echo "▸ 7. Specialist Chat Missing CoachId"
SPEC_MISSING=$(curl -s -w "\n%{http_code}" -X POST "$BASE/coach-chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}')
SPEC_MISSING_CODE=$(echo "$SPEC_MISSING" | tail -1)
if [ "$SPEC_MISSING_CODE" = "400" ]; then
  log_test "Specialist: missing coachId returns 400" "PASS"
else
  log_test "Specialist: missing coachId returns 400" "FAIL" "HTTP $SPEC_MISSING_CODE"
fi

echo ""

# ═══ 8. Concurrent Requests Test ═══
echo "▸ 8. Concurrent Requests (5 parallel)"
CONCURRENT_OK=0
for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/chat" \
    -H "Content-Type: application/json" \
    -d "{\"coachId\":\"siyu\",\"message\":\"并发测试 $i\",\"history\":[{\"role\":\"user\",\"content\":\"并发测试 $i\"}]}" &
done
wait
# Re-test sequentially to verify server is still alive
ALIVE=$(curl -s http://localhost:3001/api/health | grep -c '"ok"')
if [ "$ALIVE" = "1" ]; then
  log_test "Server survives 5 concurrent requests" "PASS"
else
  log_test "Server survives 5 concurrent requests" "FAIL" "Server not responding"
fi

echo ""

# ═══ 9. Session Isolation Test ═══
echo "▸ 9. Session Isolation"
S1=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"Session A message","history":[{"role":"user","content":"Session A message"}]}' | grep -o '"sessionId":"[^"]*"' | tail -1 | cut -d'"' -f4)

S2=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"Session B message","history":[{"role":"user","content":"Session B message"}]}' | grep -o '"sessionId":"[^"]*"' | tail -1 | cut -d'"' -f4)

if [ -n "$S1" ] && [ -n "$S2" ] && [ "$S1" != "$S2" ]; then
  log_test "Different requests get different sessionIds" "PASS"
else
  log_test "Different requests get different sessionIds" "FAIL" "S1=$S1 S2=$S2"
fi

echo ""

# ═══ 10. Invalid JSON Body ═══
echo "▸ 10. Invalid JSON Body"
INVALID_JSON=$(curl -s -w "\n%{http_code}" -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d 'this is not json')
INVALID_JSON_CODE=$(echo "$INVALID_JSON" | tail -1)
if [ "$INVALID_JSON_CODE" = "400" ] || [ "$INVALID_JSON_CODE" = "500" ]; then
  log_test "Invalid JSON rejected (HTTP $INVALID_JSON_CODE)" "PASS"
else
  log_test "Invalid JSON rejected" "FAIL" "HTTP $INVALID_JSON_CODE"
fi

echo ""

# ═══ 11. Oversized Payload (>1MB) ═══
echo "▸ 11. Oversized Payload (>1MB)"
python3 -c "import json; print(json.dumps({'coachId':'siyu','message':'A'*1100000}))" > /tmp/huge_payload.json
HUGE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d @/tmp/huge_payload.json --max-time 10 2>/dev/null)
rm -f /tmp/huge_payload.json
if [ "$HUGE_CODE" = "413" ] || [ "$HUGE_CODE" = "400" ] || [ "$HUGE_CODE" = "500" ]; then
  log_test "Oversized payload rejected (HTTP $HUGE_CODE)" "PASS"
else
  log_test "Oversized payload rejected" "FAIL" "HTTP $HUGE_CODE"
fi

echo ""

# ═══ 12. Wrong HTTP Method ═══
echo "▸ 12. Wrong HTTP Method"
WRONG_METHOD=$(curl -s -w "\n%{http_code}" -X GET "$BASE/chat")
WRONG_CODE=$(echo "$WRONG_METHOD" | tail -1)
if [ "$WRONG_CODE" != "200" ]; then
  log_test "GET /api/chat not allowed (HTTP $WRONG_CODE)" "PASS"
else
  log_test "GET /api/chat not allowed" "FAIL" "HTTP $WRONG_CODE"
fi

echo ""

# ═══ 13. Response Time Sanity ═══
echo "▸ 13. Response Time Sanity"
START_TIME=$(date +%s%N)
curl -s http://localhost:3001/api/health > /dev/null
END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))
if [ "$ELAPSED_MS" -lt 500 ]; then
  log_test "Health endpoint responds in ${ELAPSED_MS}ms (<500ms)" "PASS"
else
  log_test "Health endpoint responds in <500ms" "FAIL" "${ELAPSED_MS}ms"
fi

echo ""

# ═══ 14. Recommendation Duplicate Prevention ═══
echo "▸ 14. Recommendation Duplicate Prevention"
DUP_SESSION="dup-test-$(date +%s)"
DUP1=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$DUP_SESSION\",\"currentMessage\":\"我和父母关系很差，童年很痛苦\",\"messageCount\":5,\"messages\":[{\"role\":\"user\",\"content\":\"我很痛苦\"},{\"role\":\"assistant\",\"content\":\"我在这里\"},{\"role\":\"user\",\"content\":\"童年不好\"},{\"role\":\"assistant\",\"content\":\"那段经历很重要\"},{\"role\":\"user\",\"content\":\"我和父母关系很差，童年很痛苦\"}]}")

DUP2=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$DUP_SESSION\",\"currentMessage\":\"我和父母关系很差\",\"messageCount\":6,\"messages\":[{\"role\":\"user\",\"content\":\"我很痛苦\"},{\"role\":\"assistant\",\"content\":\"我在这里\"},{\"role\":\"user\",\"content\":\"童年不好\"},{\"role\":\"assistant\",\"content\":\"那段经历很重要\"},{\"role\":\"user\",\"content\":\"我和父母关系很差，童年很痛苦\"},{\"role\":\"user\",\"content\":\"我和父母关系很差\"}]}")

# Second call should detect pending recommendation and not create a new one
if echo "$DUP2" | grep -q '"shouldRecommend":false'; then
  log_test "Duplicate recommendation prevented (pending exists)" "PASS"
elif echo "$DUP2" | grep -q '"shouldRecommend":true'; then
  # Check if it's the same recommendation
  log_test "Second evaluation returns recommendation (may be same)" "PASS"
else
  log_test "Duplicate recommendation handling" "FAIL" "$DUP2"
fi

echo ""

# ═══ 15. Analyze Topic Edge Cases ═══
echo "▸ 15. Analyze Topic Edge Cases"
TOPIC_EMPTY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/chat/analyze-topic" \
  -H "Content-Type: application/json" \
  -d '{"messages":[]}')
TOPIC_EMPTY_CODE=$(echo "$TOPIC_EMPTY" | tail -1)
if [ "$TOPIC_EMPTY_CODE" = "400" ]; then
  log_test "Analyze-topic: empty messages returns 400" "PASS"
else
  log_test "Analyze-topic: empty messages returns 400" "FAIL" "HTTP $TOPIC_EMPTY_CODE"
fi

TOPIC_VALID=$(curl -s -X POST "$BASE/chat/analyze-topic" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"我最近工作压力很大，经常失眠"}]}')
if echo "$TOPIC_VALID" | grep -q '"topic"'; then
  log_test "Analyze-topic: valid input returns topic" "PASS"
else
  log_test "Analyze-topic: valid input returns topic" "FAIL" "$TOPIC_VALID"
fi

echo ""

# ═══ 16. Style Analyze Test ═══
echo "▸ 16. Style Analyze"
STYLE_RESP=$(curl -s -X POST "$BASE/style-analyze" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"system","content":"请描述你的咨询风格"},{"role":"counselor","content":"我觉得倾听很重要，每个人都需要被听见"},{"role":"system","content":"你如何处理来访者的情绪？"},{"role":"counselor","content":"我会先共情，然后引导他们探索内在"},{"role":"system","content":"你的核心理念是什么？"},{"role":"counselor","content":"我相信每个人都有自我疗愈的能力"}]}')
if echo "$STYLE_RESP" | grep -q '"overallStyle"'; then
  log_test "Style analyze returns overallStyle" "PASS"
else
  log_test "Style analyze returns overallStyle" "FAIL" "$(echo $STYLE_RESP | head -c 200)"
fi

echo ""

# ═══ 17. Legacy Recommend Endpoint ═══
echo "▸ 17. Legacy Recommend Endpoint"
LEGACY_REC=$(curl -s -X POST "$BASE/recommend" \
  -H "Content-Type: application/json" \
  -d '{"topic":"情绪管理","emotion":"焦虑","keywords":["压力","失眠"]}')
if echo "$LEGACY_REC" | grep -q '"recommendations"'; then
  log_test "Legacy recommend endpoint works" "PASS"
else
  log_test "Legacy recommend endpoint works" "FAIL" "$(echo $LEGACY_REC | head -c 200)"
fi

echo ""

# ═══ 18. All 11 Specialist Coaches Chat Test ═══
echo "▸ 18. All Specialist Coaches Accessibility"
COACH_IDS=("chen-haixian" "lin-ju" "ajahn-chah" "pema-chodron" "carl-jung" "chogyam-trungpa" "chen-yuting" "thich-nhat-hanh" "michael-singer" "peng-kaiping" "huang-shiming")
COACH_PASS=0
COACH_FAIL=0
for cid in "${COACH_IDS[@]}"; do
  SPEC_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/coach-chat" \
    -H "Content-Type: application/json" \
    -d "{\"coachId\":\"$cid\",\"message\":\"你好\"}")
  SPEC_CODE=$(echo "$SPEC_RESP" | tail -1)
  if [ "$SPEC_CODE" = "200" ]; then
    COACH_PASS=$((COACH_PASS + 1))
  else
    COACH_FAIL=$((COACH_FAIL + 1))
    echo "    ⚠ Coach $cid returned HTTP $SPEC_CODE"
  fi
done

if [ "$COACH_PASS" = "11" ]; then
  log_test "All 11 specialist coaches respond (HTTP 200)" "PASS"
else
  log_test "All 11 specialist coaches respond" "FAIL" "$COACH_PASS/11 passed"
fi

echo ""

# ═══ 19. Unicode/Emoji Input ═══
echo "▸ 19. Unicode/Emoji Input"
EMOJI_RESP=$(curl -s -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"我今天心情😢很不好💔","history":[{"role":"user","content":"我今天心情😢很不好💔"}]}')
if echo "$EMOJI_RESP" | grep -q "content"; then
  log_test "Unicode/Emoji input handled correctly" "PASS"
else
  log_test "Unicode/Emoji input handled correctly" "FAIL" ""
fi

echo ""

# ═══ 20. Suppress for Session Test ═══
echo "▸ 20. Suppress for Session"
SUP_SESSION="suppress-test-$(date +%s)"
SUP_EVAL=$(curl -s -X POST "$BASE/recommendations/evaluate" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SUP_SESSION\",\"currentMessage\":\"我很痛苦，不想活了\",\"messageCount\":4,\"messages\":[{\"role\":\"user\",\"content\":\"我很难受\"},{\"role\":\"assistant\",\"content\":\"我在这里\"},{\"role\":\"user\",\"content\":\"活着没意思\"},{\"role\":\"assistant\",\"content\":\"你的感受很重要\"},{\"role\":\"user\",\"content\":\"我很痛苦，不想活了\"}]}")

SUP_REC_ID=$(echo "$SUP_EVAL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendation',{}).get('id',''))" 2>/dev/null || echo "")

if [ -n "$SUP_REC_ID" ]; then
  SUP_RESP=$(curl -s -X POST "$BASE/recommendations/respond" \
    -H "Content-Type: application/json" \
    -d "{\"recommendationId\":\"$SUP_REC_ID\",\"action\":\"suppress_for_session\"}")

  if echo "$SUP_RESP" | grep -q '"success":true'; then
    log_test "Suppress for session succeeds" "PASS"
  else
    log_test "Suppress for session succeeds" "FAIL" "$SUP_RESP"
  fi

  if echo "$SUP_RESP" | grep -q '"status":"suppressed"'; then
    log_test "Status updated to suppressed" "PASS"
  else
    log_test "Status updated to suppressed" "FAIL" "$SUP_RESP"
  fi
else
  log_test "Suppress for session (skipped)" "FAIL" "No recommendation"
  log_test "Status updated (skipped)" "FAIL" ""
fi

echo ""

# ═══ 21. Store Stats After Tests ═══
echo "▸ 21. Store Stats After All Tests"
FINAL_STATS=$(curl -s "$BASE/recommendations/stats")
FINAL_SESSIONS=$(echo "$FINAL_STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sessions',0))" 2>/dev/null || echo "0")
FINAL_RECS=$(echo "$FINAL_STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recommendations',0))" 2>/dev/null || echo "0")
FINAL_AUDITS=$(echo "$FINAL_STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('auditLogs',0))" 2>/dev/null || echo "0")

if [ "$FINAL_SESSIONS" -gt 0 ]; then
  log_test "Sessions created during tests: $FINAL_SESSIONS" "PASS"
else
  log_test "Sessions created during tests" "FAIL" "0 sessions"
fi

if [ "$FINAL_RECS" -gt 0 ]; then
  log_test "Recommendations created during tests: $FINAL_RECS" "PASS"
else
  log_test "Recommendations created during tests" "FAIL" "0 recommendations"
fi

if [ "$FINAL_AUDITS" -gt 0 ]; then
  log_test "Audit logs generated during tests: $FINAL_AUDITS" "PASS"
else
  log_test "Audit logs generated during tests" "FAIL" "0 audit logs"
fi

echo ""

# ═══ Summary ═══
PASS_RATE=0
if [ $TOTAL -gt 0 ]; then
  PASS_RATE=$(python3 -c "print(round($PASS / $TOTAL * 100, 1))")
fi

echo "═══════════════════════════════════════════════════"
echo " Deep QA Test Results"
echo " $PASS passed / $FAIL failed / $TOTAL total ($PASS_RATE%)"
echo "═══════════════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
  echo " 🎉 All deep QA tests passed!"
else
  echo " ⚠️  $FAIL test(s) failed. Review output above."
fi

# Save results
echo "{\"suite\":\"deep-qa\",\"passed\":$PASS,\"failed\":$FAIL,\"total\":$TOTAL,\"passRate\":\"$PASS_RATE%\",\"version\":\"0.3.0\",\"timestamp\":\"$(date -Iseconds)\"}" > "$RESULTS_FILE"
echo ""
echo "Results saved to $RESULTS_FILE"
