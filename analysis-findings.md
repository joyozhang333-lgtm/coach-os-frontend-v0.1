# CoachOS V0.2 项目分析发现

## 项目运行状态
- TypeScript: 0 errors
- Dev server: 正常启动 (localhost:3000)
- Landing 页面: 正常加载，品牌宣言式设计
- Chat 页面: 三栏布局正常，4个AI Coach切换正常

## 代码与文档不一致之处
1. **CounselorOnboard**: 代码中仍为 15 分钟，文档声称已改为 30 分钟
2. **matchedCoachStyle**: 仍使用旧名字 "安宁心 × 明镜台 融合型"，应改为新名字
3. **progress-notes.md**: 明确标记 "CounselorOnboard: change 15min to 30min" 未完成

## 当前已完成功能
- 8 个页面全部存在且可访问
- Landing 品牌宣言首页
- Chat AI Coach 对话（模拟回复）
- Marketplace 教练广场
- Insights 成长洞见
- CounselorOnboard 咨询师风格复制（15分钟版本）
- Dashboard 仪表盘
- Studio 创作工坊
- Profile 个人中心

## 当前限制（需要开发的部分）
1. **后端完全为空**: server/index.ts 只有静态文件服务，无 API 端点
2. **Chat 使用模拟数据**: DEMO_REPLIES 硬编码回复，无真实 AI 对话
3. **推荐算法为固定值**: matchScore 硬编码 96/91/87
4. **风格分析报告为演示数据**: STYLE_REPORT 完全硬编码
5. **无用户认证**: 虽然 const.ts 有 OAuth 相关代码，但未集成
6. **CounselorOnboard 时间未更新**: 仍为 15 分钟

## PRD 核心能力 vs 当前实现差距
| PRD 核心能力 | 当前状态 | 差距 |
|---|---|---|
| Memory (事实/议题/模式/行动/风险记忆) | 未实现 | 需要后端 + 数据库 |
| Artifacts (会话摘要/洞见/action plan) | 未实现 | 需要 AI 分析引擎 |
| Handoff (标准化交接包/跨Coach迁移) | 前端UI存在 | 需要后端逻辑 |
| Safety (风险识别/情绪保护/升级真人) | 推荐卡片存在 | 需要 NLP 分析 |

## 优先修复项
1. CounselorOnboard 15分钟→30分钟
2. matchedCoachStyle 旧名字→新名字
3. 后端 API 框架搭建
4. Chat 接入 OpenAI API 实现真实对话
5. 咨询师推荐算法实现
