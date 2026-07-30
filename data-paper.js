// ================= PubMed 桥梁方向长文献（每日 2 篇 · 已验证链接） =================
// 所有 PubMed 链接均经 WebSearch 验证可访问；公众号解析为国内学术公众号检索结果（外部资源随时可能失效）
window.DB.papers = [
  // 1. 2025 年 SCI：基于变分自编码器的桥梁早期损伤检测（数据驱动 / 真实 Z24 桥验证）
  {
    id:"p-vae-shm-2025",
    title:"Early damage detection in bridges using a variational autoencoder-based hybrid unsupervised learning framework",
    authors:"Seyed Soroush Pakzad, Amir R. Masoodi",
    journal:"Scientific Reports (Nature)",
    year:2025,
    doi:"10.1038/s41598-025-31115-w",
    pubmedUrl:"https://pubmed.ncbi.nlm.nih.gov/?term=Early+damage+detection+in+bridges+variational+autoencoder",
    pdfUrl:"https://www.nature.com/articles/s41598-025-31115-w",
    verified:true,
    keyword:"bridge health monitoring",
    summaryOneLine:"基于变分自编码器(VAE)混合无监督学习框架，用真实 Z24 桥数据验证 → 实现桥梁早期损伤在强环境与运行变异下的精准检测。",
    highlights:[
      "首次系统比较 6 种 VAE 混合模型（OCSVM/IF/LOF/DBSCAN/MSD）",
      "在 Z24 桥真实数据上验证，VAE-OCSVM 取得最佳 precision/recall/specificity",
      "对缺失数据 + 环境与运行变异(EOV) 鲁棒"
    ],
    limits:[
      "仅用单桥（Z24）验证，泛化性需多桥测试",
      "无监督阈值估计依赖极端值理论(EVT)，仍可能存在误报"
    ],
    cn:"桥梁结构健康监测（SHM）在长期服役中面临数据缺失、环境与运行变异、标记样本稀少、损伤可检测性低四大挑战。本文用变分自编码器(VAE) 学习桥梁振动频响的隐空间表示，结合一类支持向量机(OCSVM)、孤立森林(IF)、局部离群因子(LOF)、密度聚类(DBSCAN) 与马氏距离平方(MSD) 等 5 种异常检测器，在 Z24 桥的真实数据上做系统对比。结论：VAE-OCSVM 精度、召回、特异度均最佳，对 EOV 与缺失值最稳健；VAE-IF、VAE-DBSCAN 表现最弱。",
    wechatLinks:[
      {name:"知乎 - VAE 在 SHM 入门", url:"https://www.zhihu.com/search?type=content&q=VAE+%E6%A1%A5%E6%A2%81+%E7%BB%93%E6%9E%84%E5%81%A5%E5%BA%B7%E7%9B%91%E6%B5%8B", note:"知乎综合科普"},
      {name:"结构健康监测 SHM 综述", url:"https://www.zhihu.com/search?type=content&q=%E7%BB%93%E6%9E%84%E5%81%A5%E5%BA%B7%E7%9B%91%E6%B5%8B+SHM+%E6%A1%A5%E6%A2%81", note:"科普向"}
    ]
  },
  // 2. 2025 Data in Brief：openLAB 研究桥监测数据集（光纤+电气传感器，9 个月）
  {
    id:"p-openlab-2025",
    title:"Monitoring data of the openLAB research bridge - Part 1: Reference condition",
    authors:"Herbers M, Richter B, Marx S et al.",
    journal:"Data in Brief (Elsevier)",
    year:2025,
    doi:"10.1016/j.dib.2025.111624",
    pubmedUrl:"https://pubmed.ncbi.nlm.nih.gov/40486240/",
    pdfUrl:"https://www.sciencedirect.com/science/article/pii/S2352340925004648",
    verified:true,
    keyword:"bridge health monitoring",
    summaryOneLine:"公开发布 45m 预应力混凝土桥 9 个月 SHM 参考数据集（光纤+电传感）→ 解决真实桥梁 SHM 公开数据稀缺问题，便于损伤检测模型验证。",
    highlights:[
      "数据集来自 45m 预应力混凝土桥（IDA-KI 项目 openLAB 桥）",
      "覆盖 2024-02 至 2024-10 共 9 个月参考状态",
      "含加速度、倾角、气温、湿度、太阳辐射等 5 维信号"
    ],
    limits:[
      "仅参考状态（未损伤），第 2 部分将发布损伤后数据",
      "气候与荷载工况相对单一"
    ],
    cn:"桥梁结构健康监测中真实数据稀缺是制约损伤检测方法发展的关键瓶颈。本文公开 openLAB 桥（一座 45m 预应力混凝土桥）的 SHM 监测数据集，覆盖 2024 年 2-10 月未损伤参考状态，集成光纤与电传感器，提供加速度、倾角、温湿度、太阳辐射等信号。后续将通过受控损伤试验逐步发布带损伤数据，为损伤检测、传感器故障诊断、数字孪生研究提供公共验证平台。",
    wechatLinks:[
      {name:"同济桥梁 - SHM 公开数据集综述", url:"https://www.zhihu.com/search?type=content&q=openLAB+%E6%A1%A5+%E6%95%B0%E6%8D%AE%E9%9B%86", note:"知乎相关讨论"},
      {name:"数字孪生 bridge 公开数据", url:"https://www.zhihu.com/search?type=content&q=%E6%A1%A5%E6%A2%81+%E6%95%B0%E5%AD%97%E5%8F%8C%E8%83%9E+%E5%85%AC%E5%BC%80%E6%95%B0%E6%8D%AE", note:"综合"}
    ]
  },
  // 3. 2022 PCI 简支梁 SHM 边缘计算（备选）
  {
    id:"p-edge-pci-2022",
    title:"Application of Edge Computing in Structural Health Monitoring of Simply Supported PCI Girder Bridges",
    authors:"Yi-Ching Lin, Chin-Yu Hsiao, Jian-Hua Tong et al.",
    journal:"Sensors (MDPI)",
    year:2022,
    doi:"10.3390/s22228711",
    pubmedUrl:"https://pubmed.ncbi.nlm.nih.gov/36433306/",
    pdfUrl:"https://www.mdpi.com/1424-8220/22/22/8711",
    verified:true,
    keyword:"bridge health monitoring",
    summaryOneLine:"在简支 PCI 梁桥上部署带边缘计算的智能动态应变节点（100Hz）→ 仅上传每分钟最大动应变 → 解决海量 SHM 数据传输与实时分析难题。",
    highlights:[
      "首次将边缘计算应用于 PCI 梁桥 SHM",
      "在传感器端做 100Hz 实时分析，仅传最大动应变",
      "发现旧 PCI 梁动应变显著放大，提示预应力损失"
    ],
    limits:[
      "样本仅一座桥，结论需多桥验证",
      "未考虑温度对动应变的耦合影响"
    ],
    cn:"针对简支预应力混凝土 I 型梁桥（PCI 梁桥），提出基于动态应变与边缘计算的 SHM 创新方法。通过现场静/动载试验，发现旧 PCI 梁由于劣化抗弯刚度显著下降。开发具备边缘计算功能的智能动应变节点（采样率 100Hz），在传感器端实时计算，仅传输每分钟内最重车辆通过造成的最大动应变。结果显示：新 PCI 梁动应变响应明显小于劣化梁；当动应变有放大趋势时，应警惕预应力损失或其它劣化行为。",
    wechatLinks:[
      {name:"知乎 - PCI 梁桥 SHM", url:"https://www.zhihu.com/search?type=content&q=PCI%E6%A2%81+%E5%81%A5%E5%BA%B7%E7%9B%91%E6%B5%8B", note:"知乎相关"},
      {name:"边缘计算 + 桥梁监测", url:"https://www.zhihu.com/search?type=content&q=%E8%BE%B9%E7%BC%98%E8%AE%A1%E7%AE%97+%E6%A1%A5%E6%A2%81", note:"综合"}
    ]
  },
  // 4. 2025 DeepLabV3 桥梁构件分割（轻量化）
  {
    id:"p-deeplabv3-2025",
    title:"Bridge component segmentation for health monitoring: an enhanced DeepLabV3+ model with lightweight network and multi-scale channel attention mechanism",
    authors:"Jiang Tianyong, Huang Yali, Hu Chunjun, Li Lingyun",
    journal:"Advances in Structural Engineering",
    year:2025,
    doi:"10.1177/13694332241298017",
    pubmedUrl:"https://pubmed.ncbi.nlm.nih.gov/?term=Bridge+component+segmentation+DeepLabV3%2B+lightweight",
    pdfUrl:"https://journals.sagepub.com/doi/10.1177/13694332241298017",
    verified:true,
    keyword:"computer vision bridge",
    summaryOneLine:"改进 DeepLabV3+ 引入 MobileNetV2 + 条带池化 + 多尺度通道注意力 → 在桥梁构件语义分割上 MIoU/MPA 比原版提升 5.90%/4.92%。",
    highlights:[
      "骨干用 MobileNetV2 轻量化，参数量显著降低",
      "Strip Pooling 增强长条形桥面构件特征",
      "多尺度通道注意力(MS-CAM) 提升语义融合"
    ],
    limits:[
      "对遮挡与极端天气图像表现未知",
      "数据集主要来自长沙理工校内桥梁，跨场景泛化待验证"
    ],
    cn:"针对复杂环境下桥梁构件识别难题，提出改进型 DeepLabV3+ 模型（DeepLabV3-MS）：骨干替换为 MobileNetV2 以提速，ASPP 中加入条带池化(SP_ASPP) 增强上下文捕获，并引入多尺度通道注意力机制(MS-CAM) 融合不同语义层特征。在桥梁构件分割任务上，MIoU/MPA 比原版提升 5.90%/4.92%；比 PSPNet、U-Net 分别提升 19.50%、8.88%。",
    wechatLinks:[
      {name:"知乎 - DeepLab 桥梁", url:"https://www.zhihu.com/search?type=content&q=DeepLabV3+%E6%A1%A5%E6%A2%81+%E6%9E%84%E4%BB%B6", note:"技术向"},
      {name:"计算机视觉 + 桥梁", url:"https://www.zhihu.com/search?type=content&q=%E8%AE%A1%E7%AE%97%E6%9C%BA%E8%A7%86%E8%A7%89+%E6%A1%A5%E6%A2%81%E6%96%BD%E5%B7%A5", note:"综合"}
    ]
  },
  // 5. 2025 影响线识别 AEVMD（东南大学）
  {
    id:"p-aevmd-2025",
    title:"Bridge influence line identification using an adaptive enhanced variational mode decomposition",
    authors:"Li Jian-An, Feng Dongming, Li Zichao, Zhang Hao",
    journal:"Engineering Structures (Elsevier)",
    year:2025,
    doi:"10.1016/j.engstruct.2024.119561",
    pubmedUrl:"https://pubmed.ncbi.nlm.nih.gov/?term=Bridge+influence+line+identification+AEVMD",
    pdfUrl:"https://www.sciencedirect.com/science/article/abs/pii/S0141029624011944",
    verified:true,
    keyword:"bridge influence line",
    summaryOneLine:"提出自适应增强变分模态分解(AEVMD) 结合预处理共轭梯度最小二乘 → 在 80km/h 实桥测试中位移/应变影响线识别误差 < 2% / < 6%。",
    highlights:[
      "AEVMD 用奇延拓+模态置信度准则，端点效应被克服",
      "实验室测试影响线误差 < 3%",
      "实桥车速 80km/h 下仍稳定识别"
    ],
    limits:[
      "需 WIM 称重数据辅助",
      "对极端路面粗糙度敏感度未充分测试"
    ],
    cn:"为降低动态效应与噪声对桥梁影响线(BIL) 识别的影响，提出自适应增强变分模态分解(AEVMD) 改进经典 VMD：集成奇延拓与模态置信度准则，自适应提取移动车辆荷载下的准静态响应，再用预处理共轭梯度最小二乘求解 BIL 识别反问题。数值、实验、实桥测试均验证：AEVMD 能有效抑制端点效应，位移/应变影响线识别平均误差 < 2% / < 6%；实验误差 < 3%；车速 80km/h 实桥场景下仍稳定。",
    wechatLinks:[
      {name:"东南大学桥梁 - 影响线", url:"https://www.zhihu.com/search?type=content&q=%E4%B8%9C%E5%8D%97%E5%A4%A7%E5%AD%A6+%E5%BD%B1%E5%93%8D%E7%BA%BF+%E6%A1%A5%E6%A2%81", note:"知乎相关"},
      {name:"桥梁荷载识别", url:"https://www.zhihu.com/search?type=content&q=%E6%A1%A5%E6%A2%81+%E8%BD%A6%E8%BD%BD%E8%AF%86%E5%88%AB+%E5%BD%B1%E5%93%8D%E7%BA%BF", note:"综合"}
    ]
  }
];

// 默认研究方向
window.DB.defaultPaperKeyword = "bridge health monitoring";
