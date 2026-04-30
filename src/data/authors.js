export const authors = [
  {
    id: '1',
    name: '墨香铜臭',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20a%20young%20chinese%20woman%20writer%20with%20elegant%20long%20hair%20in%20traditional%20style%20soft%20lighting%20artistic&image_size=square',
    bio: '知名网络作家，擅长仙侠、玄幻题材，作品以细腻的情感描写和宏大的世界观著称。代表作《陈情令》原著作者。',
    rating: 4.8,
    ratingCount: 125680,
    followers: 892560,
    joinedAt: '2015-03-15'
  },
  {
    id: '2',
    name: '刘慈欣',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20middle%20aged%20chinese%20male%20scientist%20writer%20thoughtful%20expression%20professional%20portrait&image_size=square',
    bio: '中国科幻文学的代表人物，《三体》三部曲作者，雨果奖得主。作品以宏大的宇宙观和深刻的哲学思考著称。',
    rating: 4.9,
    ratingCount: 256890,
    followers: 1568900,
    joinedAt: '1999-08-20'
  },
  {
    id: '3',
    name: '猫腻',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20middle%20aged%20chinese%20man%20creative%20writer%20casual%20style%20warm%20lighting&image_size=square',
    bio: '知名网络文学作家，作品风格独特，文笔细腻，擅长将传统文化与现代叙事相结合。代表作《庆余年》《择天记》。',
    rating: 4.7,
    ratingCount: 98560,
    followers: 756800,
    joinedAt: '2007-06-10'
  },
  {
    id: '4',
    name: '唐家三少',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20energetic%20chinese%20man%20best%20selling%20author%20confident%20smile&image_size=square',
    bio: '中国网络文学代表作家之一，连续多年蝉联网络作家富豪榜榜首。作品以热血、励志、升级流著称。',
    rating: 4.6,
    ratingCount: 85690,
    followers: 689500,
    joinedAt: '2004-02-28'
  },
  {
    id: '5',
    name: '辰东',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20male%20fantasy%20writer%20mysterious%20atmosphere%20dramatic%20lighting&image_size=square',
    bio: '著名网络玄幻作家，作品以宏大的世界观、热血的战斗场面和神秘的氛围著称。代表作《遮天》《完美世界》。',
    rating: 4.7,
    ratingCount: 78560,
    followers: 625800,
    joinedAt: '2006-09-15'
  },
  {
    id: '6',
    name: '顾漫',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20elegant%20chinese%20woman%20romance%20novelist%20soft%20pastel%20colors%20gentle%20expression&image_size=square',
    bio: '知名言情小说作家，作品风格温暖治愈，被誉为"言情女王"。代表作《何以笙箫默》《微微一笑很倾城》。',
    rating: 4.8,
    ratingCount: 105680,
    followers: 825600,
    joinedAt: '2005-11-20'
  }
]

export function getAuthorById(id) {
  return authors.find(a => a.id === id)
}

export function getAuthorsByRating(limit = 10) {
  return [...authors]
    .sort((a, b) => (b.rating * b.ratingCount) - (a.rating * a.ratingCount))
    .slice(0, limit)
}

export function getAuthorsByFollowers(limit = 10) {
  return [...authors]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit)
}
