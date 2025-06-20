// 代码混淆工具
const fs = require('fs');
const path = require('path');

// 混淆配置
const config = {
  // 变量名映射
  variableMap: new Map(),
  // 字符串混淆
  stringObfuscate: true,
  // 控制流平坦化
  controlFlowFlattening: true,
  // 死代码注入
  deadCodeInjection: true
};

// 生成随机变量名
function generateRandomVar() {
  const chars = '0123456789abcdef';
  let result = '_0x';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// 字符串混淆
function obfuscateString(str) {
  // Base64 编码
  const base64 = Buffer.from(str).toString('base64');
  
  // 分片并反转
  const chunks = base64.match(/.{1,4}/g) || [];
  const reversed = chunks.reverse();
  
  // 生成解码函数
  const varName = generateRandomVar();
  const decoder = `
    const ${varName} = (s) => {
      const c = s.match(/.{1,4}/g);
      return atob(c.reverse().join(''));
    };
  `;
  
  return {
    encoder: reversed.join(''),
    decoder: decoder,
    usage: `${varName}('${reversed.join('')}')`
  };
}

// 混淆主函数
function obfuscateCode(inputFile, outputFile) {
  const code = fs.readFileSync(inputFile, 'utf8');
  
  // 1. 提取所有字符串
  const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
  const strings = [];
  let match;
  
  while ((match = stringRegex.exec(code)) !== null) {
    if (!match[0].includes('_0x')) { // 跳过已混淆的
      strings.push({
        original: match[0],
        content: match[0].slice(1, -1),
        quote: match[0][0]
      });
    }
  }
  
  // 2. 生成字符串数组
  const stringArray = generateRandomVar();
  const stringDecoders = [];
  const stringMappings = new Map();
  
  strings.forEach((str, index) => {
    const obf = obfuscateString(str.content);
    stringDecoders.push(obf.decoder);
    stringMappings.set(str.original, `${generateRandomVar()}(${stringArray}[${index}])`);
  });
  
  // 3. 混淆后的代码结构
  let obfuscatedCode = `
(function() {
  'use strict';
  
  // 字符串数组
  const ${stringArray} = [${strings.map(s => {
    const obf = obfuscateString(s.content);
    return `'${obf.encoder}'`;
  }).join(',')}];
  
  // 解码器
  ${stringDecoders.join('\n')}
  
  // 反调试
  (function() {
    const _0xdbg = setInterval(() => {
      const s = Date.now();
      debugger;
      if (Date.now() - s > 100) {
        clearInterval(_0xdbg);
        location.reload();
      }
    }, 1000);
  })();
  
  // 主逻辑
  ${code}
})();
  `;
  
  // 4. 替换字符串
  stringMappings.forEach((replacement, original) => {
    obfuscatedCode = obfuscatedCode.replace(original, replacement);
  });
  
  // 5. 添加死代码
  if (config.deadCodeInjection) {
    const deadCode = `
      // 死代码注入
      if (Math.random() > 2) {
        console.log(atob('${Buffer.from('dead-code').toString('base64')}'));
      }
    `;
    obfuscatedCode = obfuscatedCode.replace('// 主逻辑', `// 主逻辑\n${deadCode}`);
  }
  
  // 6. 压缩和美化
  obfuscatedCode = obfuscatedCode
    .replace(/\/\*[\s\S]*?\*\//g, '') // 删除多行注释
    .replace(/\/\/.*/g, '') // 删除单行注释
    .replace(/\s+/g, ' ') // 压缩空白
    .trim();
  
  fs.writeFileSync(outputFile, obfuscatedCode);
  console.log(`✅ 混淆完成: ${outputFile}`);
  console.log(`原始大小: ${code.length} 字节`);
  console.log(`混淆后大小: ${obfuscatedCode.length} 字节`);
}

// 使用示例
if (require.main === module) {
  const inputFile = process.argv[2] || 'patch-client-browser.js';
  const outputFile = process.argv[3] || 'patch-client-obfuscated.js';
  
  obfuscateCode(
    path.join(__dirname, inputFile),
    path.join(__dirname, outputFile)
  );
}

module.exports = { obfuscateCode, obfuscateString }; 