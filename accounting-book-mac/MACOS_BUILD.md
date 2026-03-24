# macOS 打包说明

## 前置要求

1. 安装 Node.js (v18 或更高版本)
2. 安装 npm (随 Node.js 一起安装)
3. macOS 系统（用于打包 macOS 版本）

## 打包步骤

1. 打开终端
2. 进入项目目录：
   ```bash
   cd accounting-book-mac
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 构建 Next.js 应用：
   ```bash
   npm run build
   ```

5. 打包 macOS 应用（.app 格式）：
   ```bash
   npx electron-builder --mac --arm64 --dir
   ```

6. 打包完成后，应用位于：
   ```
   release/mac-arm64/Accounting Book.app
   ```

## 打包 DMG 安装包（可选）

如果要生成 DMG 安装包：
```bash
npx electron-builder --mac --arm64
```

DMG 文件会生成在 `release/` 目录下。

## 更新软件流程

1. 修改源代码（`src/` 目录下的文件）
2. 重新运行打包命令：
   ```bash
   npm run build
   npx electron-builder --mac --arm64 --dir
   ```
3. 新的应用会生成在 `release/mac-arm64/` 目录

## 注意事项

- 数据存储在 `~/Library/Application Support/accounting-book/data/` 文件夹中
- 首次运行可能需要到 系统设置 > 隐私与安全性 中允许应用运行
- M1/M2/M3 Mac 使用 arm64 架构，Intel Mac 需要改为 x64 架构打包

## 文件说明

- `src/` - React 前端源代码
- `electron/` - Electron 主进程代码
- `build/` - 应用图标
- `dist/` - Next.js 构建输出（运行 `npm run build` 生成）
- `release/` - Electron 打包输出
