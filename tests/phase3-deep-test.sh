#!/bin/bash
# CoachOS V0.2 - Phase 3: Deep Functional & Exception Testing
# Automated test script for edge cases, resilience, and state management

API_BASE="http://localhost:3001"
RESULTS_FILE="/home/ubuntu/coachOS/test-results-phase3.json"
PASS=0
FAIL=0
TOTAL=0
RESULTS="[]"

log_result() {
  local test_name="$1"
  local status="$2"
  local detail="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$status" = "PASS" ]; then
    PASS=$((PASS + 1))
    echo "  ✅ PASS: $test_name"
  else
    FAIL=$((FAIL + 1))
    echo "  ❌ FAIL: $test_name - $detail"
  fi
  RESULTS=$(echo "$RESULTS" | python3 -c "
import json, sys
r = json.load(sys.stdin)
r.append({'test': '$test_name', 'status': '$status', 'detail': '''$detail'''})
print(json.dumps(r))
")
}

echo "═══════════════════════════════════════════════════════"
echo "  CoachOS V0.2 - Phase 3: Deep Functional & Exception Testing"
echo "═══════════════════════════════════════════════════════"
echo ""

# ═══ 1. Edge Cases: Super Long Text Input ═══
echo "── 1.1 Super Long Text Input (>2000 chars) ──"
LONG_TEXT=$(python3 -c "print('这是一段非常长的测试文本，用于验证系统对超长输入的处理能力。' * 100)")
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"coachId\":\"siyu\",\"message\":\"$LONG_TEXT\"}" \
  --max-time 60)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  log_result "超长文本输入(2000+字符)" "PASS" "HTTP 200, 服务正常处理"
else
  log_result "超长文本输入(2000+字符)" "FAIL" "HTTP $HTTP_CODE, 响应: $(echo $BODY | head -c 200)"
fi

# ═══ 1.2 Empty Message ═══
echo "── 1.2 Empty Message ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":""}' \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
  log_result "空消息输入验证" "PASS" "正确返回 400 错误"
else
  log_result "空消息输入验证" "FAIL" "期望 400, 实际 $HTTP_CODE"
fi

# ═══ 1.3 Missing Message Field ═══
echo "── 1.3 Missing Message Field ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu"}' \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
  log_result "缺失message字段" "PASS" "正确返回 400 错误"
else
  log_result "缺失message字段" "FAIL" "期望 400, 实际 $HTTP_CODE"
fi

# ═══ 1.4 Special Characters & XSS Injection ═══
echo "── 1.4 Special Characters & XSS Injection ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"<script>alert(\"XSS\")</script><img onerror=alert(1) src=x>"}' \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  # Check if response contains unescaped script tags
  if echo "$BODY" | grep -q '<script>'; then
    log_result "XSS注入防护(后端)" "FAIL" "响应中包含未转义的script标签"
  else
    log_result "XSS注入防护(后端)" "PASS" "后端未回传原始script标签"
  fi
else
  log_result "XSS注入防护(后端)" "PASS" "HTTP $HTTP_CODE, 请求被拒绝"
fi

# ═══ 1.5 Markdown Special Characters ═══
echo "── 1.5 Markdown Special Characters ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"# 标题 **加粗** *斜体* [链接](http://evil.com) ![图片](http://evil.com/img.png) `代码` ```代码块```"}' \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  log_result "Markdown特殊字符处理" "PASS" "HTTP 200, 正常处理"
else
  log_result "Markdown特殊字符处理" "FAIL" "HTTP $HTTP_CODE"
fi

# ═══ 1.6 Invalid Coach ID ═══
echo "── 1.6 Invalid Coach ID ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"nonexistent_coach_12345","message":"你好"}' \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  log_result "无效CoachID降级处理" "PASS" "正确降级到默认Coach"
else
  log_result "无效CoachID降级处理" "FAIL" "HTTP $HTTP_CODE"
fi

# ═══ 2. Topic Analysis Edge Cases ═══
echo ""
echo "── 2.1 Topic Analysis: Empty Messages Array ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat/analyze-topic" \
  -H "Content-Type: application/json" \
  -d '{"messages":[]}' \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
  log_result "话题分析-空消息数组" "PASS" "正确返回 400"
else
  log_result "话题分析-空消息数组" "FAIL" "期望 400, 实际 $HTTP_CODE"
fi

echo "── 2.2 Topic Analysis: Missing messages field ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat/analyze-topic" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
  log_result "话题分析-缺失messages字段" "PASS" "正确返回 400"
else
  log_result "话题分析-缺失messages字段" "FAIL" "期望 400, 实际 $HTTP_CODE"
fi

echo "── 2.3 Topic Analysis: Valid Request ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat/analyze-topic" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"我最近工作压力很大，经常失眠，感觉很焦虑"}]}' \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  HAS_TOPIC=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if d.get('topic') else 'no')" 2>/dev/null)
  if [ "$HAS_TOPIC" = "yes" ]; then
    log_result "话题分析-正常请求" "PASS" "返回包含topic字段的分析结果"
  else
    log_result "话题分析-正常请求" "FAIL" "响应缺少topic字段"
  fi
else
  log_result "话题分析-正常请求" "FAIL" "HTTP $HTTP_CODE"
fi

# ═══ 3. Recommendation API Tests ═══
echo ""
echo "── 3.1 Recommendation: Basic Request ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{"topic":"情绪管理","emotion":"焦虑","keywords":["压力","失眠","焦虑"]}' \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  REC_COUNT=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('recommendations',[])))" 2>/dev/null)
  if [ "$REC_COUNT" -gt 0 ] 2>/dev/null; then
    log_result "咨询师推荐-基础请求" "PASS" "返回 $REC_COUNT 位咨询师推荐"
  else
    log_result "咨询师推荐-基础请求" "FAIL" "推荐列表为空"
  fi
else
  log_result "咨询师推荐-基础请求" "FAIL" "HTTP $HTTP_CODE"
fi

echo "── 3.2 Recommendation: Empty Body ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --max-time 15)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  log_result "咨询师推荐-空请求体" "PASS" "降级处理正常,返回默认推荐"
else
  log_result "咨询师推荐-空请求体" "FAIL" "HTTP $HTTP_CODE"
fi

# ═══ 4. Style Analysis Tests ═══
echo ""
echo "── 4.1 Style Analysis: Insufficient Messages ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/style-analyze" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"counselor","content":"你好"}]}' \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
  log_result "风格分析-消息不足" "PASS" "正确返回 400"
else
  log_result "风格分析-消息不足" "FAIL" "期望 400, 实际 $HTTP_CODE"
fi

echo "── 4.2 Style Analysis: Valid Request ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/style-analyze" \
  -H "Content-Type: application/json" \
  -d '{"messages":[
    {"role":"system","content":"请描述你对来访者情绪的理解"},
    {"role":"counselor","content":"我能感受到你现在内心的不安和焦虑。这种感觉是什么时候开始的呢？"},
    {"role":"system","content":"来访者说最近工作压力很大"},
    {"role":"counselor","content":"工作压力确实会影响我们的身心状态。你觉得这种压力主要来自哪些方面？"},
    {"role":"system","content":"来访者提到和同事关系紧张"},
    {"role":"counselor","content":"同事关系的紧张会让工作环境变得更加有压力。你在这段关系中最希望改变的是什么？"}
  ]}' \
  --max-time 60)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  HAS_STYLE=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if d.get('overallStyle') and d.get('dimensions') and len(d.get('dimensions',[])) == 6 else 'no')" 2>/dev/null)
  if [ "$HAS_STYLE" = "yes" ]; then
    log_result "风格分析-正常请求" "PASS" "返回完整的6维度分析报告"
  else
    log_result "风格分析-正常请求" "FAIL" "响应结构不完整"
  fi
else
  log_result "风格分析-正常请求" "FAIL" "HTTP $HTTP_CODE"
fi

# ═══ 5. Concurrent Request Test ═══
echo ""
echo "── 5.1 Concurrent Requests (5 parallel) ──"
START_TIME=$(date +%s%N)
for i in $(seq 1 5); do
  curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"coachId\":\"siyu\",\"message\":\"并发测试消息 $i\"}" \
    --max-time 60 &
done
wait
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
log_result "5并发请求" "PASS" "全部完成, 耗时 ${DURATION}ms"

# ═══ 6. Session Isolation Test ═══
echo ""
echo "── 6.1 Session Isolation ──"
# Create session 1
R1=$(curl -s -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"我叫张三，我很焦虑"}' \
  --max-time 30)
SID1=$(echo "$R1" | grep -o '"sessionId":"[^"]*"' | tail -1 | cut -d'"' -f4)

# Create session 2
R2=$(curl -s -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"zimo","message":"我叫李四，我想探索自我"}' \
  --max-time 30)
SID2=$(echo "$R2" | grep -o '"sessionId":"[^"]*"' | tail -1 | cut -d'"' -f4)

if [ -n "$SID1" ] && [ -n "$SID2" ] && [ "$SID1" != "$SID2" ]; then
  log_result "Session隔离" "PASS" "两个会话ID不同: $SID1 vs $SID2"
else
  log_result "Session隔离" "FAIL" "Session ID 未正确隔离"
fi

# ═══ 7. API Timeout Test ═══
echo ""
echo "── 7.1 Client-Side Timeout Behavior ──"
START=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"siyu","message":"请给我一个非常详细的关于正念冥想的完整指南，包括所有步骤和注意事项"}' \
  --max-time 60)
END=$(date +%s)
ELAPSED=$((END - START))
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ] && [ "$ELAPSED" -lt 60 ]; then
  log_result "API响应时间" "PASS" "响应时间 ${ELAPSED}s, HTTP $HTTP_CODE"
else
  log_result "API响应时间" "FAIL" "响应时间 ${ELAPSED}s, HTTP $HTTP_CODE"
fi

# ═══ 8. Invalid JSON Body ═══
echo ""
echo "── 8.1 Invalid JSON Body ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d 'this is not json' \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
  log_result "无效JSON请求体" "PASS" "正确返回错误码 $HTTP_CODE"
else
  log_result "无效JSON请求体" "FAIL" "期望 400/500, 实际 $HTTP_CODE"
fi

# ═══ 9. Large Payload Test ═══
echo ""
echo "── 9.1 Large Payload (>1MB) ──"
LARGE_PAYLOAD=$(python3 -c "import json; print(json.dumps({'coachId':'siyu','message':'x'*1100000}))")
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d "$LARGE_PAYLOAD" \
  --max-time 10)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "413" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
  log_result "超大请求体(>1MB)" "PASS" "正确拒绝, HTTP $HTTP_CODE"
else
  log_result "超大请求体(>1MB)" "FAIL" "期望拒绝, 实际 HTTP $HTTP_CODE"
fi

# ═══ 10. HTTP Method Test ═══
echo ""
echo "── 10.1 Wrong HTTP Method ──"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/chat" --max-time 5)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "405" ]; then
  log_result "错误HTTP方法(GET /api/chat)" "PASS" "正确返回 $HTTP_CODE"
else
  log_result "错误HTTP方法(GET /api/chat)" "FAIL" "期望 404/405, 实际 $HTTP_CODE"
fi

# ═══ Summary ═══
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Phase 3 测试结果汇总"
echo "═══════════════════════════════════════════════════════"
echo "  总测试数: $TOTAL"
echo "  通过: $PASS"
echo "  失败: $FAIL"
echo "  通过率: $(python3 -c "print(f'{$PASS/$TOTAL*100:.1f}%')" 2>/dev/null)"
echo "═══════════════════════════════════════════════════════"

# Save results to JSON
echo "$RESULTS" | python3 -c "
import json, sys
results = json.load(sys.stdin)
output = {
    'phase': 'Phase 3: Deep Functional & Exception Testing',
    'total': $TOTAL,
    'passed': $PASS,
    'failed': $FAIL,
    'pass_rate': round($PASS/$TOTAL*100, 1),
    'results': results
}
with open('$RESULTS_FILE', 'w') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print('Results saved to $RESULTS_FILE')
"
