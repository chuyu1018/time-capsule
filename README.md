# 时间胶囊 · Time Capsule

中国版"时间旅行 GeoGuessr"。受 [wen-ware.com](https://wen-ware.com) 启发。

> 你被投放进一个 360° 的中国历史场景。
> 拖动屏幕环顾全景，猜出**此地是何处**、**此刻是哪一年**。
> 1500–2026，明清民国当代，跨越五百余年。

## 玩法

- 5 关 / 局，每关 1 分钟
- 在地图上落点（地点）+ 拨动滑块（年份）
- 距离误差 + 年代误差 → 总分（满分 10000）
- 5 局总分对应"穿越者"称号

## 技术栈

| 模块 | 选用 |
|---|---|
| 360° 全景 | [Pannellum](https://pannellum.org) |
| 地图 | [Leaflet](https://leafletjs.com) + OpenStreetMap raster |
| 部署 | [Vercel](https://vercel.com)（静态托管） |
| 字体 | 苹方 / 宋体 SC |

## 项目结构

```
time-capsule/
├── index.html              # 入口
├── styles/
│   ├── main.css            # 主样式
│   └── glass.css           # Liquid Glass 浮层
├── js/
│   ├── main.js             # 入口、boot、事件总线
│   ├── game.js             # 计分、关卡抽取、终局称号
│   ├── viewer.js           # Pannellum 封装
│   ├── map.js              # Leaflet 地图、距离计算
│   └── ui.js               # 计时器、面板、模态框
├── data/
│   └── rounds.json         # 10 关数据
├── assets/
│   ├── panoramas/          # 全景图（待替换）
│   └── icons/
├── vercel.json
└── docs/specs/             # 设计文档
```

## 本地开发

```bash
# 任意一个静态服务器即可（不需要构建）
python3 -m http.server 8080
# 或
npx serve .
```

然后访问 http://localhost:8080。

## 占位图说明

当前所有 10 关的全景图都是 [Pannellum 官方 demo 全景](https://pannellum.org)（Atacama 沙漠、Cerro Toco、JFK 图书馆等），仅用于跑通 360° 拖拽体验。

替换计划：每关用 AI 生图替换为 **2:1 等距柱状投影（equirectangular）** 的中国历史场景全景。

## 部署

推送 `main` 分支即自动部署到 Vercel。

## License

MIT
