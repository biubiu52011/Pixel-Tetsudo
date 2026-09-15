// 用天王洲アイル站的真实发车时间，生成东京单轨电车完整上行时刻表

const fs = require('fs');

// 站顺序（浜松町方向，上行）
const stations = [
  { id: "Monorail-Hamamatsucho", name: "浜松町" },
  { id: "Tennozu Isle", name: "天王洲アイル" },
  { id: "Oi Keibajo Mae", name: "大井競馬場前" },
  { id: "Ryutsu Center", name: "流通センター" },
  { id: "Showajima", name: "昭和島" },
  { id: "Seibijo", name: "整備場" },
  { id: "Tenkubashi", name: "天空橋" },
  { id: "Haneda Airport Terminal 3", name: "羽田空港第3ターミナル" },
  { id: "Shin-Seibijo", name: "新整備場" },
  { id: "Haneda Airport Terminal 1", name: "羽田空港第1ターミナル" },
  { id: "Haneda Airport Terminal 2", name: "羽田空港第2ターミナル" }
];

// 每站运行时间（分钟）——从浜松町往羽田方向
const travelTimes = [5, 4, 4, 4, 4, 4, 5, 4, 4, 4];

// 天王洲アイル站上行（浜松町方向）平日发车时间（分钟，从0点开始算）
const tennozuUpTimes = [
  5*60+16, 5*60+26, 5*60+38, 5*60+46, 5*60+52,
  6*60+3, 6*60+13, 6*60+23, 6*60+31, 6*60+37, 6*60+43, 6*60+46, 6*60+51, 6*60+59,
  7*60+4, 7*60+8, 7*60+12, 7*60+17, 7*60+21, 7*60+25, 7*60+29, 7*60+33, 7*60+37, 7*60+41, 7*60+45, 7*60+49, 7*60+53, 7*60+57,
  8*60+1, 8*60+5, 8*60+9, 8*60+13, 8*60+17, 8*60+21, 8*60+25, 8*60+29, 8*60+33, 8*60+37, 8*60+41, 8*60+45, 8*60+49, 8*60+53, 8*60+57,
  9*60+1, 9*60+5, 9*60+9, 9*60+13, 9*60+18, 9*60+22, 9*60+28, 9*60+32, 9*60+40, 9*60+50,
  10*60+0, 10*60+10, 10*60+20, 10*60+30, 10*60+40, 10*60+50,
  11*60+0, 11*60+10, 11*60+20, 11*60+30, 11*60+40, 11*60+50,
  12*60+0, 12*60+10, 12*60+20, 12*60+30, 12*60+40, 12*60+50,
  13*60+0, 13*60+10, 13*60+20, 13*60+30, 13*60+40, 13*60+50,
  14*60+0, 14*60+10, 14*60+20, 14*60+30, 14*60+40, 14*60+50,
  15*60+0, 15*60+10, 15*60+20, 15*60+30, 15*60+40, 15*60+50,
  16*60+0, 16*60+10, 16*60+20, 16*60+30, 16*60+40, 16*60+50,
  17*60+0, 17*60+9, 17*60+18, 17*60+27, 17*60+36, 17*60+45, 17*60+54,
  18*60+3, 18*60+12, 18*60+21, 18*60+30, 18*60+35, 18*60+39, 18*60+48, 18*60+53, 18*60+57,
  19*60+6, 19*60+12, 19*60+20, 19*60+26, 19*60+29, 19*60+36, 19*60+42, 19*60+46, 19*60+52, 19*60+58,
  20*60+6, 20*60+12, 20*60+18, 20*60+25, 20*60+31, 20*60+37, 20*60+42, 20*60+47, 20*60+54,
  21*60+1, 21*60+6, 21*60+12, 21*60+17, 21*60+24, 21*60+31, 21*60+38, 21*60+45, 21*60+51, 21*60+56,
  22*60+3, 22*60+13, 22*60+23, 22*60+31, 22*60+36, 22*60+44, 22*60+53,
  23*60+4, 23*60+20, 23*60+35, 23*60+50,
  24*60+5 // 次日00:05
];

// 生成上行时刻表（浜松町方向）
const upTimetables = tennozuUpTimes.map((tennozuTime, index) => {
  // 天王洲アイル发车时间往前推5分钟 = 浜松町到达时间
  // 浜松町是终点站，所以是到达时间
  const hamamatsuchoArrival = tennozuTime - travelTimes[0];
  
  // 然后从浜松町往羽田方向反推
  // 不，不对，上行是从羽田往浜松町开
  // 天王洲アイル发车时间 = 羽田方向过来，经过天王洲アイル，然后往浜松町开
  // 所以天王洲アイル发车时间往前推，就是从羽田过来的时间
  
  // 让我重新理一下：
  // 上行方向：羽田空港第2ターミナル → ... → 天王洲アイル → 浜松町
  // 天王洲アイル发车时间是tennozuTime
  // 那么：
  // - 天王洲アイル → 浜松町：运行5分钟 → 浜松町到达时间 = tennozuTime + 5
  // - 羽田空港第2ターミナル → ... → 天王洲アイル：全程40分钟 → 羽田发车时间 = tennozuTime - 40 + 1（停站时间）
  
  // 不对，我应该从天王洲アイル往两边推
  // 往浜松町方向：天王洲アイル发车 → 浜松町到达
  // 往羽田方向：天王洲アイル发车 → ... → 羽田空港第2ターミナル到达？不对，上行是从羽田往浜松町开
  
  // 哦！对！上行是从羽田往浜松町开
  // 所以列车从羽田出发，经过所有站，到达天王洲アイル，然后再到浜松町
  // 天王洲アイル的发车时间 = 从羽田过来，到天王洲アイル停了一下，然后发车
  
  // 那我们从天王洲アイル往羽田方向反推：
  // 天王洲アイル发车时间 = tennozuTime
  // 大井競馬場前到达时间 = tennozuTime + 1（停站时间）？不对，方向反了
  
  // 啊！我搞反了！上行是从羽田往浜松町开
  // 站顺序（从羽田到浜松町）：
  // 羽田2 → 羽田1 → 新整備場 → 羽田3 → 天空橋 → 整備場 → 昭和島 → 流通センター → 大井競馬場前 → 天王洲アイル → 浜松町
  
  // 所以天王洲アイル的下一站是浜松町
  // 天王洲アイル发车时间 = tennozuTime
  // 浜松町到达时间 = tennozuTime + 5分钟（运行时间）
  
  // 天王洲アイル的上一站是大井競馬場前
  // 大井競馬場前发车时间 = tennozuTime - 4分钟（运行时间） - 1分钟（停站时间）
  // 不对，应该是：
  // 大井競馬場前发车 → 运行4分钟 → 天王洲アイル到达 → 停站1分钟 → 天王洲アイル发车
  
  // 所以：天王洲アイル到达时间 = tennozuTime - 1
  // 大井競馬場前发车时间 = tennozuTime - 1 - 4 = tennozuTime - 5
  
  // 对！这样就对了！
  
  // 现在生成完整的站时表
  const trainTimetableObject = [];
  
  // 从羽田往浜松町方向，站顺序是反过来的
  // 索引：0=羽田2, 1=羽田1, 2=新整備場, 3=羽田3, 4=天空橋, 5=整備場, 6=昭和島, 7=流通センター, 8=大井競馬場前, 9=天王洲アイル, 10=浜松町
  
  // 天王洲アイル在索引9的位置
  const tennozuIndex = 9;
  
  // 先计算天王洲アイル的时间
  let currentTime = tennozuTime;
  
  // 天王洲アイル是中间站，有到达和发车时间
  trainTimetableObject[tennozuIndex] = {
    "odpt:station": stations[tennozuIndex].id,
    "odpt:arrivalTime": formatTime(currentTime - 1),
    "odpt:departureTime": formatTime(currentTime)
  };
  
  // 往浜松町方向（索引增加的方向）
  // 天王洲アイル → 浜松町（索引10）
  currentTime += travelTimes[9]; // 天王洲アイル到浜松町的运行时间
  trainTimetableObject[10] = {
    "odpt:station": stations[10].id,
    "odpt:arrivalTime": formatTime(currentTime)
  };
  
  // 往羽田方向（索引减少的方向）
  // 天王洲アイル → 大井競馬場前 → 流通センター → ... → 羽田2
  currentTime = tennozuTime - 1; // 天王洲アイル到达时间（往回推停站时间）
  
  for (let i = tennozuIndex - 1; i >= 0; i--) {
    // 从大井競馬場前到天王洲アイル的运行时间是travelTimes[i]
    // 所以大井競馬場前发车时间 = 天王洲アイル到达时间 - travelTimes[i]
    currentTime -= travelTimes[i];
    
    if (i === 0) {
      // 羽田2是起点站，只有发车时间
      trainTimetableObject[i] = {
        "odpt:station": stations[i].id,
        "odpt:departureTime": formatTime(currentTime)
      };
    } else {
      // 中间站：到达时间 + 停站1分钟后发车时间
      const arrivalTime = currentTime;
      trainTimetableObject[i] = {
        "odpt:station": stations[i].id,
        "odpt:arrivalTime": formatTime(arrivalTime),
        "odpt:departureTime": formatTime(arrivalTime - 1)
      };
      // 往回再推1分钟停站时间
      currentTime -= 1;
    }
  }
  
  return {
    "odpt:trainNumber": `TMW${String(index + 1).padStart(3, '0')}U`,
    "odpt:railway": "TokyoMonorail",
    "odpt:calendar": "Weekday",
    "odpt:railDirection": "Inbound",
    "odpt:trainType": "Local",
    "odpt:destinationStation": "Monorail-Hamamatsucho",
    "odpt:trainTimetableObject": trainTimetableObject
  };
});

function formatTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

console.log(`生成上行时刻表：${upTimetables.length}班`);

// 生成JS文件内容
const content = `// TokyoMonorail_UP_MANUAL_TIMETABLES
// 东京单轨电车上行（浜松町方向）平日时刻表
// 数据来源：ekitan.com 天王洲アイル站真实发车时间推算
// 班次数量：${upTimetables.length}班

window.TokyoMonorail_UP_MANUAL_TIMETABLES = ${JSON.stringify(upTimetables, null, 2)};
`;

fs.writeFileSync('data/timetables/TokyoMonorail-up-manual.js', content);
console.log('文件已生成：data/timetables/TokyoMonorail-up-manual.js');
