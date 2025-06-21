// iOS快捷指令简化版本 - 直接执行传入的代码
(function(){
  // 简单Base64解密函数
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

  // 从快捷指令传入的simpleCode变量
  try {
    if (typeof simpleCode !== 'undefined' && simpleCode) {
      const code = _simpleDecrypt(simpleCode);
      eval(code);
    } else {
      if(typeof completion !== 'undefined') {
        completion('❌ 没有接收到有效的代码');
      }
    }
  } catch(e) {
    if(typeof completion !== 'undefined') {
      completion('❌ 执行失败: ' + e.message);
    }
  }
})(); 