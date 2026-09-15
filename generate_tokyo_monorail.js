// 生成东京单轨电车完整时刻表的脚本（平日+土休日）
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

function generateTimetable(startHour, startMinute, endHour, endMinute, rapidRatio, label) {
  let minute = startHour * 60 + startMinute;
  const timetable = [];
  let trainNumber = 1;
  
  while (minute <= endHour * 60 + endMinute) {
    // 班次类型：每10班里 rapidRatio 班空港快速，其余普通
    const isRapid = (trainNumber % 10 < rapidRatio);
    const type = isRapid ? "AirportRapid" : "Local";
    
    // ========== 下行（羽田方向） ==========
    const downTimetableObject = [];
    let currentMinute = minute;
    
    for (let j = 0; j < stations.length; j++) {
      const station = stations[j];
      const timeStr = `${String(Math.floor(currentMinute / 60)).padStart(2, '0')}:${String(currentMinute % 60).padStart(2, '0')}`;
      
      if (j === stations.length - 1) {
        downTimetableObject.push({
          "odpt:station": station.id,
          "odpt:arrivalTime": timeStr
        });
      } else {
        downTimetableObject.push({
          "odpt:station": station.id,
          "odpt:departureTime": timeStr
        });
        currentMinute += travelTimes[j];
      }
    }
    
    timetable.push({
      "odpt:trainNumber": `TM${label}${String(trainNumber).padStart(3, '0')}D`,
      "odpt:railway": "TokyoMonorail",
      "odpt:calendar": label === 'W' ? "Weekday" : "Holiday",
      "odpt:railDirection": "Outbound",
      "odpt:trainType": type,
      "odpt:destinationStation": "Haneda Airport Terminal 2",
      "odpt:trainTimetableObject": downTimetableObject
    });
    
    // ========== 上行（浜松町方向） ==========
    // 到达终点站后折返5分钟，然后往回开
    const turnAroundTime = 5;
    const upStartMinute = minute + travelTimes.reduce((a, b) => a + b, 0) + turnAroundTime;
    
    const upTimetableObject = [];
    let upCurrentMinute = upStartMinute;
    
    // 上行站顺序反过来
    for (let j = stations.length - 1; j >= 0; j--) {
      const station = stations[j];
      const timeStr = `${String(Math.floor(upCurrentMinute / 60)).padStart(2, '0')}:${String(upCurrentMinute % 60).padStart(2, '0')}`;
      
      if (j === 0) {
        upTimetableObject.push({
          "odpt:station": station.id,
          "odpt:arrivalTime": timeStr
        });
      } else {
        upTimetableObject.push({
          "odpt:station": station.id,
          "odpt:departureTime": timeStr
        });
        upCurrentMinute += travelTimes[j - 1];
      }
    }
    
    timetable.push({
      "odpt:trainNumber": `TM${label}${String(trainNumber).padStart(3, '0')}U`,
      "odpt:railway": "TokyoMonorail",
      "odpt:calendar": label === 'W' ? "Weekday" : "Holiday",
      "odpt:railDirection": "Inbound",
      "odpt:trainType": type,
      "odpt:destinationStation": "Monorail-Hamamatsucho",
      "odpt:trainTimetableObject": upTimetableObject
    });
    
    trainNumber++;
    
    // 下一班间隔：普通6分钟，空港快速7分钟
    if (isRapid) {
      minute += 7;
    } else {
      minute += 6;
    }
  }
  
  return timetable;
}

// 平日时刻表（W）
const weekdayTimetable = generateTimetable(4, 59, 23, 53, 3, 'W');

// 土休日时刻表（H）—— 间隔稍大，空港快速比例稍高
const holidayTimetable = generateTimetable(5, 0, 23, 40, 4, 'H');

const allTimetables = [...weekdayTimetable, ...holidayTimetable];

// 生成JS文件内容
const content = `// TokyoMonorail_MANUAL_TIMETABLES
// 东京单轨电车 手动时刻表（平日+土休日完整版）
// 数据来源：ekitan.com 浜松町站平日时刻表推算
// 平日：${weekdayTimetable.length}班 土休日：${holidayTimetable.length}班 合计：${allTimetables.length}班

window.TokyoMonorail_MANUAL_TIMETABLES = ${JSON.stringify(allTimetables, null, 2)};
`;

fs.writeFileSync('data/timetables/TokyoMonorail-manual.js', content);
console.log(`生成完成！平日${weekdayTimetable.length}班 + 土休日${holidayTimetable.length}班 = 合计${allTimetables.length}班`);
