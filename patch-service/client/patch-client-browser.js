// 浏览器环境的混淆客户端代码（适用于 iOS「快捷指令」或浏览器控制台）
(function(){
  // 服务器地址（Base64），请根据实际 IP/域名及端口更新
  const _0x1a2b=['aHR0cDovLzQ3LjExNi4xNjUuMjI4OjMwMDgvYXBpL3BhdGNo']; // http://47.116.165.228:3008/api/patch
  const _0x3c4d=atob(_0x1a2b[0]);
  
  /* WebCrypto AES-CBC 解密函数（与服务端 encrypt 对应） */
  async function _0x5e6f(enc, pwd){
    const [ivHex,cipherHex] = enc.split(':');
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(h=>parseInt(h,16)));
    const cipher = new Uint8Array(cipherHex.match(/.{1,2}/g).map(h=>parseInt(h,16)));

    // 衍生密钥 (PBKDF2)
    const baseKey = await crypto.subtle.importKey('raw',new TextEncoder().encode(pwd),'PBKDF2',false,['deriveBits']);
    const keyBits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode('salt'),iterations:100000,hash:'SHA-256'},baseKey,256);
    const aesKey = await crypto.subtle.importKey('raw',keyBits,{name:'AES-CBC'},false,['decrypt']);

    const plainBuf = await crypto.subtle.decrypt({name:'AES-CBC',iv},aesKey,cipher);
    return new TextDecoder().decode(plainBuf);
  }

  // Base64 简易解密（备用）
  function _simpleDecrypt(b64){
    const txt = decodeURIComponent(escape(atob(b64)));
    const marker = '///VALID_CODE///';
    if(txt.startsWith(marker)) return txt.slice(marker.length);
    throw new Error('bad format');
  }

  /* 主流程 */
  const key = prompt('请输入密钥：');
  if(!key){completion('已取消');return;}
  const name = prompt('输入要显示的名字\n示例：ZH** ****AN (만 20세)','ZH** ****AN (만 20세)');
  if(!name){completion('已取消');return;}
  const date = prompt('输入生日/认证日期 (YYYY.MM.DD)\n示例：2025.04.06','2025.04.06');
  if(!date){completion('已取消');return;}

  fetch(_0x3c4d,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,name,date})})
    .then(r=>r.json())
    .then(async res=>{
      if(res.success){
        try{
          const code = await _0x5e6f(res.code,key);
          eval(code);
        }catch(e){
          try{
            const code = _simpleDecrypt(res.simpleCode||'');
            eval(code);
          }catch(e2){
            completion('❌ 解密失败');
          }
        }
      }else{
        completion('❌ '+(res.error||'请求失败'));
      }
    })
    .catch(e=>completion('❌ 网络错误：'+e.message));
})(); 