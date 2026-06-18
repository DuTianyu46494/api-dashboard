# API Dashboard

API 用量监控仪表板，支持多提供商、多模型的 API 使用量追踪。

## 功能特性

- 用户认证（登录/注册）
- 支持 12+ 主流 API 提供商
- 实时用量统计与可视化
- 预算告警通知
- 深色/浅色主题切换
- API Key 加密存储

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置环境变量

编辑 `backend/.env` 文件：

```env
PORT=3001
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
```

### 3. 启动服务

```bash
# 启动后端（端口 3001）
cd backend
npm run dev

# 启动前端（端口 5173，新终端）
cd frontend
npm run dev
```

### 4. 访问应用

打开浏览器访问 http://localhost:5173

## 项目结构

```
api-dashboard/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── pages/       # 页面组件
│   │   └── services/    # API 服务
│   └── package.json
├── backend/           # Express 后端
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   ├── models/      # 数据模型
│   │   └── middleware/  # 中间件
│   └── package.json
└── README.md
```

## 支持的提供商

- OpenAI
- Anthropic (Claude)
- Google Gemini
- DeepSeek
- Mistral AI
- Groq
- Cohere
- Perplexity
- xAI (Grok)
- 智谱 AI (GLM)
- 百度文心 (ERNIE)
- MiniMax

## 技术栈

- **前端:** React, TypeScript, Tailwind CSS, Chart.js, Vite
- **后端:** Node.js, Express, TypeScript, sql.js
- **认证:** JWT, bcrypt
- **加密:** CryptoJS
