# 账本软件

客户订单与财务管理工具

## 功能

- 客户管理
- 项目管理
- 发票/附件管理
- 财务统计
- 数据备份/恢复

## 开发

```bash
# macOS
cd accounting-book-mac
npm install
npm run dev

# Windows
cd accounting-book-win
npm install
npm run dev
```

## 打包

GitHub Actions 会自动打包，或手动：

```bash
# macOS
npm run build
npx electron-builder --mac --arm64

# Windows
npm run build
npx electron-builder --win --x64
```

## 下载

从 [Releases](../../releases) 页面下载最新版本。
