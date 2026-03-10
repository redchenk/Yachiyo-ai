# Electron Icons

在此目录放置应用图标文件：

- `icon.ico` - Windows 图标 (256x256 或更大)
- `icon.icns` - macOS 图标 (512x512 或更大)
- `icon.png` - Linux 图标 (512x512)

## 生成图标

### 在线工具
- https://iconverticons.com/online/
- https://cloudconvert.com/png-to-ico

### 命令行 (需要 ImageMagick)
```bash
# 从 PNG 生成 ICO
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# 从 PNG 生成 ICNS
mkdir icon.iconset
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
iconutil -c icns icon.iconset -o icon.icns
```

## 图标建议

- 使用八千代的月亮🌙或角色头像
- 背景透明或渐变色
- 简洁易识别
- 尺寸至少 512x512
