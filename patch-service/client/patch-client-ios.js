// iOS快捷指令专用版本 - 避免WebCrypto API
(function(){
  // 服务器地址（Base64）
  const _0x1a2b=['aHR0cDovLzQ3LjExNi4xNjUuMjI4OjMwMDgvYXBpL3BhdGNo']; // http://47.116.165.228:3008/api/patch
  const _0x3c4d=atob(_0x1a2b[0]);
  
  // 简单Base64解密（iOS快捷指令专用）
  function _simpleDecrypt(b64){
    try {
      const txt = decodeURIComponent(escape(atob(b64)));
      const marker = '///VALID_CODE///';
      if(txt.startsWith(marker)) return txt.slice(marker.length);
      throw new Error('bad format');
    } catch(e) {
      throw new Error('解密失败: ' + e.message);
    }
  }

  /* 主流程 */
  const key = prompt('请输入密钥：');
  if(!key){
    if(typeof completion !== 'undefined') completion('已取消');
    return;
  }
  
  const name = prompt('输入要显示的名字\n示例：ZH** ****AN (만 20세)','ZH** ****AN (만 20세)');
  if(!name){
    if(typeof completion !== 'undefined') completion('已取消');
    return;
  }
  
  const date = prompt('输入生日/认证日期 (YYYY.MM.DD)\n示例：2025.04.06','2025.04.06');
  if(!date){
    if(typeof completion !== 'undefined') completion('已取消');
    return;
  }

  // 发送请求
  fetch(_0x3c4d, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({key, name, date})
  })
  .then(r => r.json())
  .then(res => {
    if(res.success){
      try{
        // iOS快捷指令直接使用simpleCode（Base64编码）
        const code = _simpleDecrypt(res.simpleCode || '');
        eval(code);
      }catch(e){
        if(typeof completion !== 'undefined') {
          completion('❌ 解密失败: ' + e.message);
        } else {
          console.error('❌ 解密失败: ' + e.message);
        }
      }
    }else{
      const errorMsg = '❌ ' + (res.error || '请求失败');
      if(typeof completion !== 'undefined') {
        completion(errorMsg);
      } else {
        console.error(errorMsg);
      }
    }
  })
  .catch(e => {
    const errorMsg = '❌ 网络错误：' + e.message;
    if(typeof completion !== 'undefined') {
      completion(errorMsg);
    } else {
      console.error(errorMsg);
    }
  });
})(); 