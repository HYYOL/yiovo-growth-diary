/* 食物卡路里数据库 — 80+ 常见食物
 * 数据来源:中国食物成分表(均值) / 常见营养标签
 * 每条: { id, name, cat, emoji, kcal, unit, per100, defQty, hot, alias }
 *  - kcal: 该 unit 的卡路里(比如 1 碗米饭 174 kcal)
 *  - per100: 每 100g 的卡路里,用于自定义份量
 *  - defQty: 默认份量(g),按份量调整时使用
 *  - hot: 是否推荐到快速添加栏
 *  - alias: 别名,用于 typeahead 模糊匹配
 */
window.DB = window.DB || {};
window.DB.food = [
  /* ============ 主食 ============ */
  { id:"rice",     name:"米饭",       cat:"staple",    emoji:"🍚", kcal:174, unit:"碗(150g)", per100:116, defQty:150, hot:true,  alias:"白饭 米饭" },
  { id:"noodle",   name:"面条(煮)",   cat:"staple",    emoji:"🍜", kcal:276, unit:"碗(200g)", per100:138, defQty:200, hot:true,  alias:"挂面 面" },
  { id:"mantou",   name:"馒头",       cat:"staple",    emoji:"🍞", kcal:223, unit:"个(100g)", per100:223, defQty:100, hot:true,  alias:"馍" },
  { id:"baozi",    name:"肉包子",     cat:"staple",    emoji:"🥟", kcal:227, unit:"个(100g)", per100:227, defQty:100, hot:true,  alias:"包子" },
  { id:"jiaozi",   name:"饺子",       cat:"staple",    emoji:"🥟", kcal:240, unit:"10个(250g)", per100:240, defQty:250, hot:false, alias:"水饺" },
  { id:"toast",    name:"全麦面包",   cat:"staple",    emoji:"🍞", kcal:247, unit:"片(60g)",  per100:247, defQty:60,  hot:false, alias:"面包 toast" },
  { id:"oat",      name:"燕麦片",     cat:"staple",    emoji:"🥣", kcal:389, unit:"50g 干",   per100:389, defQty:50,  hot:true,  alias:"麦片 oatmeal" },
  { id:"corn",     name:"玉米",       cat:"staple",    emoji:"🌽", kcal:112, unit:"根(200g)", per100:112, defQty:200, hot:false, alias:"苞米" },
  { id:"sweetpot", name:"红薯",       cat:"staple",    emoji:"🍠", kcal:102, unit:"个(200g)", per100:102, defQty:200, hot:false, alias:"地瓜 山芋" },
  { id:"potato",   name:"土豆(煮)",   cat:"staple",    emoji:"🥔", kcal:81,  unit:"个(150g)", per100:81,  defQty:150, hot:false, alias:"马铃薯" },
  { id:"congee",   name:"白粥",       cat:"staple",    emoji:"🍚", kcal:46,  unit:"碗(200g)", per100:46,  defQty:200, hot:false, alias:"稀饭 粥" },
  { id:"chaofan",  name:"蛋炒饭",     cat:"staple",    emoji:"🍛", kcal:340, unit:"份(300g)", per100:340, defQty:300, hot:false, alias:"炒饭" },
  { id:"chaomian", name:"炒面",       cat:"staple",    emoji:"🍝", kcal:360, unit:"份(300g)", per100:360, defQty:300, hot:false, alias:"炒面条" },
  { id:"mixian",   name:"米线",       cat:"staple",    emoji:"🍜", kcal:280, unit:"碗(300g)", per100:280, defQty:300, hot:false, alias:"米粉" },
  { id:"sushi",    name:"寿司卷",     cat:"staple",    emoji:"🍣", kcal:200, unit:"8 件(200g)", per100:200, defQty:200, hot:false, alias:"sushi" },
  { id:"hamburger",name:"汉堡",       cat:"takeaway",  emoji:"🍔", kcal:350, unit:"个",        per100:295, defQty:120, hot:true,  alias:"burger 汉堡包" },
  { id:"sandwich", name:"三明治",     cat:"takeaway",  emoji:"🥪", kcal:280, unit:"个",        per100:235, defQty:120, hot:false, alias:"sandwich" },
  { id:"pizza",    name:"披萨",       cat:"takeaway",  emoji:"🍕", kcal:250, unit:"块(100g)", per100:250, defQty:100, hot:true,  alias:"pizza" },
  { id:"kfc",      name:"炸鸡",       cat:"takeaway",  emoji:"🍗", kcal:290, unit:"块(100g)", per100:290, defQty:100, hot:true,  alias:"肯德基 kfc 炸鸡块" },
  { id:"fires",    name:"薯条",       cat:"takeaway",  emoji:"🍟", kcal:312, unit:"中份(100g)", per100:312, defQty:100, hot:true,  alias:"薯条 fries" },

  /* ============ 蛋白 ============ */
  { id:"egg",      name:"鸡蛋",       cat:"protein",   emoji:"🥚", kcal:144, unit:"2个(100g)", per100:144, defQty:100, hot:true,  alias:"蛋 煮蛋" },
  { id:"chickenbr",name:"鸡胸肉",     cat:"protein",   emoji:"🍗", kcal:133, unit:"块(100g)", per100:133, defQty:100, hot:true,  alias:"鸡胸 鸡" },
  { id:"chickenleg",name:"鸡腿",      cat:"protein",   emoji:"🍗", kcal:180, unit:"个(100g)", per100:180, defQty:100, hot:false, alias:"鸡腿肉" },
  { id:"beef",     name:"牛肉(瘦)",   cat:"protein",   emoji:"🥩", kcal:125, unit:"块(100g)", per100:125, defQty:100, hot:false, alias:"牛 牛排" },
  { id:"pork",     name:"猪肉(瘦)",   cat:"protein",   emoji:"🥓", kcal:143, unit:"块(100g)", per100:143, defQty:100, hot:false, alias:"猪里脊" },
  { id:"fish",     name:"鱼肉",       cat:"protein",   emoji:"🐟", kcal:120, unit:"块(100g)", per100:120, defQty:100, hot:false, alias:"鱼 草鱼 鲈鱼" },
  { id:"shrimp",   name:"虾",         cat:"protein",   emoji:"🦐", kcal:99,  unit:"10只(100g)", per100:99,  defQty:100, hot:false, alias:"大虾 基围虾" },
  { id:"tofu",     name:"豆腐",       cat:"protein",   emoji:"🥡", kcal:116, unit:"块(200g)", per100:116, defQty:200, hot:true,  alias:"嫩豆腐 豆花" },
  { id:"doufu",    name:"豆腐皮",     cat:"protein",   emoji:"🥡", kcal:410, unit:"50g",     per100:410, defQty:50,  hot:false, alias:"豆皮" },
  { id:"milk",     name:"纯牛奶",     cat:"protein",   emoji:"🥛", kcal:110, unit:"杯(200ml)", per100:54,  defQty:200, hot:true,  alias:"牛奶" },
  { id:"yogurt",   name:"酸奶",       cat:"protein",   emoji:"🥛", kcal:100, unit:"杯(150g)", per100:72,  defQty:150, hot:true,  alias:"酸奶" },
  { id:"doujiang", name:"豆浆",       cat:"protein",   emoji:"🥛", kcal:54,  unit:"杯(200ml)", per100:14,  defQty:200, hot:false, alias:"豆浆" },
  { id:"duck",     name:"鸭肉",       cat:"protein",   emoji:"🦆", kcal:240, unit:"块(100g)", per100:240, defQty:100, hot:false, alias:"鸭" },

  /* ============ 蔬菜 ============ */
  { id:"broccoli", name:"西兰花",     cat:"vegetable", emoji:"🥦", kcal:34,  unit:"份(100g)", per100:34,  defQty:100, hot:false, alias:"花椰菜 西蓝花" },
  { id:"tomato",   name:"番茄",       cat:"vegetable", emoji:"🍅", kcal:18,  unit:"个(100g)", per100:18,  defQty:100, hot:false, alias:"西红柿 番茄" },
  { id:"cucumber", name:"黄瓜",       cat:"vegetable", emoji:"🥒", kcal:16,  unit:"根(150g)", per100:16,  defQty:150, hot:false, alias:"青瓜" },
  { id:"lettuce",  name:"生菜",       cat:"vegetable", emoji:"🥬", kcal:15,  unit:"份(100g)", per100:15,  defQty:100, hot:false, alias:"莴苣" },
  { id:"spinach",  name:"菠菜",       cat:"vegetable", emoji:"🥬", kcal:24,  unit:"份(100g)", per100:24,  defQty:100, hot:false, alias:"菠菜" },
  { id:"cabbage",  name:"白菜",       cat:"vegetable", emoji:"🥬", kcal:16,  unit:"份(100g)", per100:16,  defQty:100, hot:false, alias:"大白菜" },
  { id:"carrot",   name:"胡萝卜",     cat:"vegetable", emoji:"🥕", kcal:39,  unit:"根(100g)", per100:39,  defQty:100, hot:false, alias:"萝卜" },
  { id:"eggplant", name:"茄子",       cat:"vegetable", emoji:"🍆", kcal:25,  unit:"根(150g)", per100:25,  defQty:150, hot:false, alias:"茄" },
  { id:"pepper",   name:"青椒",       cat:"vegetable", emoji:"🌶️", kcal:22,  unit:"个(80g)",  per100:22,  defQty:80,  hot:false, alias:"彩椒 甜椒" },
  { id:"mushroom", name:"蘑菇",       cat:"vegetable", emoji:"🍄", kcal:22,  unit:"份(100g)", per100:22,  defQty:100, hot:false, alias:"菌菇" },
  { id:"salad",    name:"蔬菜沙拉",   cat:"vegetable", emoji:"🥗", kcal:80,  unit:"份(200g)", per100:40,  defQty:200, hot:true,  alias:"沙拉 salad" },

  /* ============ 水果 ============ */
  { id:"apple",    name:"苹果",       cat:"fruit",     emoji:"🍎", kcal:95,  unit:"个(180g)", per100:52,  defQty:180, hot:true,  alias:"apple" },
  { id:"banana",   name:"香蕉",       cat:"fruit",     emoji:"🍌", kcal:107, unit:"根(120g)", per100:89,  defQty:120, hot:true,  alias:"banana" },
  { id:"orange",   name:"橙子",       cat:"fruit",     emoji:"🍊", kcal:60,  unit:"个(150g)", per100:47,  defQty:150, hot:false, alias:"桔子 橘子" },
  { id:"grape",    name:"葡萄",       cat:"fruit",     emoji:"🍇", kcal:88,  unit:"份(200g)", per100:44,  defQty:200, hot:false, alias:"提子" },
  { id:"waterm",   name:"西瓜",       cat:"fruit",     emoji:"🍉", kcal:60,  unit:"块(300g)", per100:30,  defQty:300, hot:false, alias:"西瓜" },
  { id:"straw",    name:"草莓",       cat:"fruit",     emoji:"🍓", kcal:64,  unit:"份(150g)", per100:32,  defQty:150, hot:false, alias:"草莓" },
  { id:"blue",     name:"蓝莓",       cat:"fruit",     emoji:"🫐", kcal:57,  unit:"盒(125g)", per100:57,  defQty:125, hot:false, alias:"蓝莓" },
  { id:"kiwi",     name:"猕猴桃",     cat:"fruit",     emoji:"🥝", kcal:55,  unit:"个(100g)", per100:61,  defQty:100, hot:false, alias:"奇异果 kiwi" },
  { id:"pear",     name:"梨",         cat:"fruit",     emoji:"🍐", kcal:80,  unit:"个(180g)", per100:44,  defQty:180, hot:false, alias:"梨" },
  { id:"peach",    name:"桃子",       cat:"fruit",     emoji:"🍑", kcal:48,  unit:"个(150g)", per100:48,  defQty:150, hot:false, alias:"桃" },
  { id:"mango",    name:"芒果",       cat:"fruit",     emoji:"🥭", kcal:60,  unit:"个(200g)", per100:35,  defQty:200, hot:false, alias:"芒果" },

  /* ============ 饮料 ============ */
  { id:"cola",     name:"可乐",       cat:"drink",     emoji:"🥤", kcal:84,  unit:"罐(330ml)", per100:42,  defQty:330, hot:false, alias:"coke 可口可乐" },
  { id:"sprite",   name:"雪碧",       cat:"drink",     emoji:"🥤", kcal:84,  unit:"罐(330ml)", per100:42,  defQty:330, hot:false, alias:"sprite" },
  { id:"milktea",  name:"奶茶",       cat:"drink",     emoji:"🧋", kcal:280, unit:"杯(500ml)", per100:56,  defQty:500, hot:true,  alias:"奶茶 奶盖" },
  { id:"coffee",   name:"美式咖啡",   cat:"drink",     emoji:"☕", kcal:5,   unit:"杯(200ml)", per100:2,   defQty:200, hot:true,  alias:"咖啡 美式" },
  { id:"latte",    name:"拿铁",       cat:"drink",     emoji:"☕", kcal:90,  unit:"杯(300ml)", per100:30,  defQty:300, hot:false, alias:"拿铁 latte" },
  { id:"beer",     name:"啤酒",       cat:"drink",     emoji:"🍺", kcal:150, unit:"瓶(500ml)", per100:30,  defQty:500, hot:false, alias:"啤酒 beer" },
  { id:"juice",    name:"果汁",       cat:"drink",     emoji:"🧃", kcal:110, unit:"杯(250ml)", per100:46,  defQty:250, hot:false, alias:"果汁 juice" },
  { id:"water",    name:"矿泉水",     cat:"drink",     emoji:"💧", kcal:0,   unit:"杯(200ml)", per100:0,   defQty:200, hot:false, alias:"水 矿泉水" },
  { id:"soymilk",  name:"无糖豆浆",   cat:"drink",     emoji:"🥛", kcal:30,  unit:"杯(200ml)", per100:15,  defQty:200, hot:false, alias:"无糖豆浆" },

  /* ============ 零食 ============ */
  { id:"chips",    name:"薯片",       cat:"snack",     emoji:"🍟", kcal:548, unit:"袋(60g)",  per100:548, defQty:60,  hot:false, alias:"薯片 chips" },
  { id:"choco",    name:"巧克力",     cat:"snack",     emoji:"🍫", kcal:235, unit:"条(40g)",  per100:546, defQty:40,  hot:false, alias:"chocolate 巧克力" },
  { id:"biscuit",  name:"饼干",       cat:"snack",     emoji:"🍪", kcal:180, unit:"块(30g)",  per100:480, defQty:30,  hot:false, alias:"饼干" },
  { id:"cake",     name:"奶油蛋糕",   cat:"snack",     emoji:"🍰", kcal:350, unit:"块(100g)", per100:350, defQty:100, hot:false, alias:"蛋糕" },
  { id:"icecream", name:"冰淇淋",     cat:"snack",     emoji:"🍦", kcal:140, unit:"杯(100g)", per100:140, defQty:100, hot:false, alias:"雪糕 冰激凌" },
  { id:"nut",      name:"混合坚果",   cat:"snack",     emoji:"🥜", kcal:170, unit:"30g",     per100:567, defQty:30,  hot:false, alias:"坚果 杏仁 核桃" },
  { id:"latiao",   name:"辣条",       cat:"snack",     emoji:"🌶️", kcal:140, unit:"袋(50g)", per100:430, defQty:50,  hot:false, alias:"辣条" },

  /* ============ 外卖 / 套餐 ============ */
  { id:"malatang", name:"麻辣烫",     cat:"takeaway",  emoji:"🍲", kcal:550, unit:"份(500g)", per100:110, defQty:500, hot:false, alias:"麻辣烫" },
  { id:"hotpot",   name:"火锅",       cat:"takeaway",  emoji:"🍲", kcal:800, unit:"顿",       per100:120, defQty:700, hot:false, alias:"火锅" },
  { id:"bbq",      name:"烧烤",       cat:"takeaway",  emoji:"🍢", kcal:450, unit:"份(200g)", per100:225, defQty:200, hot:false, alias:"烤肉 串" },
  { id:"lamian",   name:"兰州拉面",   cat:"takeaway",  emoji:"🍜", kcal:500, unit:"碗(500g)", per100:100, defQty:500, hot:false, alias:"拉面 兰州" },
  { id:"gaijiaofan",name:"盖浇饭",    cat:"takeaway",  emoji:"🍛", kcal:650, unit:"份(400g)", per100:163, defQty:400, hot:false, alias:"盖饭 套餐" },
  { id:"huangmen", name:"黄焖鸡米饭", cat:"takeaway",  emoji:"🍛", kcal:680, unit:"份(450g)", per100:151, defQty:450, hot:false, alias:"黄焖鸡" },
  { id:"shaxian",  name:"沙县小吃",   cat:"takeaway",  emoji:"🥡", kcal:500, unit:"份",       per100:200, defQty:300, hot:false, alias:"沙县 拌面 蒸饺" },
  { id:"luosifen", name:"螺蛳粉",     cat:"takeaway",  emoji:"🍜", kcal:560, unit:"碗(500g)", per100:112, defQty:500, hot:true,  alias:"螺蛳粉 柳州" },
  { id:"roujiamo", name:"肉夹馍",     cat:"takeaway",  emoji:"🥙", kcal:330, unit:"个(200g)", per100:165, defQty:200, hot:false, alias:"肉夹馍" },
  { id:"jianbing", name:"煎饼果子",   cat:"takeaway",  emoji:"🥞", kcal:380, unit:"个(180g)", per100:211, defQty:180, hot:false, alias:"煎饼" }
];

/* 分类中文名 + 颜色 */
window.DB.foodCat = {
  staple:    { name:"主食",   color:"#ffb84d", emoji:"🍚" },
  protein:   { name:"蛋白",   color:"#ff8a8a", emoji:"🥩" },
  vegetable: { name:"蔬菜",   color:"#7ed957", emoji:"🥦" },
  fruit:     { name:"水果",   color:"#ff7ab6", emoji:"🍎" },
  drink:     { name:"饮料",   color:"#4ab6e0", emoji:"🥤" },
  snack:     { name:"零食",   color:"#b88cff", emoji:"🍫" },
  takeaway:  { name:"外卖",   color:"#ff9b53", emoji:"🍔" }
};
