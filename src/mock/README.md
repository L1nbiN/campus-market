# Mock 数据层说明

`src/mock/` 是项目内置的 Mock 适配层，目标是让项目 **不依赖后端、不依赖外网** 也能完整演示所有功能。

## 工作方式

```text
页面 / Pinia
    │
    ▼
src/api/product.js  /  src/api/user.js
    │  判断 import.meta.env.VITE_USE_MOCK !== 'false'
    ├── 是（默认）──▶ src/mock/index.js ──▶ 内存数据 + localStorage（延迟 300ms）
    └── 否 ────────▶ src/api/request.js ──▶ 真实后端接口
```

- Mock 接口统一返回 Promise，成功时 resolve 业务数据，失败时 reject `Error`。
- `mockRequest()` 会把 Mock 错误交给 `ElMessage` 统一提示，与 axios 模式保持一致。
- 所有接口都模拟了 **300ms** 延迟，方便观察骨架屏和 loading 状态。

## 已实现的 Mock 能力

| 能力 | 说明 |
| --- | --- |
| 商品列表 | 分类筛选、关键词搜索（标题 / 描述 / 卖家）、最新 / 价格升序 / 价格降序、分页 |
| 商品详情 | 按 id 查询，每次读取浏览量 +1，返回当前用户收藏状态 |
| 发布商品 | 登录校验、必填校验、写入 localStorage，刷新后仍然存在 |
| 收藏 | 按用户隔离，toggle 收藏 / 取消收藏，收藏数联动 |
| 我的收藏 | 按收藏时间倒序返回商品列表 |
| 登录 / 注册 | 2 个演示账号 + 注册账号（localStorage 持久化），返回 Mock token |

## 演示账号

| 用户名 | 密码 |
| --- | --- |
| `student` | `123456` |
| `zhaoyu` | `123456` |

## 切换到真实后端

1. 在项目根目录新建 `.env.local`（已被 `.gitignore` 忽略）：

   ```env
   VITE_USE_MOCK=false
   VITE_API_BASE=http://localhost:8080/api
   ```

2. 重启开发服务器：

   ```bash
   npm run dev
   ```

3. 后端按下面的接口约定实现即可，前端页面代码无需改动。

> 注意：环境变量只在 Vite 启动时读取，修改后必须重启 dev server 才会生效。

## 接口约定

所有接口默认以 `VITE_API_BASE` 为前缀。

### 登录

```http
POST /auth/login
Content-Type: application/json

{ "username": "student", "password": "123456" }
```

```json
{
  "token": "your-jwt-token",
  "userInfo": {
    "id": "u1",
    "username": "student",
    "name": "林晓",
    "college": "计算机学院 · 2023级",
    "contact": "微信 linxiao_campus",
    "joinedAt": "2025-09-12"
  }
}
```

### 注册

```http
POST /auth/register

{ "username": "newuser", "password": "123456", "name": "新同学", "college": "计算机学院 · 2024级" }
```

返回 `{ "userInfo": { ... } }` 即可。前端注册成功后会再调用一次登录接口完成自动登录。

### 商品列表

```http
GET /products?category=数码电子&keyword=iPad&sort=latest&page=1&pageSize=12
```

- `sort`：`latest` | `price-asc` | `price-desc`
- 个人中心会额外传 `sellerId`，后端需要支持按卖家筛选（可选参数）。
- 返回：

```json
{
  "list": [
    {
      "id": "p001",
      "title": "iPad 9代 64G WiFi 深空灰",
      "price": 1450,
      "originalPrice": 2499,
      "category": "数码电子",
      "condition": "95成新",
      "cover": "/covers/1.svg",
      "desc": "……",
      "seller": {
        "id": "u1",
        "name": "林晓",
        "college": "计算机学院 · 2023级",
        "contact": "微信 linxiao_campus",
        "joinedAt": "2025-09-12"
      },
      "createdAt": "2026-11-22T09:10:00+08:00",
      "views": 326,
      "favorites": 18,
      "favorited": false
    }
  ],
  "total": 24,
  "page": 1,
  "pageSize": 12
}
```

### 商品详情

```http
GET /products/:id
```

返回单个商品对象（结构同上），`favorited` 表示当前登录用户是否已收藏。

### 发布商品

```http
POST /products
Authorization: Bearer <token>

{
  "title": "……",
  "price": 99,
  "originalPrice": 199,
  "category": "生活用品",
  "condition": "九成新",
  "desc": "……",
  "cover": "data:image/jpeg;base64,……"
}
```

### 我的收藏

```http
GET /favorites
Authorization: Bearer <token>
```

返回商品对象数组（结构同上）。

### 收藏 / 取消收藏

```http
POST /favorites/:id/toggle
Authorization: Bearer <token>
```

```json
{ "id": "p001", "favorited": true, "favorites": 19 }
```

### 响应结构

`src/api/request.js` 的响应拦截器兼容两种返回：

- 直接返回业务数据：`{ ... }`
- 统一包裹结构：`{ "code": 0, "data": { ... }, "message": "ok" }`

`code` 为 `0` 或 `200` 时视为成功，其余会 `ElMessage.error(message)` 并 reject。

## localStorage 键名

Mock 数据只存在当前浏览器中，可以在 DevTools → Application → Local Storage 中查看 / 清除：

| 键名 | 内容 |
| --- | --- |
| `campus_market_token` | 登录 token（Mock token 同时用于识别当前用户） |
| `campus_market_user` | 当前登录用户信息 |
| `campus_market_mock_products` | 用户发布的商品 |
| `campus_market_mock_users` | 注册的账号（含明文密码，仅用于本地演示） |
| `campus_market_mock_favorites:<userId>` | 指定用户的收藏 id 列表 |

> 想恢复初始数据：清除上述 `campus_market_*` 键后刷新页面即可。

## 已知限制

- Mock 数据仅存在浏览器本地，换浏览器 / 设备不会同步。
- 发布图片以 DataURL 形式存入 localStorage，图片过大可能触发容量限制（上传组件已压缩到 1200px 宽、JPEG 0.8）。
- 注册账号密码为明文存储，仅用于本地演示，真实项目必须由后端加盐哈希。
- 浏览量、收藏数等为模拟数据，不具备真实业务含义。
