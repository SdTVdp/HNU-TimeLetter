# OSS 图片存储配置指南

本文档说明如何配置阿里云 OSS 来存储飞书多维表格中的图片附件。

## 一、为什么需要 OSS

飞书附件的临时链接会过期，不适合长期使用。通过将图片上传到 OSS：

1. **稳定性**：获得永久有效的公网访问 URL
2. **性能**：CDN 加速，访问速度更快
3. **管理**：统一管理所有图片资源
4. **成本**：按量付费，成本可控

## 二、阿里云 OSS 配置步骤

### 步骤 1: 创建 OSS Bucket

1. 登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/)
2. 点击"创建 Bucket"
3. 配置参数：
   - **Bucket 名称**：如 `himematsu`（全局唯一）
   - **地域**：选择离用户最近的地域，如 `华南1（深圳）`
   - **存储类型**：标准存储
   - **读写权限**：公共读（允许匿名访问）
   - **服务端加密**：无
4. 点击"确定"创建

### 步骤 2: 获取访问凭证

1. 进入 [RAM 访问控制](https://ram.console.aliyun.com/)
2. 创建用户：
   - 点击"用户" → "创建用户"
   - 勾选"OpenAPI 调用访问"
   - 记录 `AccessKey ID` 和 `AccessKey Secret`
3. 授权：
   - 选择创建的用户 → "添加权限"
   - 添加 `AliyunOSSFullAccess` 权限

### 步骤 3: 配置环境变量

在 `.env.local` 中添加：

```env
ALIYUN_OSS_REGION=oss-cn-shenzhen
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_ACCESS_KEY_ID=LTAI5xxxxxxxxxxxxx
ALIYUN_OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**参数说明：**
- `REGION`：地域节点，格式为 `oss-cn-xxx`
- `BUCKET`：Bucket 名称
- `ACCESS_KEY_ID`：RAM 用户的 AccessKey ID
- `ACCESS_KEY_SECRET`：RAM 用户的 AccessKey Secret

## 三、飞书表格配置

### 步骤 1: 添加附件字段

运行脚本自动创建字段：

```bash
npx tsx src/scripts/add-attachment-fields.ts
```

这会创建以下字段：
- **头像**（附件类型）
- **大图**（附件类型）

### 步骤 2: 添加 OSS URL 字段

运行脚本自动创建字段：

```bash
npx tsx src/scripts/add-oss-fields.ts
```

这会创建以下字段：
- **头像OSS_URL**（文本类型）
- **大图OSS_URL**（文本类型）

### 步骤 3: 上传图片

在飞书表格中：
1. 点击"头像"或"大图"字段
2. 上传图片文件
3. 保存记录

## 四、同步流程

运行同步脚本：

```bash
npm run sync
```

**自动化流程：**

1. **拉取记录**：从飞书获取所有"已发布"状态的记录
2. **检查 OSS URL**：
   - 如果记录已有 `头像OSS_URL` 或 `大图OSS_URL`，直接使用
   - 如果没有，继续下一步
3. **下载附件**：从飞书下载"头像"和"大图"附件
4. **上传到 OSS**：
   - 使用 MD5 哈希作为文件名（避免重复上传）
   - 存储路径：`hnu-timeletter/{hash}.{ext}`
   - 检查文件是否已存在，存在则跳过上传
5. **回写 URL**：将 OSS URL 写回飞书表格的 OSS_URL 字段
6. **生成 JSON**：将数据写入 `src/data/content.json`

## 五、文件命名规则

- **路径前缀**：`hnu-timeletter/`
- **文件名**：MD5 哈希值（32 位十六进制）
- **扩展名**：保留原始文件扩展名

**示例：**
```
hnu-timeletter/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.jpg
hnu-timeletter/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7.png
```

**优点：**
- 相同文件只上传一次（去重）
- 文件名唯一，不会冲突
- 便于管理和清理

## 六、访问 URL 格式

上传成功后，图片的公网访问 URL 格式为：

```
https://{bucket}.{region}.aliyuncs.com/{path}
```

**示例：**
```
https://your-bucket.oss-cn-guangzhou.aliyuncs.com/hnu-timeletter/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.jpg
```

## 七、常见问题

### 1. 上传失败：AccessDenied

**原因**：RAM 用户权限不足

**解决**：
1. 检查 RAM 用户是否有 `AliyunOSSFullAccess` 权限
2. 检查 Bucket 的读写权限是否为"公共读"

### 2. 图片无法访问：403 Forbidden

**原因**：Bucket 权限设置为私有

**解决**：
1. 进入 OSS 控制台
2. 选择 Bucket → "权限管理" → "读写权限"
3. 修改为"公共读"

### 3. 下载飞书附件失败

**原因**：
- 附件 token 过期
- 应用权限不足

**解决**：
1. 检查飞书应用是否有 `drive:drive:readonly` 权限
2. 重新上传附件到飞书表格

### 4. OSS 客户端初始化失败

**原因**：环境变量配置错误

**解决**：
1. 检查 `.env.local` 中的 OSS 配置是否正确
2. 确认 `REGION` 格式为 `oss-cn-xxx`
3. 确认 AccessKey 是否有效

### 5. 文件重复上传

**原因**：脚本会自动检查文件是否存在，不应该重复上传

**解决**：
- 检查控制台输出，应该显示"文件已存在，跳过上传"
- 如果仍然重复上传，检查 MD5 计算是否正确

## 八、成本估算

阿里云 OSS 按量付费，主要费用包括：

1. **存储费用**：约 ¥0.12/GB/月（标准存储）
2. **流量费用**：约 ¥0.50/GB（外网流出）
3. **请求费用**：约 ¥0.01/万次（PUT/GET 请求）

**示例估算（100 张图片，每张 500KB）：**
- 存储：50MB ≈ ¥0.006/月
- 流量：假设每月 1000 次访问 ≈ ¥0.25/月
- 请求：100 次 PUT + 1000 次 GET ≈ ¥0.001/月
- **总计**：约 ¥0.26/月

## 九、安全建议

1. **AccessKey 安全**：
   - 不要将 AccessKey 提交到 Git
   - 定期轮换 AccessKey
   - 使用 RAM 子账号，不要使用主账号

2. **Bucket 权限**：
   - 仅设置"公共读"，不要设置"公共读写"
   - 使用 Bucket Policy 限制访问来源

3. **防盗链**：
   - 在 OSS 控制台配置 Referer 白名单
   - 防止图片被其他网站盗用

4. **备份**：
   - 定期备份重要图片
   - 考虑开启 OSS 的版本控制功能

## 十、测试脚本

项目提供了测试脚本验证 OSS 配置：

```bash
# 测试 OSS 上传（上传一个测试文件）
npx tsx src/scripts/test-oss-upload.ts
```

成功后会输出：
```
✅ 上传成功！
📍 URL: https://himematsu.oss-cn-guangzhou.aliyuncs.com/hnu-timeletter/test/xxx.txt
```

## 十一、相关文档

- [阿里云 OSS 文档](https://help.aliyun.com/product/31815.html)
- [OSS Node.js SDK](https://help.aliyun.com/document_detail/32068.html)
- [飞书附件下载 API](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download)
