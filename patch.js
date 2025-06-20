(function () {
    /* —— 让用户输入 —— */
    const NEW_NAME = prompt(
      "输入要显示的名字\n示例：ZH** ****AN (만 20세)",
      "ZH** ****AN (만 20세)"
    );
    if (NEW_NAME === null) { completion("已取消"); return; }
  
    const NEW_DATE = prompt(
      "输入生日/认证日期 (YYYY.MM.DD)\n示例：2025.04.06",
      "2025.04.06"
    );
    if (NEW_DATE === null) { completion("已取消"); return; }
  
    /* —— 页面节点选择器 —— */
    const selName = "#setting-sub-layer > div > div > div > div.layer-body > div > dl > div:nth-child(1) > dd";
    const selDate = "#setting-sub-layer > div > div > div > div.layer-body > div > dl > div:nth-child(2) > dd";
  
    /* —— 等节点出现再改 —— */
    (function wait(n = 30) {
      const nameEl = document.querySelector(selName);
      const dateEl = document.querySelector(selDate);
      if (nameEl && dateEl) {
        nameEl.innerText = NEW_NAME;
        dateEl.innerText = NEW_DATE;
        completion(`✅ 改为：${NEW_NAME} / ${NEW_DATE}`);
      } else if (n) {
        setTimeout(() => wait(n - 1), 300);   // 每 0.3 s 再查一次
      } else {
        completion("❌ 未找到节点，结构可能变了");
      }
    })();
  })();