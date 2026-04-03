# CoachOS V0.2 归处 AI 协同机制：全栈交付指南 (AI-to-AI Handover)

**版本**：V0.2.1 (AI Update)
**作者**：Manus AI (Senior Full-stack AI Engineer & Product Designer)
**日期**：2026年4月3日

---

## 1. 项目背景与核心目标

本项目在 CoachOS V0.2 基础上，实现了“归处 AI 主入口 + 专题 Coach + 真人 Coach 协同机制”。

### 1.1 核心逻辑
- **主入口**：用户默认与“归处 AI”对话，建立长期陪伴关系。
- **智能推荐**：当议题聚焦或风险升高时，系统推荐专题 AI Coach 或真人 Coach。
- **协同闭环**：推荐必须可解释、可拒绝；用户从专题/真人 Coach 结束后，必须能够平滑返回归处 AI。

---

## 2. 架构设计与实现细节

### 2.1 数据层 (In-Memory Store)
由于 V0.2 暂未引入数据库，所有状态均存储在 `server/store.ts` 的内存 Map 中。
- **`CoachSession`**：支持 `main` (归处) 和 `specialist` (专题) 两种角色。
- **`RecommendationDecision`**：记录推荐的生成、展示、接受与拒绝状态。
- **`AuditLogEntry`**：记录 7 类核心审计事件。

### 2.2 推荐引擎 (`server/recommendation-engine.ts`)
实现了四级触发机制：
1. **风险触发 (Risk)**：检测到高危词汇（自杀、绝望等），直接推荐真人 Coach，**无视消息数阈值**。
2. **显式请求 (Explicit)**：识别用户明确意图（如“我想找真人”、“我想练冥想”）。
3. **语义触发 (Semantic)**：调用 LLM 分析上下文，判断是否匹配 11 位专题 Coach 的领域。
4. **阈值控制**：非风险推荐需满足 `messageCount >= 3`。

### 2.3 专题 Coach 范围 (11 位)
已在 `server/coaches-extended.ts` 中完整配置：
- **心理/成长**：陈海贤、林巨、荣格、彭凯平、黄仕明
- **禅修/修行**：阿姜查、佩玛·丘卓、一行禅师、迈克·辛格、邱阳创巴、陈宇廷

---

## 3. API 规范 (New Endpoints)

| 路径 | 方法 | 功能描述 |
| :--- | :--- | :--- |
| `/api/recommendations/evaluate` | POST | 评估并生成推荐（需传 `messageCount` 和 `messages`） |
| `/api/recommendations/current` | GET | 获取当前会话的待处理推荐 |
| `/api/recommendations/respond` | POST | 处理用户响应（接受、拒绝、稍后再看） |
| `/api/coach/sessions/:id/return-to-main` | POST | 从专题/真人 Coach 返回归处 AI |
| `/api/coach-chat` | POST | 与专题 Coach 的 SSE 流式对话 |
| `/api/coach-chat/coaches` | GET | 获取所有 Coach（主 AI + 11 专题 + 真人）列表 |

---

## 4. 前端组件与路由

- **`RecommendationCard.tsx`**：核心交互组件，支持三种操作。
- **`SpecialistChat.tsx`**：专题对话页，含“返回归处 AI”确认弹窗。
- **`HumanCoachPage.tsx`**：真人 Coach 信息页。
- **`App.tsx`**：新增路由 `/specialist/:coachId` 和 `/human-coach/:coachId`。

---

## 5. 测试与质量保证 (QA)

### 5.1 自动化测试
- **集成测试脚本**：`tests/integration-test.sh`
- **执行结果**：37/37 Tests Passed (100%)
- **类型检查**：`npx tsc --noEmit` (0 Errors)

### 5.2 审计日志验证
通过 `GET /api/admin/stats` (测试用) 或直接查看 `server/store.ts` 中的 `auditLogs` 数组，可验证所有推荐与回归行为均已落库。

---

## 6. 给下一任 AI 工程师的建议 (Next Steps)

### 6.1 优先改进项 (High Priority)
1. **持久化存储**：当前为内存存储，重启即丢。请引入 Prisma + PostgreSQL。
2. **真人预约系统**：目前仅为展示页，需开发完整的预约、支付与排班逻辑。
3. **LLM 优化**：语义推荐目前使用 `gpt-4.1-nano`，可根据成本和精度需求调整 Prompt 或模型。

### 6.2 避坑指南
- **SSE 状态管理**：前端 `Chat.tsx` 的 SSE 处理逻辑较为复杂，修改时请确保 `AbortController` 正确清理。
- **推荐频率控制**：目前推荐逻辑在每次消息后评估，虽然有 `recDismissedThisSession` 标记，但仍需注意不要过度打扰用户。

---

## 7. 交付清单

- [x] 完整源代码 (Express + Vite/React)
- [x] 11 位专题 Coach 详细配置
- [x] 推荐引擎逻辑实现
- [x] 37 项自动化集成测试脚本
- [x] 审计日志系统
- [x] 前端推荐卡片与回归机制

---
**Manus AI**
*Senior Full-stack AI Engineer & Product Designer*
*CoachOS Project Team*
