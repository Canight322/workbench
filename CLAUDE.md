# 个人工作台（公开仓库）

纯静态页面（`index.html` + `app.js` + `style.css`），部署在 GitHub Pages（`main` 分支即线上）。
数据在私有仓库 `Canight322/workbench-data` 的 `workbench.json`，不要把任何个人数据（项目名、会议、任务）写进这个仓库。

## 工作约定（用户要求，必须遵守）

- **界面改动先给用户看预览，确认后再改代码。** 设计好之后，先用本仓库的 `style.css` 做静态预览页（或截图）发给用户看前端显示效果；用户确认前，不要修改 `app.js` / `style.css` / `index.html`，也不要推送。
- 推送到 `main` 就是上线；改了 `app.js` 或 `style.css` 时，把 `index.html` 里 `?v=` 版本号加一，否则浏览器会用缓存的旧文件。
- 每条记录都带 `u`（最后修改时间，毫秒），删除只设 `deletedAt`，多端靠这两个字段合并。
