# CoachOS V0.2 工程师交接指南 (AI Update)

**文档版本：** v1.1  
**最后更新：** 2026-04-03  
**更新作者：** Manus AI  
**目标读者：** 接手项目的下一位 AI 工程师或全栈开发人员  

---

## 1. 项目当前状态与已完成工作

在本次开发冲刺中，我（Manus AI）接手了 V0.2 的静态前端版本，并成功将其升级为**具备真实 AI 能力的全栈系统**。以下是本次冲刺的核心交付成果与成功日志。

### 1.1 核心成果清单
*   **后端 API 架构搭建**：基于 Express 构建了完整的 API 路由系统，并配置了 CORS 与 Vite 代理。
*   **真实 AI Chat 引擎接入**：移除了原有的硬编码模拟回复，成功将 OpenAI GPT-4.1-mini 接入聊天页面。实现了角色的 System Prompt 设定（如陈思雨的正念引导、林子墨的深度觉察），并通过“分块传输（Chunked SSE）”方案完美模拟了流式打字机效果。
*   **智能咨询师推荐算法**：实现了基于对话内容的动态推荐系统。通过 `analyze-topic` 接口分析用户情绪与关键词，再通过 `recommend` 接口从真实咨询师库中加权筛选，在前端动态展示匹配度评分（如 86% 匹配）。
*   **咨询师入驻风格分析 (Counselor Onboard)**：将原本错误的 15 分钟提示修正为 PRD 要求的 30 分钟，并接入了真实的大模型风格分析 API，能够根据 30 分钟的对话自动生成包含“核心优势”、“成长方向”及“匹配 AI 教练类型”的多维度评估报告。

### 1.2 成功日志 (Success Logs)
*   **[2026-04-03] API 端点测试通过**：`/api/chat`, `/api/chat/analyze-topic`, `/api/recommend`, `/api/style-analyze`, `/api/health` 均返回 HTTP 200，逻辑验证通过。
*   **[2026-04-03] 修复流式传输报错**：发现底层代理环境不支持原生 Streaming (`BadRequestError: 400 "Streaming is not supported"`)，成功重构为 Non-streaming 结合 Chunked SSE 模拟流式输出，恢复了前端打字机体验。
*   **[2026-04-03] 前后端联调通过**：Vite Dev Server 代理配置生效，前端 React 组件与后端 Express API 数据通信稳定，无跨域报错。
*   **[2026-04-03] 代码合入与推送**：所有更改已 Commit (`6a6e9be`) 并 Push 至 GitHub `v0.2` 分支。

---

## 2. 核心架构与代码地图

下一位工程师在接手时，请重点关注以下文件和目录：

### 2.1 后端服务 (`/server`)
*   `server/index.ts`：Express 服务器入口，负责中间件配置和路由挂载。
*   `server/routes/chat.ts`：处理用户与 AI Coach 的对话，包含调用 OpenAI API 的核心逻辑及流式模拟实现。
*   `server/routes/recommend.ts`：处理话题分析与咨询师匹配推荐算法。
*   `server/routes/style-analyze.ts`：处理咨询师入驻时的 30 分钟对话数据，生成多维度风格报告。
*   `server/coaches.ts`：存储所有 AI 教练的 System Prompt 和角色设定。

### 2.2 前端集成 (`/client/src`)
*   `client/src/lib/api.ts`：**新增**，封装了所有与后端通信的 API 客户端函数，包含处理 SSE 流的异步生成器。
*   `client/src/pages/Chat.tsx`：**重构**，接入了真实 API，移除了定时器模拟逻辑。
*   `client/src/pages/CounselorOnboard.tsx`：**重构**，修正了时间文案，并接入了 `analyzeStyle` API 进行真实报告生成。
*   `vite.config.ts`：配置了 `/api` 的代理转发，指向 `http://localhost:3001`。

---

## 3. 开发与运行指南

### 3.1 环境要求
*   Node.js (v22+)
*   pnpm
*   OpenAI API Key (需设置环境变量 `OPENAI_API_KEY`)

### 3.2 启动命令
项目已配置 `concurrently`，可一键启动前后端：

```bash
# 安装依赖
pnpm install

# 确保已设置环境变量
export OPENAI_API_KEY="your_api_key_here"

# 一键启动前端 (Vite) 和后端 (Express)
pnpm dev:all
```
*前端运行在 `http://localhost:3000`，后端 API 运行在 `http://localhost:3001`。*

---

## 4. 避坑指南 (防重踩雷)

1.  **切勿开启 OpenAI 原生 Streaming**：当前 API 代理环境（APISIX）会拦截 `stream: true` 请求并返回 400 错误。必须保持 `server/routes/chat.ts` 中的 Chunked SSE 模拟方案，**不要试图将其改回原生流式**。
2.  **端口冲突**：如果 `pnpm dev:all` 启动失败，通常是因为 `3001` 端口被之前的 Node 进程占用。使用 `pkill -f "tsx"` 清理残留进程。
3.  **Mock 数据降级**：如果 OpenAI API 调用失败（如网络波动或 Key 失效），前端页面（如 `CounselorOnboard`）已内置了 Fallback 数据，不会导致页面白屏，排查问题时请先查看浏览器 Network 面板的接口返回值。
