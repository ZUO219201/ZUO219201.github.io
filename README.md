# 个人履历网站

## 关于我的关键词星云

星云采用随站点一起发布的 Three.js r128，无需额外构建。
在 script.js 的 keywordNodes 数组修改 10 个关键词的 label、url 和三维 position。
当前每个关键词链接到 topics 文件夹里的独立 HTML 页面，可逐个修改页面内容或替换 URL。
按住拖动旋转，滚轮缩放，点击文字进入对应页面。标签支持键盘 Tab 与 Enter。
系统偏好减少动态效果时停止自动旋转，但保留手动旋转和缩放。

一个无需安装依赖的响应式个人网站，包含个人简介、经历、项目、技能和联系方式。

在 index.html 中搜索“你的名字”“你的职业方向”“你的城市”和示例经历，替换为真实资料。将 assets/patrick-glasses.jpg 换成同名个人照片即可更换头像。

上线前请同时修改页面顶部的标题与描述、JSON-LD 资料、邮箱、社交链接、项目链接，以及 sitemap.xml 和 robots.txt 中的域名。

双击 index.html 即可预览。部署时可将整个目录上传至 GitHub Pages、Cloudflare Pages 或 Vercel。
