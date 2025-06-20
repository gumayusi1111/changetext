// 混淆后的客户端代码
(function(){
  // 服务器地址 - 部署时需要修改为实际地址
  const _0x1a2b=['aHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9wYXRjaA=='];
  const _0x3c4d=atob(_0x1a2b[0]);
  
  // 解密函数
  function _0x5e6f(_0x7g8h,_0x9i0j){
    const _0xk1l2=require('crypto');
    const _0xm3n4='aes-256-cbc';
    const [_0xo5p6,_0xq7r8]=_0x7g8h.split(':');
    const _0xs9t0=Buffer.from(_0xo5p6,'hex');
    const _0xu1v2=_0xk1l2.scryptSync(_0x9i0j,'salt',32);
    const _0xw3x4=_0xk1l2.createDecipheriv(_0xm3n4,_0xu1v2,_0xs9t0);
    let _0xy5z6=_0xw3x4.update(_0xq7r8,'hex','utf8');
    _0xy5z6+=_0xw3x4.final('utf8');
    return _0xy5z6;
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
  .then(_0xi9j0=>{
    if(_0xi9j0.success){
      const _0xk1l2=_0x5e6f(_0xi9j0.code,_0xa1b2);
      eval(_0xk1l2);
    }else{
      completion('❌ '+(_0xi9j0.error||'请求失败'));
    }
  })
  .catch(_0xm3n4=>{
    completion('❌ 网络错误：'+_0xm3n4.message);
  });
})(); 