# 部署指南

## 方案一：Vercel + Railway（推荐）

### 1. 后端部署到 Railway

1. 注册 Railway 账号：https://railway.app
2. 新建项目 → Deploy from GitHub repo（或直接上传代码）
3. 设置环境变量：
   - PORT=3001
   - JWT_SECRET=your-secret-key
   - ENCRYPTION_KEY=your-encryption-key
4. 部署完成后获取后端URL（如：https://xxx.up.railway.app）

### 2. 前端部署到 Vercel

1. 注册 Vercel 账号：https://vercel.com
2. 导入 frontend 文件夹
3. 设置环境变量：
   - VITE_API_URL=https://xxx.up.railway.app/api
4. 部署完成后获取前端URL

### 3. 更新前端API地址

修改 frontend/src/services/api.ts:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```

---

## 方案二：单机部署（更简单）

使用 Docker 或直接在服务器上运行：

```bash
# 克隆项目后
cd api-dashboard/backend && npm install && npm start
cd api-dashboard/frontend && npm install && npm run build
# 将 frontend/dist 目录配置到 Nginx
```

---

## 方案三：免费静态托管（无后端）

如果只需要展示界面，可以将项目打包为单个HTML文件：
```bash
cd frontend && npm run build
# 将 dist 文件夹上传到任何静态托管服务
```
