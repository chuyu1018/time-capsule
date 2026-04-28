# 时间胶囊（Time Capsule）— 设计文档

> 仿 wen-ware.com 的中国版"时间旅行 GeoGuessr"
> 创建日期：2026-04-28

## 一、产品定位

玩家被投放到一个 **360° 可拖拽的中国历史/现代场景全景**中，需在一分钟内同时猜出：

1. **地点**（在中国地图上落点）
2. **年份**（1500–2026 范围内）

按距离误差 + 年代误差给分，5 轮一局，10 关随机抽 5。

## 二、核心玩法（沿用 wen-ware）

| 维度 | 规则 |
|---|---|
| 局长度 | 5 轮 / 局 |
| 单轮时间 | 60 秒 |
| 关卡池 | 10 关，每局随机抽 5 |
| 地图 | MapLibre + OpenStreetMap raster（中国陆地范围） |
| 时间范围 | 1500–2026（共 526 年） |
| 时代分类（筛选器） | 全部 / 明（1500–1644）/ 清（1644–1912）/ 民国（1912–1949）/ 当代（1949–2026） |
| 计分公式 | 距离分 + 年代分 = 总分（5000 + 5000 = 10000 满分） |

### 计分细节

- **距离分**：`max(0, 5000 - distance_km × 5)`，1000 km 内有分
- **年代分**：`max(0, 5000 - |year_error| × 50)`，100 年内有分
- 满分 10000；总分对照"穿越者称号"（榜中榜）

## 三、视觉设计

继承 wen-ware 的混搭风：

- **底层**：iOS 26 风 Liquid Glass 浮层（计时器、回合状态、地图坞）
- **结果面板**：Win98 复古面板（呼应"时间胶囊"主题）
- **品牌**：左上角"时间胶囊"中文 logo + 古铜色调 globe 图标
- **结束画面**：朝代主题题词（如"以铜为镜，可正衣冠；以史为镜，可知兴替"— 唐太宗）

## 四、文件结构

```
time-capsule/
├── index.html              # 骨架（中文）
├── styles/
│   ├── main.css            # 主样式
│   └── glass.css           # Liquid Glass 效果
├── js/
│   ├── main.js             # 入口
│   ├── game.js             # 游戏循环 / 计分
│   ├── viewer.js           # Pannellum 360°
│   ├── map.js              # MapLibre
│   └── ui.js               # UI 状态机
├── data/
│   └── rounds.json         # 10 关
├── assets/
│   ├── panoramas/          # 全景图（占位期 + 替换期）
│   └── icons/
├── vercel.json
├── README.md
└── docs/specs/             # 本文件
```

## 五、10 关分布

按"明 2 / 清 3 / 民国 2 / 当代 3"分布。占位阶段每关用 Wikimedia Commons CC0/CC-BY 的等距柱状投影（equirectangular）全景图，后续按 prompt 包替换为 AI 生成图。

| # | 题材 | 朝代 | 年份 | 地点 | 占位图来源 |
|---|---|---|---|---|---|
| 1 | 紫禁城太和殿登基大典 | 明 | 1521 | 北京（39.916, 116.391） | Wikimedia: Forbidden City pano |
| 2 | 苏州拙政园文人雅集 | 明 | 1560 | 苏州（31.327, 120.629） | Wikimedia: Suzhou garden pano |
| 3 | 景德镇御窑烧瓷 | 清 | 1720 | 景德镇（29.270, 117.178） | 占位用古画局部 + Pannellum partial |
| 4 | 圆明园西洋楼鼎盛 | 清 | 1780 | 北京（40.008, 116.298） | 圆明园铜版画局部 |
| 5 | 广州十三行口岸 | 清 | 1840 | 广州（23.118, 113.245） | 19c 通草水彩局部 |
| 6 | 上海外滩夜景 | 民国 | 1925 | 上海（31.240, 121.490） | Wikimedia: 1920s Bund |
| 7 | 老北京胡同 | 民国 | 1935 | 北京（39.937, 116.400） | Wikimedia: 民国老北京 |
| 8 | 80 年代深圳建设工地 | 当代 | 1985 | 深圳（22.547, 114.085） | Wikimedia: 80s Shenzhen |
| 9 | 香港回归夜 | 当代 | 1997 | 香港（22.282, 114.158） | Wikimedia: HK 1997 |
| 10 | 上海陆家嘴当代天际线 | 当代 | 2024 | 上海（31.240, 121.499） | Wikimedia: Lujiazui pano |

> 注：占位图主要用于跑通游戏框架。每关数据预留 `panoramaUrl` 字段，AI 生成后直接替换 URL 即可。古代关卡（明、清）若 Wikimedia 无可用 equirectangular 全景，则用 Pannellum 的 `partialPanorama` 模式（限制视角，仍可拖拽体验）。

## 六、UI 中文化对照表

| 英文（原版） | 中文 |
|---|---|
| WenWare | 时间胶囊 |
| Round 1/5 | 第 1 / 5 关 |
| Where? | 在哪？ |
| Submit | 提交 |
| Next | 下一关 |
| Distance Error | 距离误差 |
| Historical Error | 年代误差 |
| Total Score | 总分 |
| Settings | 设置 |
| New Game | 新游戏 |
| Time Period | 时代 |
| All / Modern / Medieval / Ancient | 全部 / 当代 / 民国 / 清 / 明 |
| Time Traveller | 穿越者 |
| Submit Score | 提交战绩 |
| Again! | 再来一局 |
| Highscores | 排行榜 |
| Hide map | 收起地图 |

## 七、数据结构

`data/rounds.json`：

```json
{
  "version": 1,
  "rounds": [
    {
      "id": "round-01",
      "title": "紫禁城太和殿",
      "era": "ming",
      "year": 1521,
      "location": { "lat": 39.9163, "lng": 116.3914 },
      "panoramaUrl": "assets/panoramas/01-forbidden-city.jpg",
      "panoramaType": "equirectangular",
      "wiki": {
        "title": "太和殿",
        "url": "https://zh.wikipedia.org/wiki/太和殿",
        "summary": "紫禁城三大殿之首，明永乐十八年（1420）建成……",
        "imageCredit": "Wikimedia Commons / CC-BY"
      },
      "answer": "1521 年明世宗朱厚熜在太和殿继位"
    }
    // ... 9 more
  ]
}
```

## 八、依赖

CDN 引用，无需 npm 构建：

- **Pannellum** 2.5.6（360° 全景）— `cdn.jsdelivr.net/npm/pannellum`
- **MapLibre GL** 5.x — `unpkg.com/maplibre-gl`
- **Leaflet** 1.9.x（如沿用 wen-ware 同款 Leaflet+MapLibre 组合）
- 所有图标：本地 SVG / PNG

## 九、实施阶段

1. **阶段 1（骨架）**：HTML 结构 + CSS（含 Liquid Glass + Win98）+ 中文 UI
2. **阶段 2（数据 + 占位图）**：10 关 JSON + Wikimedia 占位图 URL
3. **阶段 3（核心逻辑）**：Pannellum 集成 + MapLibre 地图 + 计分 + 回合循环
4. **阶段 4（润色）**：结束画面、排行榜（localStorage）、移动端适配
5. **阶段 5（部署）**：GitHub repo + Vercel
6. **阶段 6（生图替换）**：每关 AI prompt 包 → 用户生图 → 替换占位

## 十、部署

- GitHub: `github.com/chuyu1018/time-capsule`
- Vercel: 推 `main` 即自动部署
- 域名：先用 Vercel 默认 `time-capsule.vercel.app`

## 十一、未来扩展（不在 v1 范围）

- 长卷古画模式（清明上河图等水平滚动漫游）
- 多人对战 / 每日挑战
- 朝代知识弹窗（深度内容）
- 中文输入法友好的搜索框
- AI 生图 + 风格统一性审核流程
