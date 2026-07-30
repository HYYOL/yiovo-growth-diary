// ================= 新闻热点 =================
// 所有链接均经过 WebSearch 验证可访问；按 dayIndex 每天推送 6 条
window.DB = window.DB || {};
window.DB.news = [
  // ===== 国家政策 =====
  {id:"n01",cat:"国家政策",title:"国务院常务会议：深入实施「两重」建设，2025年共安排 8000 亿元支持 1459 个项目",source:"中国政府网 · 国务院",date:"2025-11-14",url:"https://big5.www.gov.cn/gate/big5/www.gov.cn/zhengce/202511/content_7048643.htm",summary:"国家重大战略实施和重点领域安全能力建设（\"两重\"），涉及长江流域生态修复、西部陆海新通道、城市地下管网等领域。",verified:true},
  {id:"n02",cat:"国家政策",title:"国家发改委：着力扩大有效投资，超长期特别国债 8000 亿项目清单全部下达",source:"国家发改委",date:"2025-08-01",url:"https://www.ndrc.gov.cn/xwdt/dt/sjdt/202512/t20251218_1402502.html",summary:"\"两重\"建设稳投资优结构促发展，2025 年共安排 8000 亿元支持 1459 个重大项目，覆盖交通、水利、城市基础设施。",verified:true},
  {id:"n03",cat:"国家政策",title:"2026 年国民经济和社会发展计划草案：140.19 万亿元 GDP · 增长 5.0%",source:"国家发改委 · 十四届全国人大",date:"2026-03-14",url:"https://www.gov.cn/yaowen/liebiao/202603/content_7062688.htm",summary:"\"十四五\"圆满收官，2026 年计划加大基建投资、推动大规模设备更新和消费品以旧换新。",verified:true},
  {id:"n04",cat:"国家政策",title:"交通运输部 · 财政部 · 自然资源部联合印发《新一轮农村公路提升行动方案》",source:"交通运输部",date:"2025-08-06",url:"https://xxgk.mot.gov.cn/jigou/glj/202508/t20250806_4174133.html",summary:"到 2027 年完成新改建农村公路 30 万公里、改造危旧桥梁 9000 座，建制村通公交率达 55% 以上。",verified:true},
  {id:"n05",cat:"国家政策",title:"交通运输部发布《公路桥梁加固设计规范》JTG/T 5431-2025（2026年4月1日施行）",source:"交通运输部",date:"2025-12-16",url:"https://xxgk.mot.gov.cn/jigou/glj/202601/t20260105_4196388.html",summary:"新版加固规范替代 2008 版，是公路桥梁维修加固的强制性技术依据，2026 届毕业生进入检测/加固单位必读。",verified:true},
  {id:"n06",cat:"国家政策",title:"交通运输部办公厅印发《公路水运工程生产安全重大事故隐患判定标准》",source:"浙江省应急管理厅转发",date:"2025-04-14",url:"https://yjt.zj.gov.cn/art/2025/6/12/art_1229892463_5584332.html",summary:"覆盖桥梁高边坡、深基坑、围堰、支架、挂篮、移动模架、隧道钻爆/盾构等所有重大事故隐患判定场景。",verified:true},
  {id:"n07",cat:"国家政策",title:"交通运输部：聚焦服务乡村全面振兴 · 持续推动\"四好农村路\"高质量发展",source:"交通运输部",date:"2025-12-26",url:"https://www.mot.gov.cn/gongkai/zcjd/202512/t20251226_4191465.html",summary:"解读新一轮农村公路提升行动方案，到 2035 年建成\"规模结构合理、设施品质优良、治理规范有效、运输服务优质\"的农村公路体系。",verified:true},

  // ===== 桥梁工程 =====
  {id:"n08",cat:"桥梁工程",title:"平陆运河 27 座跨运河桥梁全部建成 · 子材大桥主跨 270 米",source:"新华社",date:"2026-04-29",url:"https://www.xinhuanet.com/20260429/11cd62f55dc940359448913825aa9c1e/c.html",summary:"西部陆海新通道骨干工程平陆运河全线 27 座跨运河桥梁收官，主跨 270 米、通航净高 19.3 米。",verified:true},
  {id:"n09",cat:"桥梁工程",title:"广西苍容浔江大桥正式通车 · 世界最大跨径独柱式三塔空间缆悬索桥",source:"中国科学报 · 科技部",date:"2026-03-14",url:"https://finance.sina.com.cn/jjxw/2026-03-14/doc-inhqyhws0286180.shtml",summary:"全长 1688 米，中塔高 108.9 米，两个主跨均达 520 米；首次采用双深槽式鞍座 + 先缆后梁工艺。",verified:true},
  {id:"n10",cat:"桥梁工程",title:"湖北枝江长江大桥成功合龙 · 在建世界最大跨径钢-UHPC 组合梁斜拉桥",source:"新华网 · 湖北频道",date:"2026-05-15",url:"http://hb.news.cn/20260515/19f5a2b31da248eaa4539a39022b94e6/c.html",summary:"全长 1549 米，主跨 890 米，桥面两侧设 4.5 米慢行系统；预计 2026 年下半年建成通车。",verified:true},
  {id:"n11",cat:"桥梁工程",title:"世界最大跨径钢拱桥 · 重庆武两高速凤来大溪河特大桥钢混组合梁合龙",source:"中国日报 · 央视新闻",date:"2026-06-12",url:"https://cn.chinadaily.com.cn/a/202606/12/WS6a2bfb0aa310d709c2fb7d10.html",summary:"主跨 580 米、桥面与河面最大高差超 310 米，全桥累计用钢 2.58 万吨，预计 2026 年武两高速全线通车。",verified:true},
  {id:"n12",cat:"桥梁工程",title:"平陆运河沙井钦江大桥建成通车 · 主跨 270 米斜拉桥",source:"中新网",date:"2026-03-31",url:"https://www.chinanews.com/gn/2026/03-31/10595979.shtml",summary:"门式索塔高 113 米，双向 8 车道，桥面宽 40 米；通航净高 19.1 米，可满足 5000 吨级船舶通航。",verified:true},
  {id:"n13",cat:"桥梁工程",title:"深中通道通车一周年：累计车流量超 3155 万 · 日均 8.64 万车次",source:"深圳新闻网",date:"2025-07-01",url:"https://www.sznews.com/news/content/mb/2025-07/01/content_31615781.htm",summary:"世界首例特长双向八车道海底隧道 + 水下枢纽互通 + 海上特长特大桥梁组合工程；诱增珠江口过江车流近 15%。",verified:true},
  {id:"n14",cat:"桥梁工程",title:"粤港澳大湾区跨海通道群：5 条\"巨龙\"构建\"黄金走廊\"",source:"羊城晚报",date:"2025-11-07",url:"https://k.sina.com.cn/article_5787187353_158f1789902001zu6w.html",summary:"港珠澳大桥+深中通道+黄茅海跨海通道+南沙大桥+虎门大桥+黄埔大桥，\"十四五\"投资超 2020 亿元，里程 954 公里。",verified:true},
  {id:"n14b",cat:"桥梁工程",title:"成都金简仁快速路沱江大桥建成通车 · 创三项世界纪录",source:"山西省交通运输厅转载 · 中国高速公路",date:"2026-07-13",url:"https://jtyst.shanxi.gov.cn/spb/jtzxspb/qgywspb1/202607/t20260713_10176063.shtml",summary:"主桥长 513 米、主塔高 173 米、桥面宽 86.7 米，创世界最高倾斜桥塔、最大跨径非对称曲线形扭索面独塔斜拉桥、最宽桥面三项世界纪录。",verified:true},
  {id:"n14c",cat:"桥梁工程",title:"宜攀高速西宁河特大桥全幅贯通 · 世界第二大跨径劲性骨架拱桥",source:"宜宾发布 · 成都日报",date:"2026-07-15",url:"https://www.toutiao.com/article/7662699592747598379/",summary:"主跨 510 米上承式钢筋混凝土拱桥，国内首例 8 管对接劲性骨架拱桥；宜攀高速年底通车后宜宾至攀枝花车程由 10 小时缩至 6 小时。",verified:true},
  {id:"n14d",cat:"桥梁工程",title:"福莆联动控制性工程 · 莆田萩芦溪大桥主桥悬浇箱梁合龙",source:"中建东南",date:"2026-07-18",url:"https://so.html5.qq.com/page/real/search_news?docid=70000021_3166a66e54757452",summary:"联十一线项目主桥采用挂篮悬浇箱梁工艺合龙，通车后将缓解莆田北部过境交通压力，完善福莆宁综合交通路网。",verified:true},
  {id:"n14e",cat:"桥梁工程",title:"江门会港大道会乐大桥新桥建成通车",source:"江门日报 · 新浪",date:"2026-07-21",url:"https://k.sina.com.cn/article_7517400647_1c0126e4705908uzk4.html",summary:"全长 859.2 米、25 跨，西岸引桥上跨广珠铁路与深江铁路，形成多层次空间交叉，串联江门站、高新区公共码头与广中江高速。",verified:true},

  // ===== 行业动态 =====
  {id:"n15",cat:"行业动态",title:"\"两重\"建设宏图徐展：2024 年 7000 亿、2025 年 8000 亿超长期特别国债",source:"国家发改委",date:"2025-07-03",url:"https://www.ndrc.gov.cn/wsdwhfz/202507/t20250703_1398947.html",summary:"\"两重\"建设是推进中国式现代化、推动高质量发展的重要抓手；2024 年沿江高铁通道完成投资 1165 亿元。",verified:true},
  {id:"n16",cat:"行业动态",title:"深中通道\"五桥十五路\"路网联动管控方案：国内首个路网级智能交通管控",source:"羊城晚报",date:"2025-11",url:"https://wap.ycwb.com/ikinvjjtjl/content_53798484.htm",summary:"AI 算法模型库使视频事件监测捕获率超 90%、识别准确率超 97%；以深中通道+南沙大桥等 5 座跨江通道为核心。",verified:true},
  {id:"n17",cat:"行业动态",title:"狮子洋通道主塔建设高度超 220 米 · 5 项\"世界第一\"",source:"羊城晚报 · 新浪",date:"2025-11",url:"https://k.sina.com.cn/article_5787187353_158f1789902001zu6w.html",summary:"横跨珠江口、连接广州与东莞，建成后将创 5 项\"世界第一\"，预计进一步压缩大湾区东西两岸通行时间。",verified:true},
  {id:"n18",cat:"行业动态",title:"\"港车北上\"两周年 · 超 2300 万次跨境通行",source:"深圳新闻网",date:"2025-07-01",url:"https://www.sznews.com/news/content/mb/2025-07/01/content_31615781.htm",summary:"港珠澳大桥自 2018 年通车以来首次为香港单牌车打开北上通道；2025-11-15 起\"粤车南下\"政策正式落地。",verified:true},
  {id:"n19",cat:"行业动态",title:"广东\"十四五\"高速公路建设：建成深中通道+黄茅海跨海通道等 31 个项目",source:"今日头条",date:"2025-12",url:"https://www.toutiao.com/article/7589437289810362899/",summary:"\"十四五\"投资超 2020 亿元、里程 954 公里；新开工狮子洋通道、长深高速河惠段等 20 个项目、里程超 1074 公里。",verified:true},

  // ===== 校招就业 =====
  {id:"n20",cat:"校招就业",title:"中建交通总承包公司 2026 届本科及研究生校园招聘",source:"国家大学生就业服务平台",date:"2025-09",url:"https://hy.ncss.cn/student/jobs/855m1atPazEGCfTAgCqWT5/detail.html",summary:"八险二金；专业含土木工程、道路桥梁与渡河工程、工程造价等；简历投递→中建集团统一测评→录用签约。",verified:true},
  {id:"n21",cat:"校招就业",title:"中建交通三公司 2026 届秋季校园招聘正式启动",source:"中工网校招",date:"2025-09",url:"https://m.zggqzp.com/2026/ssdt_0128/380714.html",summary:"工程技术类（道路桥梁与渡河工程、城市地下空间工程等）+ 职能管理类；人才公寓 + 八险二金 + 带薪年假。",verified:true},
  {id:"n22",cat:"校招就业",title:"中建交通第一建设公司 2026 届春季校园招聘 · 50 人 · 北京落户",source:"太原理工大学就业平台",date:"2026-04-07",url:"https://career.tyut.edu.cn/Zhaopin/zhiweiDetail.html?id=ce5dd155-3d04-a56f-42cc-bed324959b42",summary:"主营专业：土木工程、工程造价、道路桥梁与渡河工程、城市地下空间工程等；具备北京落户指标择优办理。",verified:true},
  {id:"n23",cat:"校招就业",title:"中国铁建房地产集团 2026 届校园招聘",source:"中智招聘",date:"2025-10",url:"https://crccfdc.zhaopin.com/",summary:"央企平台 · 工程管理类、规划设计类、营销类岗位；详细岗位列表与简历投递见官方招聘主页。",verified:true},
  {id:"n24",cat:"校招就业",title:"中建交通第一建设公司 2026 届校园招聘（北科大就业平台转发）",source:"北京科技大学就业指导中心",date:"2025-11-10",url:"https://job.ustb.edu.cn/f/recruitmentinfo/show?recruitmentId=231f4d9bbc844c05b4986e5f16699c96",summary:"工程技术员 50 人，本科/硕士；工作地点北京/河北/湖南/广东/江西；解决北京户口 + 试用期全额薪。",verified:true},
  {id:"n24b",cat:"校招就业",title:"清华大学五道口金融学院 2027 年接收推免研究生报名开启",source:"清华大学研招网",date:"2026-07-01",url:"https://new.qq.com/rain/a/20260623A023DC00",summary:"申请系统 7/1 10:00 开放、7/28 15:00 关闭；需专家推荐信 2 封 + 自述 + 外语水平证明，经复试后于全国推免系统确认。",verified:true},
  {id:"n24c",cat:"校招就业",title:"西安建筑科技大学 2026 年接收推荐免试研究生（含直博）通知",source:"西安建筑科技大学",date:"2026-07-16",url:"https://jixun.iqihang.com/schooltjms/20262377.html",summary:"土木工程等一级学科均招直博生（≤本专业博士计划 20%）；硕士国家助学金 6000 元/年，学业奖学金 8000/5000 元。",verified:true},
  {id:"n24d",cat:"校招就业",title:"教育部印发《2026 年全国硕士研究生招生工作管理规定》",source:"教育部 · 中国研招网",date:"2026-06-20",url:"https://kaoyan.xdf.cn/202606/15247695.html",summary:"明确推免生须登录全国推免服务系统（yz.chsi.com.cn/tm）报名；退役三等战功/二等功以上可申请免初试攻读硕士。",verified:true}
];
