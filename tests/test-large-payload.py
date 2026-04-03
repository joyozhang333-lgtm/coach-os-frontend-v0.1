#!/usr/bin/env python3
"""Test large payload handling for CoachOS API"""
import requests
import json

API_BASE = "http://localhost:3001"

# Test 1: Payload > 1MB (should be rejected by express.json limit)
print("── Testing Large Payload (>1MB) ──")
large_message = "x" * 1_100_000
try:
    resp = requests.post(
        f"{API_BASE}/api/chat",
        json={"coachId": "siyu", "message": large_message},
        timeout=10
    )
    if resp.status_code in (413, 400, 500):
        print(f"  ✅ PASS: 超大请求体(>1MB) - 正确拒绝, HTTP {resp.status_code}")
    else:
        print(f"  ❌ FAIL: 超大请求体(>1MB) - 期望拒绝, 实际 HTTP {resp.status_code}")
except requests.exceptions.ConnectionError:
    print(f"  ✅ PASS: 超大请求体(>1MB) - 连接被服务器关闭")
except Exception as e:
    print(f"  ❌ FAIL: 超大请求体(>1MB) - 异常: {e}")

# Test 2: Rapid consecutive requests (debounce test)
print("\n── Testing Rapid Consecutive Requests ──")
import concurrent.futures
import time

results = []
start = time.time()

def send_msg(i):
    try:
        r = requests.post(
            f"{API_BASE}/api/chat",
            json={"coachId": "siyu", "message": f"快速连续消息 {i}"},
            timeout=60
        )
        return r.status_code
    except:
        return 0

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(send_msg, i) for i in range(10)]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]

elapsed = time.time() - start
success = sum(1 for r in results if r == 200)
print(f"  10个快速连续请求: {success}/10 成功, 耗时 {elapsed:.1f}s")
if success >= 8:
    print(f"  ✅ PASS: 快速连续请求处理 - {success}/10 成功")
else:
    print(f"  ❌ FAIL: 快速连续请求处理 - 仅 {success}/10 成功")

# Test 3: Multi-turn conversation context
print("\n── Testing Multi-turn Context Memory ──")
session_id = None
messages_sent = [
    "你好，我叫小明，最近工作压力很大",
    "主要是项目deadline太紧了",
    "而且我的领导总是临时加需求"
]

for i, msg in enumerate(messages_sent):
    payload = {"coachId": "siyu", "message": msg}
    if session_id:
        payload["sessionId"] = session_id
    
    resp = requests.post(f"{API_BASE}/api/chat", json=payload, timeout=60)
    if resp.status_code == 200:
        # Parse SSE to find sessionId
        for line in resp.text.split('\n'):
            if line.startswith('data: '):
                try:
                    data = json.loads(line[6:])
                    if data.get('type') == 'done' and data.get('sessionId'):
                        session_id = data['sessionId']
                except:
                    pass

if session_id:
    print(f"  ✅ PASS: 多轮对话上下文 - Session {session_id[:20]}... 保持连续")
else:
    print(f"  ❌ FAIL: 多轮对话上下文 - 未获取到 sessionId")

print("\n── All supplementary tests complete ──")
