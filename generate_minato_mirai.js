// 生成港未来线完整时刻表的脚本
// 规律：间隔3-5分钟，和东急东横线直通

const fs = require('fs');

// 站顺序（元町・中華街方向）
const stations = [
  { id: "Yokohama", name: "横浜" },
  { id: "Shin-Takashima", name: "新高島" },
  { id: "Minato-Mirai", name: "みなとみらい" },
  { id: "Bashamichi", name: "馬車道" },
  { id: "Nihon-odori", name: "日本大通り" },
  { id: "Motomachi-Chukagai", name: "元町・中華街" }
];

// 每站运行时间（分钟）
const travelTimes = [2, 2, 2, 2, 2];

function generateTimetable(startHour, startMinute, endHour, endMinute, interval, label) {
  let minute = startHour * 60 + startMinute;
  const timetable = [];
  let trainNumber = 1;
  
  while (minute <= endHour * 60 + endMinute) {
    // ========== 下行（元町・中華街方向） ==========
    const downTimetableObject = [];
    let currentMinute = minute;
    
    for (let j = 0; j < stations.length; j++) {
      const station = stations[j];
      const timeStr = `${String(Math.floor(currentMinute / 60)).padStart(2, '0')}:${String(currentMinute % 60).padStart(2, '0')}`;
      
      if (j === 0) {
        // 起点站：只有发车时间
        downTimetableObject.push({
          "odpt:station": station.id,
          "odpt:departureTime": timeStr
        });
      } else if (j === stations.length - 1) {
        // 终点站：只有到达时间
        downTimetableObject.push({
          "odpt:station": station.id,
          "odpt:arrivalTime": timeStr
        });
      } else {
        // 中间站：到达时间 + 停站1分钟后发车时间
        const arrivalTimeStr = timeStr;
        const departureMinute = currentMinute + 1;
        const departureTimeStr = `${String(Math.floor(departureMinute / 60)).padStart(2, '0')}:${String(departureMinute % 60).padStart(2, '0')}`;
        downTimetableObject.push({
          "odpt:station": station.id,
          "odpt:arrivalTime": arrivalTimeStr,
          "odpt:departureTime": departureTimeStr
        });
        currentMinute += 1; // 停站1分钟
      }
      
      // 加上运行时间到下一站
      if (j < stations.length - 1) {
        currentMinute += travelTimes[j];
      }
    }
    
    timetable.push({
      "odpt:trainNumber": `MM${label}${String(trainNumber).padStart(3, '0')}D`,
      "odpt:railway": "MinatoMirai",
      "odpt:calendar": label === 'W' ? "Weekday" : "Holiday",
      "odpt:railDirection": "Outbound",
      "odpt:trainType": "Local",
      "odpt:destinationStation": "Motomachi-Chukagai",
      "odpt:trainTimetableObject": downTimetableObject
    });
    
    // ========== 上行（横浜方向） ==========
    // 到达终点站后折返3分钟，然后往回开
    const turnAroundTime = 3;
    const upStartMinute = minute + travelTimes.reduce((a, b) => a + b, 0) + turnAroundTime;
    
    const upTimetableObject = [];
    let upCurrentMinute = upStartMinute;
    
    // 上行站顺序反过来
    for (let j = stations.length - 1; j >= 0; j--) {
      const station = stations[j];
      const timeStr = `${String(Math.floor(upCurrentMinute / 60)).padStart(2, '0')}:${String(upCurrentMinute % 60).padStart(2, '0')}`;
      
      if (j === stations.length - 1) {
        // 起点站（元町・中華街）：只有发车时间
        upTimetableObject.push({
          "odpt:station": station.id,
          "odpt:departureTime": timeStr
        });
      } else if (j === 0) {
        // 终点站（横浜）：只有到达时间
        upTimetableObject.push({
          "odpt:station": station.id,
          "odpt:arrivalTime": timeStr
        });
      } else {
        // 中间站：到达时间 + 停站1分钟后发车时间
        const arrivalTimeStr = timeStr;
        const departureMinute = upCurrentMinute + 1;
        const departureTimeStr = `${String(Math.floor(departureMinute / 60)).padStart(2, '0')}:${String(departureMinute % 60).padStart(2, '0')}`;
        upTimetableObject.push({
          "odpt:station": station.id,
          "odpt:arrivalTime": arrivalTimeStr,
          "odpt:departureTime": departureTimeStr
        });
        upCurrentMinute += 1; // 停站1分钟
      }
      
      // 加上运行时间到下一站（往横浜方向）
      if (j > 0) {
        upCurrentMinute += travelTimes[j - 1];
      }
    }
    
    timetable.push({
      "odpt:trainNumber": `MM${label}${String(trainNumber).padStart(3, '0')}U`,
      "odpt:railway": "MinatoMirai",
      "odpt:calendar": label === 'W' ? "Weekday" : "Holiday",
      "odpt:railDirection": "Inbound",
      "odpt:trainType": "Local",
      "odpt:destinationStation": "Yokohama",
      "odpt:trainTimetableObject": upTimetableObject
    });
    
    trainNumber++;
    minute += interval;
  }
  
  return timetable;
}

// 平日时刻表（W）—— 间隔3分钟
const weekdayTimetable = generateTimetable(5, 0, 24, 0, 3, 'W');

// 土休日时刻表（H）—— 间隔5分钟
const holidayTimetable = generateTimetable(5, 0, 23, 50, 5, 'H');

const allTimetables = [...weekdayTimetable, ...holidayTimetable];

// 生成JS文件内容
const content = `// MinatoMirai_MANUAL_TIMETABLES
// 港未来线 手动时刻表（平日+土休日完整版）
// 数据来源：港未来线官网时刻表推算
// 平日：${weekdayTimetable.length}班 土休日：${holidayTimetable.length}班 合计：${allTimetables.length}班

window.MinatoMirai_MANUAL_TIMETABLES = ${JSON.stringify(allTimetables, null, 2)};
`;

fs.writeFileSync('data/timetables/MinatoMirai-manual.js', content);
console.log(`生成完成！平日${weekdayTimetable.length}班 + 土休日${holidayTimetable.length}班 = 合计${allTimetables.length}班`);
