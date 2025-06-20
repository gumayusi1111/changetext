# Patch Service - 安全的远程页面修改服务

## 架构说明

本项目将原本的客户端快捷指令改造为客户端-服务端架构，实现了：

1. **源码保护** - 核心逻辑部署在服务器，用户无法获取选择器和修改逻辑
2. **访问控制** - 通过密钥系统控制谁可以使用服务
3. **使用追踪** - 服务端记录所有使用日志
4. **动态更新** - 可随时更新服务端逻辑，无需用户更新快捷指令

## 目录结构

```
patch-service/
├── server/                # 服务端代码
│   ├── server.js         # Express服务器
│   └── package.json      # 服务端依赖
├── client/               # 客户端代码
│   ├── patch-client-browser.js    # 浏览器版本
│   ├── obfuscate.js              # 混淆工具
│   └── patch-client-obfuscated.js # 混淆后的代码
└── README.md            # 本文档
```

## 部署指南

### 1. 服务端部署

#### 本地测试
```bash
cd patch-service/server
npm install
npm start
```

#### 生产环境部署（以 Heroku 为例）
```bash
# 1. 创建 Heroku 应用
heroku create your-patch-service

# 2. 部署服务端
cd patch-service/server
git init
git add .
git commit -m "Initial deployment"
heroku git:remote -a your-patch-service
git push heroku master

# 3. 查看日志
heroku logs --tail
```

#### 其他部署选项
- **Vercel**: 适合 Serverless 部署
- **Railway**: 简单快速的部署
- **自建服务器**: 使用 PM2 或 Docker

### 2. 客户端配置

1. **更新服务器地址**
   编辑 `client/patch-client-browser.js`，修改 Base64 编码的服务器地址：
   ```javascript
   // 原始: http://localhost:3000/api/patch
   // 编码: aHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9wYXRjaA==
   
   // 生产环境示例: https://your-patch-service.herokuapp.com/api/patch
   // 使用 btoa('https://your-patch-service.herokuapp.com/api/patch') 生成编码
   ```

2. **混淆客户端代码**
   ```bash
   cd patch-service/client
   node obfuscate.js patch-client-browser.js patch-final.js
   ```

## 密钥管理

### 添加新密钥
编辑 `server/server.js` 中的 `VALID_KEYS` 对象：
```javascript
const VALID_KEYS = {
  'YOUR-SECRET-KEY-001': { user: 'user1', active: true },
  'YOUR-SECRET-KEY-002': { user: 'user2', active: true },
  'NEW-SECRET-KEY-003': { user: 'user3', active: true },
};
```

### 密钥格式建议
- 使用 UUID 或类似格式：`PATCH-2024-XXXX-XXXX-XXXX`
- 定期更换密钥
- 为不同用户组分配不同密钥

## 使用方法

1. **用户获取密钥**
   - 管理员分发密钥给授权用户
   - 可通过邮件、私信等安全渠道

2. **运行快捷指令**
   - 用户将混淆后的代码添加到快捷指令
   - 运行时输入：
     - 密钥
     - 要显示的名字
     - 日期

3. **执行流程**
   ```
   用户输入 → 发送到服务器 → 验证密钥 → 生成代码 → 返回加密代码 → 客户端解密执行
   ```

## 安全建议

1. **HTTPS 必须**
   - 生产环境必须使用 HTTPS
   - 防止中间人攻击

2. **密钥安全**
   - 定期更换密钥
   - 监控异常使用
   - 实施速率限制

3. **日志监控**
   - 定期检查使用日志
   - 设置异常告警

4. **代码更新**
   - 定期更新选择器
   - 添加更多混淆层

## 高级功能

### 1. 数据库集成
```javascript
// 使用 MongoDB 存储密钥
const mongoose = require('mongoose');
const KeySchema = new mongoose.Schema({
  key: String,
  user: String,
  active: Boolean,
  usageCount: Number,
  lastUsed: Date
});
```

### 2. 速率限制
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10 // 限制10次请求
});
app.use('/api/patch', limiter);
```

### 3. Webhook 通知
```javascript
// 使用时发送通知
function sendWebhook(user, name) {
  // 发送到 Discord/Slack 等
}
```

## 故障排除

1. **解密失败**
   - 检查密钥是否正确
   - 确认服务器响应格式

2. **网络错误**
   - 检查服务器是否运行
   - 确认 CORS 设置

3. **元素未找到**
   - 页面结构可能已变更
   - 需要更新选择器

## 技术栈

- **服务端**: Node.js, Express, Crypto
- **客户端**: JavaScript, Web Crypto API
- **混淆**: 自定义混淆器
- **加密**: AES-256-CBC + XOR

## 联系支持

如有问题，请联系技术支持。

---

**注意**: 本服务仅供授权用户使用，请勿分享密钥或尝试破解系统。 