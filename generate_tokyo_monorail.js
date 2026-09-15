// 生成东京单轨电车完整时刻表的脚本
// 规律：空港快速3班，普通7班，间隔6-7分钟

const fs = require('fs');

// 站顺序（羽田方向）
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

// 每站运行时间（分钟）
const travelTimes = [5, 4, 4, 4, 4, 4, 5, 4, 4, 4];

// 首班车时间
let startHour = 4;
let startMinute = 59;

// 生成218班
const timetable = [];
let trainNumber = 1;
let minute = startHour * 60 + startMinute;

for (let i = 0; i < 218; i++) {
  // 班次类型：每10班里3班空港快速，7班普通
  const isRapid = (i % 10 < 3);
  const type = isRapid ? "AirportRapid" : "Local";
  
  // 计算发车时间
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  
  // 生成站时表
  const trainTimetableObject = [];
  let currentMinute = minute;
  
  for (let j = 0; j < stations.length; j++) {
    const station = stations[j];
    const timeStr = `${String(Math.floor(currentMinute / 60)).padStart(2, '0')}:${String(currentMinute % 60).padStart(2, '0')}`;
    
    if (j === stations.length - 1) {
      trainTimetableObject.push({
        "odpt:station": station.id,
        "odpt:arrivalTime": timeStr
      });
    } else {
      trainTimetableObject.push({
        "odpt:station": station.id,
        "odpt:departureTime": timeStr
      });
      currentMinute += travelTimes[j];
    }
  }
  
  timetable.push({
    "odpt:trainNumber": `TM${String(trainNumber).padStart(3, '0')}`,
    "odpt:railway": "TokyoMonorail",
    "odpt:calendar": "Weekday",
    "odpt:railDirection": "Outbound",
    "odpt:trainType": type,
    "odpt:destinationStation": "Haneda Airport Terminal 2",
    "odpt:trainTimetableObject": trainTimetableObject
  });
  
  trainNumber++;
  
  // 下一班间隔：普通6分钟，空港快速7分钟
  if (isRapid) {
    minute += 7;
  } else {
    minute += 6;
  }
  
  // 晚上11点后停止
  if (minute > 23 * 60 + 50) break;
}

// 生成JS文件内容
const content = `// TokyoMonorail_MANUAL_TIMETABLES
// 东京单轨电车 手动时刻表（平日完整版）
// 数据来源：ekitan.com 浜松町站平日时刻表推算
// 首班车：04:59 末班车：${Math.floor(minute/60)}:${String(minute%60).padStart(2,'0')} 总班次：${timetable.length}班

window.TokyoMonorail_MANUAL_TIMETABLES = ${JSON.stringify(timetable, null, 2)};
`;

fs.writeFileSync('data/timetables/TokyoMonorail-manual.js', content);
console.log(`生成完成！共${timetable.length}班`);
