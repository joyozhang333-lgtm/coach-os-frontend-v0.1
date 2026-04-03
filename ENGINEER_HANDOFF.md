# CoachOS V0.2 工程师交接指南

**版本：** v1.0  
**最后更新：** 2026-04-03  
**目标读者：** 接手项目的 AI 工程师  
**预计阅读时间：** 15 分钟

---

## 🚀 快速开始（5 分钟）

### 1. 项目克隆和安装
```bash
# 克隆项目
git clone https://github.com/joyozhang333-lgtm/coach-os-frontend-v0.1.git
cd coach-os-frontend-v0.1
git checkout v0.2

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 2. 项目结构速览
```
coach-os-v02/
├── client/src/
│   ├── pages/          # 8 个页面组件
│   ├── components/     # 可复用组件
│   ├── App.tsx         # 路由配置
│   └── index.css       # 全局样式（Tailwind 4）
├── package.json        # 依赖管理
└── vite.config.ts      # Vite 配置
```

### 3. 关键页面导航
- **首页：** http://localhost:3000/
- **AI Coach 对话：** http://localhost:3000/chat
- **教练广场：** http://localhost:3000/marketplace
- **成长洞见：** http://localhost:3000/insights
- **咨询师入驻：** http://localhost:3000/counselor-onboard

---

## 📚 核心概念理解

### 1. 用户旅程
```
Landing 页面
    ↓
选择 AI Coach
    ↓
与 Coach 对话（3 条消息后推荐咨询师）
    ↓
查看推荐的真人咨询师
    ↓
可选：切换到真人咨询师或继续与 AI Coach 对话
```

### 2. 咨询师入驻流程
```
Landing 页面 → CounselorOnboard 页面
    ↓
欢迎介绍（了解系统）
    ↓
30 分钟深度对话（11 个问题）
    ↓
AI 分析（自动生成报告）
    ↓
查看风格分析报告（6 个维度评分 + 优势 + 建议）
```

### 3. 设计系统
- **主题：** 深色主题（#0a0a0a 背景）
- **主色：** 琥珀金色（amber-400）
- **字体：** DM Sans（主要）+ JetBrains Mono（代码）
- **动画库：** Framer Motion
- **UI 组件库：** shadcn/ui

---

## 🔑 关键代码位置

### 1. AI Coach 数据
**位置：** `client/src/pages/Chat.tsx` 第 1-100 行

```typescript
const AI_COACHES = [
  {
    id: "coach-1",
    name: "陈思雨",
    specialty: "情绪调节 · 正念引导",
    bio: "国家二级心理咨询师背景...",
    avatar: "https://...",
    greeting: "你好，我是陈思雨...",
    // ... 其他属性
  },
  // 其他 3 个 Coach
];
```

### 2. 咨询师推荐数据
**位置：** `client/src/pages/Chat.tsx` 第 150-200 行

```typescript
const COUNSELORS = [
  {
    id: "counselor-1",
    name: "李心怡",
    specialty: "情绪管理",
    matchScore: 96,
    price: "¥299/小时",
    // ... 其他属性
  },
  // 其他咨询师
];
```

### 3. 咨询师风格复制问题
**位置：** `client/src/pages/CounselorOnboard.tsx` 第 31-43 行

```typescript
const INTERVIEW_QUESTIONS = [
  "欢迎来到 CoachOS 咨询师入驻系统！...",
  "首先，请简单介绍一下您的专业背景...",
  // ... 其他 9 个问题
];
```

### 4. 路由配置
**位置：** `client/src/App.tsx`

```typescript
<Route path="/" component={Landing} />
<Route path="/chat" component={Chat} />
<Route path="/marketplace" component={Marketplace} />
<Route path="/insights" component={Insights} />
<Route path="/counselor-onboard" component={CounselorOnboard} />
// ... 其他路由
```

---

## ⚠️ 常见陷阱和解决方案

### 1. TypeScript 错误：类型不匹配
**症状：** `Type 'string' is not assignable to type 'number'`

**解决方案：**
```typescript
// ❌ 错误
const coachId: number = "coach-1";

// ✅ 正确
const coachId: string = "coach-1";
```

### 2. Framer Motion ease 类型错误
**症状：** `Type 'number[]' is not assignable to type 'Easing'`

**解决方案：**
```typescript
// ❌ 错误
transition={{ ease: [0.25, 0.1, 0.25, 1] }}

// ✅ 正确
transition={{ ease: [0.25, 0.1, 0.25, 1] as const }}
```

### 3. 图片加载失败
**症状：** 图片显示为 404 或无法加载

**解决方案：**
```typescript
// ❌ 错误 - 本地路径
const imageUrl = "/images/coach.png";

// ✅ 正确 - CDN URL
const imageUrl = "https://d2xsxph8kpxj0f.cloudfront.net/.../coach.png";
```

### 4. 消息无限重新渲染
**症状：** 页面卡顿，控制台不断输出日志

**解决方案：**
```typescript
// ❌ 错误 - 每次渲染都创建新对象
const messages = [{ id: "1", content: "..." }];

// ✅ 正确 - 使用 useState 或 useMemo
const [messages, setMessages] = useState([{ id: "1", content: "..." }]);
```

### 5. 样式不生效
**症状：** Tailwind 类名不生效

**解决方案：**
```typescript
// ❌ 错误 - 动态类名
const className = "bg-" + color;

// ✅ 正确 - 完整类名
const className = color === "amber" ? "bg-amber-400" : "bg-blue-400";
```

### 6. 路由跳转不工作
**症状：** 点击链接没有反应

**解决方案：**
```typescript
// ❌ 错误 - 使用原生 <a> 标签
<a href="/chat">对话</a>

// ✅ 正确 - 使用 wouter Link
import { Link } from "wouter";
<Link href="/chat">对话</Link>
```

---

## 🔄 常见任务和代码示例

### 任务 1：添加新的 AI Coach

**步骤：**
1. 在 `Chat.tsx` 中的 `AI_COACHES` 数组添加新 Coach
2. 准备 Coach 头像图片并上传到 CDN
3. 更新 `Marketplace.tsx` 中的教练列表
4. 更新 `CounselorOnboard.tsx` 中的匹配 Coach 风格

**代码示例：**
```typescript
// 在 Chat.tsx 中添加
const AI_COACHES = [
  // ... 现有 Coach
  {
    id: "coach-5",
    name: "新教练名字",
    role: "专长方向",
    specialty: "专长标签",
    bio: "专业背景介绍...",
    avatar: "https://cdn-url/coach-avatar.png",
    greeting: "你好，我是...",
    nameEn: "English Name",
    rating: "4.9",
    sessions: "1,200+",
    color: "violet",
    tags: ["标签1", "标签2"],
  },
];
```

### 任务 2：修改推荐咨询师列表

**步骤：**
1. 在 `Chat.tsx` 中的 `COUNSELORS` 数组修改数据
2. 更新匹配度评分逻辑（如果需要）
3. 在 `Marketplace.tsx` 中同步更新

**代码示例：**
```typescript
// 在 Chat.tsx 中修改
const COUNSELORS = [
  {
    id: "counselor-1",
    name: "咨询师名字",
    title: "心理咨询师",
    specialty: "专长方向",
    experience: "10+ 年经验",
    matchScore: 96,
    price: "¥299/小时",
    avatar: "https://cdn-url/counselor-avatar.png",
  },
  // ... 其他咨询师
];
```

### 任务 3：修改咨询师风格复制问题

**步骤：**
1. 在 `CounselorOnboard.tsx` 中的 `INTERVIEW_QUESTIONS` 数组修改问题
2. 确保问题数量和时间配置一致（30 分钟 ÷ 问题数）
3. 更新 `STYLE_REPORT` 中的报告模板

**代码示例：**
```typescript
// 在 CounselorOnboard.tsx 中修改
const INTERVIEW_QUESTIONS = [
  "第一个问题？",
  "第二个问题？",
  // ... 总共 11 个问题
];

// 修改报告模板
const STYLE_REPORT = {
  overallStyle: "风格标签",
  styleDescription: "风格描述...",
  dimensions: [
    { name: "维度1", score: 90, description: "描述..." },
    // ... 6 个维度
  ],
};
```

### 任务 4：修改 Landing 页面文案

**步骤：**
1. 在 `Landing.tsx` 中找到对应的文案
2. 直接修改文本内容
3. 如需修改样式，更新 Tailwind 类名

**代码示例：**
```typescript
// 在 Landing.tsx 中修改
<h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold">
  <span className="block text-white/95">你的故事，</span>
  <span className="block text-amber-400/90">值得被听见。</span>
</h1>

// 修改为
<h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold">
  <span className="block text-white/95">新的标题第一行，</span>
  <span className="block text-amber-400/90">新的标题第二行。</span>
</h1>
```

### 任务 5：添加新页面

**步骤：**
1. 在 `pages/` 目录创建新文件（如 `NewPage.tsx`）
2. 在 `App.tsx` 中导入并添加路由
3. 在导航中添加链接（如需要）

**代码示例：**
```typescript
// 1. 创建 client/src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 页面内容 */}
    </div>
  );
}

// 2. 在 App.tsx 中添加
import NewPage from "./pages/NewPage";

function Router() {
  return (
    <Switch>
      {/* ... 其他路由 */}
      <Route path="/new-page" component={NewPage} />
    </Switch>
  );
}
```

---

## 🧪 测试和调试

### 1. 运行 TypeScript 检查
```bash
pnpm check
```

### 2. 构建项目
```bash
pnpm build
```

### 3. 启动生产预览
```bash
pnpm preview
```

### 4. 查看浏览器控制台错误
- 打开 DevTools（F12）
- 查看 Console 标签
- 查看 Network 标签检查 API 请求

### 5. 调试 React 组件
- 安装 React DevTools 浏览器扩展
- 在 Components 标签中检查组件树
- 在 Profiler 标签中检查性能

---

## 📋 常见修改清单

### 修改教练信息
- [ ] 更新 `Chat.tsx` 中的 `AI_COACHES` 数据
- [ ] 更新 `Marketplace.tsx` 中的教练列表
- [ ] 更新 `Insights.tsx` 中的教练引用
- [ ] 更新 `Dashboard.tsx` 中的教练引用
- [ ] 上传新的教练头像到 CDN

### 修改咨询师信息
- [ ] 更新 `Chat.tsx` 中的 `COUNSELORS` 数据
- [ ] 更新 `Marketplace.tsx` 中的咨询师列表
- [ ] 上传新的咨询师头像到 CDN

### 修改首页内容
- [ ] 更新 `Landing.tsx` 中的文案
- [ ] 更新 `Landing.tsx` 中的 CTA 链接
- [ ] 更新 `Landing.tsx` 中的教练卡片

### 修改咨询师入驻流程
- [ ] 更新 `CounselorOnboard.tsx` 中的问题
- [ ] 更新 `CounselorOnboard.tsx` 中的报告模板
- [ ] 更新计时时间（如需要）

---

## 🚨 紧急情况处理

### 页面无法加载
1. 检查浏览器控制台是否有错误
2. 检查网络连接
3. 清除浏览器缓存（Ctrl+Shift+Delete）
4. 重启开发服务器（pnpm dev）

### 样式不生效
1. 检查 Tailwind 类名是否正确
2. 检查 `index.css` 是否正确导入
3. 重启开发服务器
4. 清除 `.next` 或 `dist` 目录

### 图片无法显示
1. 检查图片 URL 是否正确
2. 检查 CDN 是否可访问
3. 检查浏览器控制台的 Network 标签
4. 使用 `manus-upload-file --webdev` 重新上传图片

### 路由不工作
1. 检查 `App.tsx` 中的路由配置
2. 检查 `Link` 组件的 `href` 属性
3. 确保页面组件正确导入
4. 重启开发服务器

---

## 📞 获取帮助

### 文档位置
- **项目交付总结：** `DELIVERY_SUMMARY.md`
- **QA 测试计划：** `QA_TEST_PLAN.md`
- **设计文档：** `ideas.md`
- **进度笔记：** `progress-notes.md`

### GitHub 资源
- **仓库：** https://github.com/joyozhang333-lgtm/coach-os-frontend-v0.1
- **分支：** v0.2
- **Issues：** 用于报告 bug 和功能请求

### 技术栈文档
- **React：** https://react.dev
- **Tailwind CSS：** https://tailwindcss.com
- **shadcn/ui：** https://ui.shadcn.com
- **Framer Motion：** https://www.framer.com/motion
- **Wouter：** https://github.com/molefrog/wouter

---

## ✅ 交接检查清单

在开始工作前，请确认以下事项：

- [ ] 项目成功克隆和安装
- [ ] 开发服务器成功启动
- [ ] 能访问所有 8 个页面
- [ ] 没有 TypeScript 错误
- [ ] 浏览器控制台没有错误
- [ ] 理解了用户旅程
- [ ] 理解了项目结构
- [ ] 阅读了常见陷阱部分
- [ ] 知道如何添加新 Coach
- [ ] 知道如何修改咨询师信息
- [ ] 知道如何修改首页内容
- [ ] 知道如何调试问题

---

## 🎯 第一周任务建议

**第 1 天：** 熟悉项目
- 阅读所有文档
- 运行项目并浏览所有页面
- 理解代码结构

**第 2-3 天：** 修改数据
- 添加新的 AI Coach
- 修改咨询师信息
- 修改首页文案

**第 4-5 天：** 功能开发
- 实现 API 集成（如果有后端）
- 添加新功能
- 修复 bug

**第 6-7 天：** 测试和优化
- 进行功能测试
- 性能优化
- 准备发布

---

## 📝 最后的话

这是一个高质量的项目，代码结构清晰，文档完整。希望这份交接指南能帮助您快速上手。如有任何问题，请参考相关文档或查看代码注释。

**祝您工作顺利！** 🚀

---

**交接指南完成** ✅  
**最后更新：** 2026-04-03  
**下一个工程师：** [您的名字]
