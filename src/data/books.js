import { authors } from './authors'

export const categories = [
  { id: 'all', name: '全部' },
  { id: 'xuanhuan', name: '玄幻' },
  { id: 'xianxia', name: '仙侠' },
  { id: 'dushi', name: '都市' },
  { id: 'yanqing', name: '言情' },
  { id: 'kehuan', name: '科幻' },
  { id: 'lishi', name: '历史' },
  { id: 'wuxia', name: '武侠' }
]

export const books = [
  {
    id: '1',
    title: '魔道祖师',
    authorId: '1',
    author: '墨香铜臭',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20fantasy%20novel%20cover%20with%20elegant%20young%20man%20in%20white%20robes%20ancient%20china%20misty%20mountains%20artistic&image_size=portrait_4_3',
    category: 'xianxia',
    categoryName: '仙侠',
    status: '已完结',
    wordCount: 568900,
    chapterCount: 113,
    rating: 4.9,
    ratingCount: 89560,
    views: 15689000,
    favorites: 256890,
    description: '前世的魏无羡万人唾骂，声名狼藉。被情同手足的师弟带人端了老巢，身陨形灭……十三年后，被人献舍重生。重生后的魏无羡，与曾经的死对头蓝忘机相遇，开启了一段奇幻冒险。',
    tags: ['仙侠', '耽美', '重生', '修仙'],
    lastUpdated: '2016-12-28',
    featured: true
  },
  {
    id: '2',
    title: '三体',
    authorId: '2',
    author: '刘慈欣',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=science%20fiction%20novel%20cover%20three%20suns%20in%20space%20dramatic%20cosmic%20scene%20epic%20scale&image_size=portrait_4_3',
    category: 'kehuan',
    categoryName: '科幻',
    status: '已完结',
    wordCount: 905600,
    chapterCount: 30,
    rating: 4.95,
    ratingCount: 256890,
    views: 56890000,
    favorites: 895600,
    description: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。在半人马座三星上，"三体文明"正处于毁灭的边缘。',
    tags: ['科幻', '宇宙', '人类命运', '硬科幻'],
    lastUpdated: '2010-11-20',
    featured: true
  },
  {
    id: '3',
    title: '庆余年',
    authorId: '3',
    author: '猫腻',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historical%20chinese%20drama%20novel%20cover%20young%20scholar%20in%20elegant%20robes%20palace%20background%20mysterious%20atmosphere&image_size=portrait_4_3',
    category: 'lishi',
    categoryName: '历史',
    status: '已完结',
    wordCount: 3658900,
    chapterCount: 345,
    rating: 4.85,
    ratingCount: 78560,
    views: 25689000,
    favorites: 456890,
    description: '积善之家，必有余庆，留余庆，留余庆，忽遇恩人；幸娘亲，幸娘亲，积得阴功。劝人生，济困扶穷……而谁可知，人生于世，上承余庆，终究却是要自己做出道路抉择。',
    tags: ['历史', '穿越', '权谋', '武侠'],
    lastUpdated: '2009-04-25',
    featured: true
  },
  {
    id: '4',
    title: '斗罗大陆',
    authorId: '4',
    author: '唐家三少',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20martial%20arts%20novel%20cover%20young%20hero%20with%20powerful%20martial%20soul%20epic%20battle%20scene%20vibrant%20colors&image_size=portrait_4_3',
    category: 'xuanhuan',
    categoryName: '玄幻',
    status: '已完结',
    wordCount: 3158900,
    chapterCount: 336,
    rating: 4.7,
    ratingCount: 65890,
    views: 35689000,
    favorites: 525800,
    description: '唐门外门弟子唐三，因偷学内门绝学为唐门所不容，跳崖明志时却发现没有死，反而以另外一个身份来到了另一个世界，一个属于武魂的世界，名叫斗罗大陆。',
    tags: ['玄幻', '武魂', '升级', '热血'],
    lastUpdated: '2010-08-20',
    featured: true
  },
  {
    id: '5',
    title: '遮天',
    authorId: '5',
    author: '辰东',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=epic%20fantasy%20novel%20cover%20ancient%20coffin%20floating%20in%20cosmic%20space%20mysterious%20ancient%20civilization%20dramatic%20lighting&image_size=portrait_4_3',
    category: 'xuanhuan',
    categoryName: '玄幻',
    status: '已完结',
    wordCount: 5689000,
    chapterCount: 635,
    rating: 4.75,
    ratingCount: 58560,
    views: 28569000,
    favorites: 425800,
    description: '冰冷与黑暗并存的宇宙深处，九具庞大的龙尸拉着一口青铜古棺，正在穿越无尽太空。这是一个极为震撼的画面，九龙拉棺，究竟是回到了上古，还是来到了星空的彼岸？',
    tags: ['玄幻', '修仙', '热血', '升级'],
    lastUpdated: '2013-05-20',
    featured: false
  },
  {
    id: '6',
    title: '微微一笑很倾城',
    authorId: '6',
    author: '顾漫',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=romance%20novel%20cover%20young%20couple%20playing%20online%20game%20sweet%20romantic%20soft%20pastel%20colors%20modern%20style&image_size=portrait_4_3',
    category: 'yanqing',
    categoryName: '言情',
    status: '已完结',
    wordCount: 285600,
    chapterCount: 35,
    rating: 4.8,
    ratingCount: 85690,
    views: 18569000,
    favorites: 325800,
    description: '如果你"惨"遭抛弃，回头时却有个一白衣飘飘的人一直等你，你会怎样？微微一笑，奈何倾城。陌上花开，可缓缓归矣。',
    tags: ['言情', '网游', '甜宠', '校园'],
    lastUpdated: '2008-08-15',
    featured: false
  },
  {
    id: '7',
    title: '择天记',
    authorId: '3',
    author: '猫腻',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20martial%20arts%20novel%20cover%20young%20monk%20scholar%20with%20sword%20mystical%20ancient%20temple%20cherry%20blossoms&image_size=portrait_4_3',
    category: 'xuanhuan',
    categoryName: '玄幻',
    status: '已完结',
    wordCount: 3258900,
    chapterCount: 298,
    rating: 4.7,
    ratingCount: 52580,
    views: 15869000,
    favorites: 285600,
    description: '太始元年，有神石自太空飞来，分散落在人间，其中落在东土大陆的神石，上面镌刻着奇怪的图腾，人因观其图腾而悟道，后立国教。',
    tags: ['玄幻', '修仙', '热血', '励志'],
    lastUpdated: '2017-05-20',
    featured: false
  },
  {
    id: '8',
    title: '何以笙箫默',
    authorId: '6',
    author: '顾漫',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=romance%20novel%20cover%20couple%20reunion%20under%20street%20lamp%20rainy%20night%20emotional%20soft%20blue%20lighting&image_size=portrait_4_3',
    category: 'yanqing',
    categoryName: '言情',
    status: '已完结',
    wordCount: 325600,
    chapterCount: 32,
    rating: 4.85,
    ratingCount: 98560,
    views: 22569000,
    favorites: 385600,
    description: '如果世界上曾经有那个人出现过，其他人都会变成将就，我不愿意将就。一段年少时的爱恋，牵出一生的纠缠。',
    tags: ['言情', '都市', '虐恋', '破镜重圆'],
    lastUpdated: '2003-09-20',
    featured: false
  },
  {
    id: '9',
    title: '完美世界',
    authorId: '5',
    author: '辰东',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=epic%20fantasy%20novel%20cover%20young%20savage%20warrior%20in%20ancient%20wilderness%20towering%20ancient%20trees%20powerful%20aura&image_size=portrait_4_3',
    category: 'xuanhuan',
    categoryName: '玄幻',
    status: '已完结',
    wordCount: 6258900,
    chapterCount: 678,
    rating: 4.65,
    ratingCount: 45890,
    views: 22569000,
    favorites: 356800,
    description: '一粒尘可填海，一根草斩尽日月星辰，弹指间星河都为之幻灭，日月星辰都无光。一位少年从大荒中走出，一切只是开始……',
    tags: ['玄幻', '修仙', '热血', '升级'],
    lastUpdated: '2016-08-15',
    featured: false
  },
  {
    id: '10',
    title: '流浪地球',
    authorId: '2',
    author: '刘慈欣',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=science%20fiction%20novel%20cover%20earth%20flying%20through%20space%20giant%20engines%20on%20surface%20dramatic%20cosmic%20journey&image_size=portrait_4_3',
    category: 'kehuan',
    categoryName: '科幻',
    status: '已完结',
    wordCount: 185600,
    chapterCount: 15,
    rating: 4.9,
    ratingCount: 156890,
    views: 35689000,
    favorites: 589600,
    description: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人再次挺身而出。',
    tags: ['科幻', '宇宙', '生存', '硬科幻'],
    lastUpdated: '2000-07-10',
    featured: false
  },
  {
    id: '11',
    title: '天官赐福',
    authorId: '1',
    author: '墨香铜臭',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20fantasy%20novel%20cover%20celestial%20god%20in%20white%20robes%20descending%20from%20heaven%20cherry%20blossoms%20divine%20light&image_size=portrait_4_3',
    category: 'xianxia',
    categoryName: '仙侠',
    status: '已完结',
    wordCount: 885600,
    chapterCount: 190,
    rating: 4.85,
    ratingCount: 75890,
    views: 12569000,
    favorites: 225800,
    description: '为你，所向披靡！C天R地小妖精攻×仙风道骨收破烂受。八百年前，谢怜是金枝玉叶的太子殿下，风光无限的天之骄子。谁知一朝得道飞升，成为万人供奉的武神，却是急转直下，一贬再贬贬无可贬。',
    tags: ['仙侠', '耽美', '甜宠', '虐恋'],
    lastUpdated: '2017-11-28',
    featured: false
  },
  {
    id: '12',
    title: '生肖守护神',
    authorId: '4',
    author: '唐家三少',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20novel%20cover%20twelve%20chinese%20zodiac%20guardians%20powerful%20warriors%20ancient%20symbols%20vibrant%20epic%20scene&image_size=portrait_4_3',
    category: 'xuanhuan',
    categoryName: '玄幻',
    status: '已完结',
    wordCount: 2589000,
    chapterCount: 278,
    rating: 4.6,
    ratingCount: 42580,
    views: 15869000,
    favorites: 256800,
    description: '十二生肖，象征着十二个月份，但是，没有人知道，他们也象征着十二位守护者。十二位传承着生肖血脉的守护者。他们拥有着自身属相的能力，默默的守卫着东方。',
    tags: ['玄幻', '都市', '异能', '热血'],
    lastUpdated: '2008-01-20',
    featured: false
  }
]

export function getBookById(id) {
  return books.find(b => b.id === id)
}

export function getBooksByAuthor(authorId) {
  return books.filter(b => b.authorId === authorId)
}

export function getBooksByCategory(categoryId, limit = 20) {
  if (categoryId === 'all') {
    return books.slice(0, limit)
  }
  return books.filter(b => b.category === categoryId).slice(0, limit)
}

export function searchBooks(keyword) {
  if (!keyword) return []
  const lowerKeyword = keyword.toLowerCase()
  return books.filter(b => 
    b.title.toLowerCase().includes(lowerKeyword) ||
    b.author.toLowerCase().includes(lowerKeyword) ||
    b.tags.some(t => t.toLowerCase().includes(lowerKeyword))
  )
}

export function getFeaturedBooks(limit = 6) {
  return books.filter(b => b.featured).slice(0, limit)
}

export function getTopBooksByViews(limit = 10) {
  return [...books].sort((a, b) => b.views - a.views).slice(0, limit)
}

export function getTopBooksByFavorites(limit = 10) {
  return [...books].sort((a, b) => b.favorites - a.favorites).slice(0, limit)
}

export function getTopBooksByRating(limit = 10) {
  return [...books]
    .sort((a, b) => (b.rating * b.ratingCount) - (a.rating * a.ratingCount))
    .slice(0, limit)
}

export function getLatestBooks(limit = 10) {
  return [...books]
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, limit)
}
