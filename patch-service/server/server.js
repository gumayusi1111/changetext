const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

// 密钥管理 - 实际使用时应该存在数据库中
const VALID_KEYS = {
  'YOUR-SECRET-KEY-001': { user: 'user1', active: true },
  'YOUR-SECRET-KEY-002': { user: 'user2', active: true },
  // 可以添加更多密钥
};

const ADMIN_SECRET = 'ADMIN123';   // 管理员调用口令

// 加密函数
function encrypt(text, password) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
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

// API端点
app.post('/api/patch', (req, res) => {
  const { key, name, date } = req.body;
  
  // 验证密钥
  if (!key || !VALID_KEYS[key] || !VALID_KEYS[key].active) {
    return res.status(401).json({ error: '无效的密钥' });
  }
  
  // 记录使用日志
  console.log(`[${new Date().toISOString()}] 密钥使用: ${VALID_KEYS[key].user}, 名称: ${name}`);
  
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
      
      let attempts = 0;
      const maxAttempts = 30;
      
      function tryApply() {
        if (applyPatch()) {
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryApply, 300);
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

app.get('/admin/new', (req,res)=>{
  if(req.query.token!==ADMIN_SECRET) return res.status(401).send('no auth');
  const mode=req.query.type||'D';
  const n=parseInt(req.query.n||1,10);
  const date=req.query.date||getToday();
  let type;
  if(mode==='D') type='D';
  else if(mode==='O') type='O';
  else if(mode==='N') type='N'+n;
  else return res.status(400).send('bad type');
  const k=makeKey(type,type==='O'? '--':date);
  res.type('text').send(k);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 