/**
 * Mock 种子数据
 * ------------------------------------------------------------------
 * 1. 图片全部使用 public/covers 下的本地 SVG，项目离线也能正常展示。
 * 2. 商品共 24 条，覆盖 6 个固定分类，字段与真实接口约定保持一致。
 * 3. 演示账号的密码仅用于本地 Mock，请勿在真实项目中使用明文密码。
 */

import { CATEGORIES, CONDITIONS } from '@/constants/product'

// 保持从 data 模块也能拿到分类枚举，便于 Mock 层单独引用
export { CATEGORIES, CONDITIONS }

/**
 * 卖家基础信息（与商品卡片、详情页卖家信息卡对应）
 */
export const SELLERS = {
  linxiao: {
    id: 'u1',
    name: '林晓',
    college: '计算机学院 · 2023级',
    contact: '微信 linxiao_campus',
    joinedAt: '2025-09-12'
  },
  zhaoyu: {
    id: 'u2',
    name: '赵宇',
    college: '机械工程学院 · 2022级',
    contact: '微信 zhaoyu_campus',
    joinedAt: '2024-09-03'
  },
  chensiyuan: {
    id: 'u3',
    name: '陈思远',
    college: '数学学院 · 2023级',
    contact: '微信 chensy_2023',
    joinedAt: '2025-09-20'
  },
  wangyutong: {
    id: 'u4',
    name: '王雨桐',
    college: '外国语学院 · 2024级',
    contact: '微信 wyt_campus',
    joinedAt: '2026-09-01'
  },
  limeng: {
    id: 'u5',
    name: '李梦',
    college: '艺术学院 · 2022级',
    contact: '微信 limeng_art',
    joinedAt: '2024-09-10'
  }
}

/**
 * 至少两个演示账号，登录页会读取这里的信息做「一键填充」。
 */
export const demoAccounts = [
  {
    ...SELLERS.linxiao,
    username: 'student',
    password: '123456'
  },
  {
    ...SELLERS.zhaoyu,
    username: 'zhaoyu',
    password: '123456'
  }
]

/**
 * 商品种子数据：seller 使用上面的 key，构建时再替换成完整对象
 */
const productSeed = [
  {
    title: 'iPad 9代 64G WiFi 深空灰',
    price: 1450,
    originalPrice: 2499,
    category: '数码电子',
    condition: '95成新',
    seller: 'linxiao',
    desc: '大二上网课买的，平时都带壳贴膜，屏幕没有划痕，电池健康度 92%。因为换了 iPad Air 所以出掉，配原装充电器和保护壳，可以约在图书馆门口当面验机。',
    createdAt: '2026-11-22T09:10:00+08:00',
    views: 326,
    favorites: 18
  },
  {
    title: '《高等数学》同济第七版 上下册',
    price: 35,
    originalPrice: 89,
    category: '教材书籍',
    condition: '九成新',
    seller: 'linxiao',
    desc: '高数课用的教材，书页干净，只有前两章有少量铅笔笔记，重点公式用荧光笔标过。上册下册一起出，单买上册 20 元，东校区可自提。',
    createdAt: '2026-11-22T08:35:00+08:00',
    views: 154,
    favorites: 9
  },
  {
    title: '索尼 WH-1000XM4 头戴降噪耳机',
    price: 950,
    originalPrice: 2299,
    category: '数码电子',
    condition: '八成新',
    seller: 'zhaoyu',
    desc: '降噪效果依然很顶，图书馆学习神器。耳罩有正常使用痕迹，功能一切正常，附收纳包和 3.5mm 音频线。想换 AirPods Max 所以回血。',
    createdAt: '2026-11-21T21:40:00+08:00',
    views: 512,
    favorites: 27
  },
  {
    title: '捷安特山地自行车 27速',
    price: 680,
    originalPrice: 1599,
    category: '运动器材',
    condition: '八成新',
    seller: 'chensiyuan',
    desc: '毕业季出车，车架无磕碰，变速和刹车都刚保养过，平时停在宿舍楼下。送车锁和打气筒，西校区看车，介意二手请绕道。',
    createdAt: '2026-11-21T19:05:00+08:00',
    views: 438,
    favorites: 21
  },
  {
    title: '优衣库轻型羽绒服 M码',
    price: 99,
    originalPrice: 399,
    category: '服饰鞋包',
    condition: '九成新',
    seller: 'limeng',
    desc: '雾霾蓝色，M 码适合 160-168 的女生，去年冬天买的只穿过三四次，没有污渍和勾丝。收纳袋还在，冬天放宿舍衣柜里太占地方了。',
    createdAt: '2026-11-21T16:20:00+08:00',
    views: 268,
    favorites: 14
  },
  {
    title: '考研英语黄皮书真题解析 2025',
    price: 28,
    originalPrice: 68,
    category: '教材书籍',
    condition: '八成新',
    seller: 'chensiyuan',
    desc: '考研上岸后整理资料，真题册做过一遍，解析册基本全新，答案和笔记是分开的，不影响二次使用。可附赠自己整理的高频词汇表。',
    createdAt: '2026-11-21T11:15:00+08:00',
    views: 189,
    favorites: 11
  },
  {
    title: '罗技 MX Master 3S 无线鼠标',
    price: 380,
    originalPrice: 699,
    category: '数码电子',
    condition: '95成新',
    seller: 'chensiyuan',
    desc: '写代码和做图都很顺手，静音微动，滚轮无漂移。今年三月京东自营购入，有购买记录，接收器和 Type-C 充电线齐全，包装盒还在。',
    createdAt: '2026-11-20T22:10:00+08:00',
    views: 401,
    favorites: 23
  },
  {
    title: '尤尼克斯羽毛球拍 双拍套装',
    price: 120,
    originalPrice: 299,
    category: '运动器材',
    condition: '九成新',
    seller: 'zhaoyu',
    desc: '入门碳素拍一对，拉了 24 磅线，平时和室友打着玩，拍框没有磕碰。送三个训练球和拍套，体育馆约球可以现场试手感。',
    createdAt: '2026-11-20T18:30:00+08:00',
    views: 233,
    favorites: 15
  },
  {
    title: '宿舍折叠床上书桌',
    price: 35,
    originalPrice: 79,
    category: '生活用品',
    condition: '九成新',
    seller: 'linxiao',
    desc: '可折叠的床上小书桌，桌面 60×40cm，放得下笔记本和 iPad，桌腿有防滑垫。搬宿舍带不走，东校区随时自提，爽快可小刀。',
    createdAt: '2026-11-20T13:25:00+08:00',
    views: 176,
    favorites: 8
  },
  {
    title: '匡威 Chuck 70 高帮 41码',
    price: 180,
    originalPrice: 569,
    category: '服饰鞋包',
    condition: '八成新',
    seller: 'zhaoyu',
    desc: '经典黑色高帮，41 码正常码数，鞋底磨损不严重，鞋面已经清洗过。因为脚瘦了半码穿不上，鞋盒还在，南门地铁站可以面交。',
    createdAt: '2026-11-19T20:55:00+08:00',
    views: 312,
    favorites: 19
  },
  {
    title: 'Kindle Paperwhite 4 8G',
    price: 320,
    originalPrice: 998,
    category: '数码电子',
    condition: '九成新',
    seller: 'wangyutong',
    desc: '看小说用的，带背光，屏幕无坏点，电池待机依旧能撑两三周。送一个磁吸保护套和几十本已购买的电子书账号不转，只出设备。',
    createdAt: '2026-11-19T15:40:00+08:00',
    views: 287,
    favorites: 16
  },
  {
    title: '迪卡侬哑铃 5kg×2',
    price: 60,
    originalPrice: 129,
    category: '运动器材',
    condition: '八成新',
    seller: 'limeng',
    desc: '包胶哑铃一对，总重 10kg，握把无锈，放宿舍练手臂和肩背刚好。因为要去健身房了所以出，北区宿舍楼下自提，不包邮。',
    createdAt: '2026-11-19T10:05:00+08:00',
    views: 142,
    favorites: 6
  },
  {
    title: '学院风双肩包 大容量',
    price: 55,
    originalPrice: 159,
    category: '服饰鞋包',
    condition: '九成新',
    seller: 'linxiao',
    desc: '米白色帆布双肩包，能放下 15.6 寸电脑，内衬有电脑隔层，背带没有起球。拍照很出片，适合上课通勤，西校区可送。',
    createdAt: '2026-11-18T19:50:00+08:00',
    views: 201,
    favorites: 12
  },
  {
    title: '小型桌面静音风扇',
    price: 19,
    originalPrice: 49,
    category: '生活用品',
    condition: '全新',
    seller: 'limeng',
    desc: '买重复了，全新未拆封，三档风速，USB 供电，放宿舍桌面或者床头都合适。包装盒有点压痕，机器本身没问题。',
    createdAt: '2026-11-18T14:30:00+08:00',
    views: 98,
    favorites: 5
  },
  {
    title: '《数据结构（C语言版）》严蔚敏',
    price: 22,
    originalPrice: 45,
    category: '教材书籍',
    condition: '九成新',
    seller: 'zhaoyu',
    desc: '计算机考研经典教材，书角有轻微磨损，内页干净，附赠自己整理的章节思维导图复印件。可以搭配算法题笔记一起出。',
    createdAt: '2026-11-18T09:20:00+08:00',
    views: 167,
    favorites: 10
  },
  {
    title: '公牛多功能插座 3米',
    price: 15,
    originalPrice: 39,
    category: '生活用品',
    condition: '八成新',
    seller: 'chensiyuan',
    desc: '六位插孔带总控开关，线长 3 米，宿舍用完全够。搬宿舍多买了一个所以出掉，功能正常，外观有轻微使用痕迹。',
    createdAt: '2026-11-17T21:45:00+08:00',
    views: 121,
    favorites: 4
  },
  {
    title: 'New Balance 574 复古跑鞋 42码',
    price: 210,
    originalPrice: 699,
    category: '服饰鞋包',
    condition: '95成新',
    seller: 'chensiyuan',
    desc: '灰色经典款，42 码，只在周末穿过几次，鞋底几乎没磨损。鞋盒、备用鞋带都在，因为又买了一双同款不同色，这双断舍离。',
    createdAt: '2026-11-17T16:10:00+08:00',
    views: 295,
    favorites: 17
  },
  {
    title: '李宁篮球 7号 室内外通用',
    price: 45,
    originalPrice: 129,
    category: '运动器材',
    condition: '九成新',
    seller: 'wangyutong',
    desc: '打了几次室外场，表皮手感还在，气密性正常。已经重新打过气，送一个简易球针，操场约球当面看球。',
    createdAt: '2026-11-17T11:00:00+08:00',
    views: 133,
    favorites: 7
  },
  {
    title: '乐高城市系列 消防局 60320',
    price: 130,
    originalPrice: 299,
    category: '其他',
    condition: '九成新',
    seller: 'zhaoyu',
    desc: '零件齐全，说明书和原盒都在，拼过一次就摆在柜子里吃灰。适合送小朋友或者自己解压，零件已经按颜色分袋装好。',
    createdAt: '2026-11-16T20:25:00+08:00',
    views: 184,
    favorites: 13
  },
  {
    title: '宿舍护眼台灯 三档调光',
    price: 20,
    originalPrice: 59,
    category: '其他',
    condition: '九成新',
    seller: 'wangyutong',
    desc: '充电款护眼台灯，三档亮度和色温可调，夹床架或者放桌面都行。电池续航正常，附 Type-C 充电线，毕业清仓带走。',
    createdAt: '2026-11-16T15:15:00+08:00',
    views: 156,
    favorites: 9
  },
  {
    title: '保温杯 500ml 全新未拆',
    price: 25,
    originalPrice: 69,
    category: '生活用品',
    condition: '全新',
    seller: 'wangyutong',
    desc: '社团活动发的纪念保温杯，316 不锈钢内胆，全新未拆封，颜色是奶白色。自己杯子太多用不上，低价转给需要的同学。',
    createdAt: '2026-11-15T18:40:00+08:00',
    views: 87,
    favorites: 3
  },
  {
    title: '大学物理实验教材套装',
    price: 18,
    originalPrice: 56,
    category: '教材书籍',
    condition: '全新',
    seller: 'wangyutong',
    desc: '包含实验教材和实验报告册，买重了一套，完全没写过名字。大一必修课直接用得上，东区快递站自取，不议价。',
    createdAt: '2026-11-15T10:30:00+08:00',
    views: 102,
    favorites: 6
  },
  {
    title: '手账本 + 贴纸套装',
    price: 12,
    originalPrice: 35,
    category: '其他',
    condition: '全新',
    seller: 'limeng',
    desc: 'A5 方格手账本，配六张原创贴纸和两支莫兰迪色中性笔，全新未使用。原本想做手账，结果坚持不下来，一起打包出。',
    createdAt: '2026-11-14T16:50:00+08:00',
    views: 76,
    favorites: 8
  },
  {
    title: '多肉盆栽 含陶瓷盆',
    price: 15,
    originalPrice: 30,
    category: '其他',
    condition: '八成新',
    seller: 'linxiao',
    desc: '养了半年的多肉，状态很好，陶瓷盆有轻微使用痕迹。宿舍阳台放不下更多了，连盆一起出，附赠一小袋颗粒土。',
    createdAt: '2026-11-13T09:45:00+08:00',
    views: 64,
    favorites: 4
  }
]

/**
 * 补全 id、封面、卖家对象
 */
export const seedProducts = productSeed.map(({ seller, ...rest }, index) => ({
  id: `p${String(index + 1).padStart(3, '0')}`,
  cover: `/covers/${(index % 8) + 1}.svg`,
  ...rest,
  seller: SELLERS[seller]
}))
