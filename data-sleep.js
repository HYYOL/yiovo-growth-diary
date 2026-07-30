// ================= 英语哄睡阅读：舒缓英文短文（自动朗读催眠） =================
window.DB.sleep = [
  {
    title:"The Quiet Lake",
    paras:[
      "Close your eyes, and picture a quiet lake at the end of the day.",
      "The water is still and smooth, like a sheet of soft blue glass.",
      "A gentle wind moves across the surface, and tiny ripples float away.",
      "The sun is low now, painting the sky in shades of peach and gold.",
      "You are sitting by the water, warm and safe, with nothing to do.",
      "Breathe in slowly. Breathe out even slower. Let your shoulders drop.",
      "The lake does not hurry. The lake does not worry. Neither do you.",
      "Each breath takes you a little deeper, a little closer to rest."
    ]
  },
  {
    title:"A Walk in the Forest",
    paras:[
      "Imagine walking slowly into a calm green forest just after the rain.",
      "The air is cool and clean, and it smells of earth and quiet leaves.",
      "Your steps are soft on the moss, one after another, slow and easy.",
      "Somewhere a small bird sings a sleepy song, then grows quiet again.",
      "Sunlight falls through the trees in gentle, moving patches of light.",
      "There is no clock here, no list, no rush. Only the path beneath your feet.",
      "You walk until you find a soft place to rest, and you lie down.",
      "The forest keeps you safe while your body grows heavy and calm."
    ]
  },
  {
    title:"Clouds Drifting By",
    paras:[
      "Lie back and look up at a wide, open sky full of slow white clouds.",
      "One cloud is round like a sheep, another long like a quiet river.",
      "They drift without effort, carried by a wind you cannot even feel.",
      "Pretend your thoughts are clouds, floating past and never staying.",
      "A worry appears, then leaves. A plan appears, then leaves. Just clouds.",
      "Your breathing matches the slow moving sky, in and out, in and out.",
      "The clouds do not ask anything of you. The sky simply holds them.",
      "You are held too, softly, as the light grows dim and the world grows still."
    ]
  },
  {
    title:"The Sleeping Bridge",
    paras:[
      "Far below the stars, a long bridge rests quietly over a dark river.",
      "Through the day it carried cars and laughter, strong and steady.",
      "Now the lights are low, and the water sings a slow, low song.",
      "The bridge is calm, knowing it will stand through the whole night.",
      "You may rest like the bridge, steady and unafraid, holding nothing.",
      "Let each breath be a gentle step across, until you reach the other side.",
      "On that side is a soft bed, a warm blanket, and a deep, easy sleep.",
      "The river keeps singing. You keep breathing. And slowly, you drift away."
    ]
  }
];

// ================= 哄睡英文歌曲（柔和纯音乐 · WebAudio 实时合成） =================
// notes 格式：[频率Hz, 时长秒, 0=休止] ，按钢琴音高近似（C4≈261.6）
window.DB.sleepMusic = [
  {
    id:"twinkle",
    title:"Twinkle Twinkle Little Star",
    artist:"English Lullaby",
    desc:"🌙 经典英式摇篮曲 · 像妈妈在耳边哼唱",
    notes:[
      [261.6,1],[261.6,1],[392.0,1],[392.0,1],
      [440.0,1],[440.0,1],[392.0,2],
      [349.2,1],[349.2,1],[329.6,1],[329.6,1],
      [293.6,1],[293.6,1],[261.6,2],
      [392.0,1],[392.0,1],[349.2,1],[349.2,1],
      [329.6,1],[329.6,1],[293.6,2],
      [392.0,1],[392.0,1],[349.2,1],[349.2,1],
      [329.6,1],[329.6,1],[293.6,2],
      [261.6,1],[261.6,1],[392.0,1],[392.0,1],
      [440.0,1],[440.0,1],[392.0,2],
      [349.2,1],[349.2,1],[329.6,1],[329.6,1],
      [293.6,1],[293.6,1],[261.6,2]
    ]
  },
  {
    id:"edelweiss",
    title:"Edelweiss (Lullaby version)",
    artist:"Soft Piano · English Classic",
    desc:"❄️ 雪绒花 · 钢琴缓奏 · 安宁入睡",
    notes:[
      [261.6,1.5],[293.6,1.5],[329.6,2.5],
      [293.6,1.5],[329.6,2],[392.0,3],
      [349.2,1.5],[329.6,1.5],[293.6,2.5],
      [261.6,1.5],[293.6,2],[329.6,3],
      [261.6,1.5],[293.6,1.5],[329.6,2.5],
      [349.2,1.5],[329.6,2],[293.6,3],
      [261.6,2],[293.6,2],[329.6,4]
    ]
  },
  {
    id:"river",
    title:"River Flows in You",
    artist:"Calm Piano · Yiruma Style",
    desc:"🌊 涓涓流水 · 适合给紧绷的脑袋慢慢降温",
    notes:[
      [392.0,1.5],[440.0,1.5],[493.9,1.5],
      [523.2,2.5],[493.9,1],[440.0,1.5],[392.0,2],
      [349.2,1.5],[392.0,1.5],[440.0,2.5],
      [493.9,2],[440.0,2],[392.0,3],
      [349.2,1.5],[392.0,1.5],[440.0,2.5],
      [523.2,2.5],[493.9,1],[440.0,3],
      [392.0,3.5]
    ]
  },
  {
    id:"brahms",
    title:"Brahms' Lullaby",
    artist:"德彪西风格轻钢琴",
    desc:"🍼 经典德式摇篮曲 · 童年记忆般安心",
    notes:[
      [349.2,1],[349.2,1],[440.0,1.5],[349.2,1.5],
      [392.0,1.5],[349.2,1.5],
      [329.6,1.5],[293.6,1.5],[329.6,1.5],[349.2,1.5],
      [440.0,2],[349.2,2],
      [440.0,1.5],[349.2,1.5],[440.0,1.5],[493.9,2],
      [523.2,2.5],
      [440.0,1.5],[349.2,1.5],[440.0,1.5],[493.9,2],
      [523.2,1.5],[440.0,2.5],
      [349.2,1.5],[329.6,1.5],[293.6,2],[261.6,3]
    ]
  },
  {
    id:"rain",
    title:"Soft Rain & Piano Ambient",
    artist:"WebAudio Synth",
    desc:"🌧 雨滴白噪音 + 微弱钢琴 · 物理助眠",
    notes:[
      [220.0,4],[220.0,4],[220.0,4],[220.0,4],
      [196.0,4],[196.0,4],[196.0,4],[196.0,4],
      [174.6,4],[174.6,4],[174.6,4],[174.6,4],
      [196.0,4],[220.0,4],[196.0,8]
    ]
  },
  {
    id:"amazing",
    title:"Amazing Grace (Soft)",
    artist:"English Hymn · Piano",
    desc:"🕊 奇异恩典 · 安静、温柔、被接住的感觉",
    notes:[
      [261.6,1],[329.6,1],[392.0,1.5],[392.0,1.5],
      [349.2,1.5],[329.6,1.5],[293.6,1.5],[261.6,1.5],
      [293.6,1.5],[329.6,1.5],[349.2,2.5],[349.2,1.5],
      [329.6,1.5],[293.6,1.5],[329.6,2.5],[349.6,2],
      [293.6,1.5],[261.6,1.5],[220.0,3]
    ]
  }
];