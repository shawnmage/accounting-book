# Windows 打包说明

## 前置要求

1. 安装 Node.js (v18 或更高版本)
2. 安装 npm (随 Node.js 一起安装)

## 打包步骤

1. 打开命令提示符或 PowerShell
2. 进入项目目录：
   ```
   cd accounting-book-win
   ```

3. 安装依赖：
   ```
   npm install
   ```

4. 构建 Next.js 应用：
   ```
   npm run build
   ```

5. 打包 Windows 绿色版：
   ```
   npx electron-builder --win --x64
   ```

6. 打包完成后，绿色版软件位于：
   ```
   release/win/Accounting Book/
   ```

   可执行文件是：
   ```
   release/win/Accounting Book/Accounting Book.exe
   ```

## 分发

将整个 `release/win/Accounting Book/` 文件夹压缩成 zip 文件即可分发。
用户解压后直接运行 `Accounting Book.exe` 即可使用。

## 注意事项

- 首次运行可能需要允许 Windows Defender 放行
- 数据存储在用户目录的 `AppData/Roaming/accounting-book/data/` 文件夹中
