const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

// 动态密钥管理系统
const VALID_KEYS = {
  'YOUR-SECRET-KEY-001': { user: 'user1', active: true, type: 'permanent' },
  'YOUR-SECRET-KEY-002': { user: 'user2', active: true, type: 'permanent' },
  'TEST-KEY-123': { user: 'testuser', active: true, type: 'permanent' },
  // 动态生成的密钥会自动添加到这里
};

// 密钥类型配置
const KEY_TYPES = {
  'O': { name: '一次性', maxUses: 1, duration: null },           // 一次性
  'D': { name: '一天', maxUses: null, duration: 24 * 60 * 60 * 1000 },  // 1天
  'W': { name: '一周', maxUses: null, duration: 7 * 24 * 60 * 60 * 1000 }, // 1周
  'M': { name: '一月', maxUses: null, duration: 30 * 24 * 60 * 60 * 1000 }, // 1月
  'N5': { name: '五次', maxUses: 5, duration: null },           // 5次
  'N10': { name: '十次', maxUses: 10, duration: null }          // 10次
};

const ADMIN_SECRET = 'ADMIN123';   // 管理员调用口令

// 加密函数
function encrypt(text, password) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.pbkdf2Sync(password, 'salt', 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

  // 简单 Base64 加密（备用方案）
function simpleEncrypt(text, key) {
  // 添加一个简单的标记来验证解密
  const marker = '///VALID_CODE///';
  const markedText = marker + text;
  // 确保使用 UTF-8 编码
  return Buffer.from(markedText, 'utf8').toString('base64');
}

// ========== 简易密钥生成工具 ==========
function getToday(){
  const d=new Date();
  const pad=n=>(''+n).padStart(2,'0');
  return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
}
function makeKey(type,date='--'){
  const rand=Math.random().toString(36).slice(2,6);
  const base=[type,date,rand].join('-');
  const sig=crypto.createHmac('sha256', 'SERVER_STATIC_SECRET')
                 .update(base).digest('hex').slice(0,8);
  return base+'-'+sig;
}

// 密钥验证和管理函数
function validateAndUpdateKey(key) {
  const keyInfo = VALID_KEYS[key];
  if (!keyInfo || !keyInfo.active) {
    return { valid: false, reason: '无效的密钥' };
  }
  
  const now = Date.now();
  
  // 检查时间限制
  if (keyInfo.expiresAt && now > keyInfo.expiresAt) {
    keyInfo.active = false;
    return { valid: false, reason: '密钥已过期' };
  }
  
  // 检查使用次数限制
  if (keyInfo.maxUses && keyInfo.usedCount >= keyInfo.maxUses) {
    keyInfo.active = false;
    return { valid: false, reason: '密钥使用次数已达上限' };
  }
  
  // 更新使用计数
  if (keyInfo.usedCount !== undefined) {
    keyInfo.usedCount++;
    
    // 如果达到使用上限，标记为不活跃
    if (keyInfo.maxUses && keyInfo.usedCount >= keyInfo.maxUses) {
      keyInfo.active = false;
      console.log(`[${new Date().toISOString()}] 密钥 ${key} 已用完，自动销毁`);
    }
  }
  
  keyInfo.lastUsed = now;
  return { valid: true, keyInfo };
}

// API端点
app.post('/api/patch', (req, res) => {
  const { key, name, date } = req.body;
  
  // 验证密钥
  const validation = validateAndUpdateKey(key);
  if (!validation.valid) {
    return res.status(401).json({ error: validation.reason });
  }
  
  const keyInfo = validation.keyInfo;
  
  // 记录使用日志
  const remaining = keyInfo.maxUses ? (keyInfo.maxUses - keyInfo.usedCount) : '无限';
  console.log(`[${new Date().toISOString()}] 密钥使用: ${keyInfo.user || keyInfo.type}, 名称: ${name}, 剩余次数: ${remaining}`);
  
  // 生成执行代码 - 使用 JSON.stringify 确保编码正确
  const executionCode = `
    (function() {
      const selName = "#setting-sub-layer > div > div > div > div.layer-body > div > dl > div:nth-child(1) > dd";
      const selDate = "#setting-sub-layer > div > div > div > div.layer-body > div > dl > div:nth-child(2) > dd";
      
      function applyPatch() {
        const nameEl = document.querySelector(selName);
        const dateEl = document.querySelector(selDate);
        
        if (nameEl && dateEl) {
          nameEl.innerText = ${JSON.stringify(name)};
          dateEl.innerText = ${JSON.stringify(date)};
          if (typeof completion !== 'undefined') {
            completion('✅ 修改成功：' + ${JSON.stringify(name)} + ' / ' + ${JSON.stringify(date)});
          } else {
            console.log('✅ 修改成功：' + ${JSON.stringify(name)} + ' / ' + ${JSON.stringify(date)});
          }
          return true;
        }
        return false;
      }
      
      // 立即告知快捷指令，避免 10s 超时
      if (typeof completion !== 'undefined') {
        completion('⏳ 正在应用补丁…');
      }
      
      let attempts = 0;
      const maxAttempts = 15;
      
      function tryApply() {
        if (applyPatch()) {
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryApply, 200);
        } else {
          if (typeof completion !== 'undefined') {
            completion('❌ 未找到目标元素，页面结构可能已变更');
          } else {
            console.error('❌ 未找到目标元素，页面结构可能已变更');
          }
        }
      }
      
      tryApply();
    })();
  `;
  
  // 加密代码
  const encryptedCode = encrypt(executionCode, key);
  const simpleCode = simpleEncrypt(executionCode, key);
  
  // 设置响应头确保 UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  res.json({
    success: true,
    code: encryptedCode,
    simpleCode: simpleCode,  // 备用的简单加密版本
    timestamp: Date.now()
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 密钥状态查询端点
app.get('/admin/keys', (req, res) => {
  if(req.query.token !== ADMIN_SECRET) return res.status(401).send('no auth');
  
  const now = Date.now();
  const keyStatus = {};
  
  for (const [key, info] of Object.entries(VALID_KEYS)) {
    const isExpired = info.expiresAt && now > info.expiresAt;
    const isUsedUp = info.maxUses && info.usedCount >= info.maxUses;
    
    keyStatus[key] = {
      type: info.type,
      active: info.active,
      expired: isExpired,
      usedUp: isUsedUp,
      usedCount: info.usedCount || 0,
      maxUses: info.maxUses || '无限',
      expiresAt: info.expiresAt ? new Date(info.expiresAt).toLocaleString('zh-CN') : '永不过期',
      lastUsed: info.lastUsed ? new Date(info.lastUsed).toLocaleString('zh-CN') : '未使用'
    };
  }
  
  res.json(keyStatus);
});

app.get('/admin/new', (req,res)=>{
  if(req.query.token!==ADMIN_SECRET) return res.status(401).send('no auth');
  
  const mode = req.query.type || 'D';
  const n = parseInt(req.query.n || 5, 10);
  const date = req.query.date || getToday();
  
  let type;
  if(mode === 'D') type = 'D';        // 一天
  else if(mode === 'W') type = 'W';   // 一周  
  else if(mode === 'M') type = 'M';   // 一月
  else if(mode === 'O') type = 'O';   // 一次性
  else if(mode === 'N') type = 'N' + n; // N次
  else return res.status(400).send('bad type: use D/W/M/O/N');
  
  const k = makeKey(type, type === 'O' ? '--' : date);
  
  // 自动添加到有效密钥列表
  const keyConfig = KEY_TYPES[type];
  if (!keyConfig) {
    return res.status(400).send('unknown key type');
  }
  
  const now = Date.now();
  VALID_KEYS[k] = {
    type: type,
    user: `auto_${type}`,
    active: true,
    createdAt: now,
    lastUsed: null,
    usedCount: 0,
    maxUses: keyConfig.maxUses,
    expiresAt: keyConfig.duration ? (now + keyConfig.duration) : null
  };
  
  console.log(`[${new Date().toISOString()}] 新密钥生成: ${k} (${keyConfig.name})`);
  
  res.type('text').send(k);
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 