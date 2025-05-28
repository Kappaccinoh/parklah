// Parking spot data type definition
export interface ParkingSpot {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  pricePerHour: number;
  isLegal: boolean;
  type: string;
  walkTime: number;
  peakHours: string;
  availabilityDescription: string;
  findingProbability: number;
  trafficFrequency: number[];
  entrances: { name: string; description: string }[];
  busyTimes: { time: string; status: string }[];
  tips: string;
}

// Parking spots in Malaysia (KL area) with accurate coordinates and walking times
export const parkingSpots: ParkingSpot[] = [
  {
    id: 1,
    name: "Pavilion KL Parking",
    address: "Jalan Bukit Bintang, Bukit Bintang",
    lat: 3.1492139,   // from 3° 08′ 57.17″ N → 3.1492139 :contentReference[oaicite:0]{index=0}
    lng: 101.7135278, // from 101° 42′ 48.70″ E → 101.7135278 :contentReference[oaicite:1]{index=1}
    capacity: 1800,
    pricePerHour: 6,
    isLegal: true,
    type: "mall",
    walkTime: 2,
    peakHours: "10AM-10PM",
    availabilityDescription: "Good chance of finding parking",
    findingProbability: 75,
    trafficFrequency: [20, 15, 10, 8, 12, 25, 45, 65, 80, 85, 90, 95, 85, 75, 70, 80, 85, 90, 85, 70, 55, 40, 30, 25],
    entrances: [
      { name: "Main Entrance", description: "Via Jalan Bukit Bintang" },
      { name: "Side Entrance", description: "Via Jalan Raja Chulan" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "High" },
      { time: "Evening (6PM-10PM)", status: "Very High" },
      { time: "Night (10PM-12AM)", status: "Moderate" },
    ],
    tips: "Best to arrive before 11AM on weekends. Valet service available.",
  },
  {
    id: 2,
    name: "KLCC Suria Mall Parking",
    address: "Kuala Lumpur City Centre, 50088",
    lat: 3.1573751,   // from coordinatesfinder.com :contentReference[oaicite:2]{index=2}
    lng: 101.7123808, // from coordinatesfinder.com :contentReference[oaicite:3]{index=3}
    capacity: 5400,
    pricePerHour: 5,
    isLegal: true,
    type: "mall",
    walkTime: 5,
    peakHours: "9AM-11PM",
    availabilityDescription: "Large parking complex with many spots",
    findingProbability: 85,
    trafficFrequency: [15, 10, 8, 5, 10, 20, 40, 70, 85, 95, 98, 95, 90, 85, 80, 85, 90, 95, 90, 75, 60, 45, 30, 20],
    entrances: [
      { name: "P1 Entrance", description: "Via Jalan Ampang" },
      { name: "P2 Entrance", description: "Via Persiaran KLCC" },
      { name: "Mall Entrance", description: "Direct mall access" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Moderate" },
      { time: "Afternoon (12PM-6PM)", status: "High" },
      { time: "Evening (6PM-10PM)", status: "Very High" },
      { time: "Night (10PM-12AM)", status: "Low" },
    ],
    tips: "Very crowded on weekends. Use P2 entrance for less congestion.",
  },
  {
    id: 3,
    name: "Street Parking - Jalan Alor",
    address: "Jalan Alor, Bukit Bintang, 50200",
    lat: 3.1458721907041074,  // from 2markers.com :contentReference[oaicite:4]{index=4}
    lng: 101.70890872430671,  // from 2markers.com :contentReference[oaicite:5]{index=5}
    capacity: 40,
    pricePerHour: 3,
    isLegal: true,
    type: "street",
    walkTime: 1,
    peakHours: "6PM-12AM",
    availabilityDescription: "Few spots, arrive early",
    findingProbability: 35,
    trafficFrequency: [10, 8, 5, 5, 8, 15, 25, 35, 40, 45, 50, 55, 60, 65, 70, 75, 85, 95, 90, 80, 70, 50, 30, 15],
    entrances: [
      { name: "From Jalan Bukit Bintang", description: "Turn right into Jalan Alor" },
      { name: "From Jalan Changkat", description: "Direct access" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "Low" },
      { time: "Evening (6PM-10PM)", status: "Very High" },
      { time: "Night (10PM-2AM)", status: "High" },
    ],
    tips: "Food street gets very busy after 7PM. Limited spots, arrive early.",
  },
  {
    id: 4,
    name: "Unauthorized - Jalan P. Ramlee",
    address: "Jalan P. Ramlee, Golden Triangle, 50250",
    lat: 3.1550234,   // from postcode.my :contentReference[oaicite:6]{index=6}
    lng: 101.7086407, // from postcode.my :contentReference[oaicite:7]{index=7}
    capacity: 15,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 2,
    peakHours: "High risk during office hours",
    availabilityDescription: "Risky but often available",
    findingProbability: 80,
    trafficFrequency: [5, 5, 5, 5, 10, 20, 40, 80, 90, 85, 80, 75, 70, 75, 80, 85, 90, 85, 70, 50, 30, 20, 10, 8],
    entrances: [{ name: "Roadside", description: "⚠️ Risk of summons RM50-150" }],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Not recommended. High chance of summons during business hours.",
  },
  {
    id: 5,
    name: "Berjaya Times Square Parking",
    address: "1, Jalan Imbi, Bukit Bintang, 55100",
    lat: 3.142222,   // from Wikipedia (theme park coords) :contentReference[oaicite:8]{index=8}
    lng: 101.710556, // from Wikipedia (theme park coords) :contentReference[oaicite:9]{index=9}
    capacity: 2200,
    pricePerHour: 4,
    isLegal: true,
    type: "mall",
    walkTime: 4,
    peakHours: "11AM-9PM",
    availabilityDescription: "Plenty of spaces",
    findingProbability: 90,
    trafficFrequency: [15, 12, 10, 8, 12, 20, 35, 50, 60, 65, 70, 75, 70, 65, 60, 65, 70, 75, 70, 60, 45, 35, 25, 20],
    entrances: [
      { name: "Main Entrance", description: "Via Jalan Imbi" },
      { name: "West Entrance", description: "Via Jalan Pudu" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "Moderate" },
      { time: "Evening (6PM-10PM)", status: "High" },
      { time: "Night (10PM-12AM)", status: "Low" },
    ],
    tips: "Large capacity, usually has spaces available. Good backup option.",
  },
  {
    id: 6,
    name: "Starling Mall Parking",
    address: "No. 6, Jalan SS 21/37, Damansara Utama, 47400",
    lat: 3.134716,    // from The Starling official site :contentReference[oaicite:10]{index=10}
    lng: 101.623136,  // from The Starling official site :contentReference[oaicite:11]{index=11}
    capacity: 1800,
    pricePerHour: 3,
    isLegal: true,
    type: "mall",
    walkTime: 3,
    peakHours: "11AM-9PM",
    availabilityDescription: "Good availability on weekdays",
    findingProbability: 80,
    trafficFrequency: [10, 8, 5, 5, 10, 20, 40, 60, 70, 75, 80, 85, 80, 75, 70, 75, 85, 90, 85, 70, 50, 35, 20, 10],
    entrances: [
      { name: "Main Entrance", description: "Via SS21/37" },
      { name: "LG Entrance", description: "Via SS21/1A" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "Moderate" },
      { time: "Evening (6PM-10PM)", status: "High" },
      { time: "Night (10PM-12AM)", status: "Low" },
    ],
    tips: "Validate parking at the mall information counter for discounted rates.",
  },
  {
    id: 7,
    name: "Uptown Street Parking",
    address: "Jalan SS 21/39, Damansara Utama, 47400",
    lat: 3.134444,   // from T-Corp Engineers map :contentReference[oaicite:12]{index=12}
    lng: 101.621389, // from T-Corp Engineers map :contentReference[oaicite:13]{index=13}
    capacity: 120,
    pricePerHour: 2,
    isLegal: true,
    type: "street",
    walkTime: 1,
    peakHours: "12PM-2PM, 7PM-10PM",
    availabilityDescription: "Limited street parking",
    findingProbability: 45,
    trafficFrequency: [15, 10, 8, 5, 10, 30, 50, 70, 80, 70, 65, 75, 80, 65, 60, 70, 85, 95, 90, 80, 60, 40, 25, 15],
    entrances: [
      { name: "Roadside", description: "Along Jalan SS21/39" },
      { name: "Side Streets", description: "Around Uptown area" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Moderate" },
      { time: "Afternoon (12PM-6PM)", status: "High" },
      { time: "Evening (6PM-10PM)", status: "Very High" },
      { time: "Night (10PM-12AM)", status: "Moderate" },
    ],
    tips: "Pay using Touch 'n Go eWallet or the parking machine. Active enforcement in this area.",
  },
  {
    id: 8,
    name: "1 Utama Shopping Centre",
    address: "1, Lebuh Bandar Utama, Bandar Utama, 47800",
    lat: 3.1481500,    // from Wikipedia infobox :contentReference[oaicite:14]{index=14}
    lng: 101.6158417,  // from Wikipedia infobox :contentReference[oaicite:15]{index=15}
    capacity: 10000,
    pricePerHour: 3,
    isLegal: true,
    type: "mall",
    walkTime: 7,
    peakHours: "11AM-10PM",
    availabilityDescription: "Massive parking complex",
    findingProbability: 95,
    trafficFrequency: [10, 5, 5, 5, 8, 15, 35, 55, 70, 80, 85, 90, 95, 90, 85, 80, 85, 90, 80, 65, 50, 35, 25, 15],
    entrances: [
      { name: "New Wing", description: "Via Lebuh Bandar Utama" },
      { name: "Old Wing", description: "Via Dataran Bandar Utama" },
      { name: "Centre Court", description: "Via Lebuh Bandar Utama" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "High" },
      { time: "Evening (6PM-10PM)", status: "Very High" },
      { time: "Night (10PM-12AM)", status: "Moderate" },
    ],
    tips: "Use the LG parking floors for better availability. E-payment options available.",
  },
  {
    id: 9,
    name: "Paradigm Mall PJ",
    address: "1, Jalan SS 7/26A, Kelana Jaya, 47301",
    lat: 3.105083,   // from Wikipedia infobox :contentReference[oaicite:16]{index=16}
    lng: 101.595944, // from Wikipedia infobox :contentReference[oaicite:17]{index=17}
    capacity: 4500,
    pricePerHour: 3,
    isLegal: true,
    type: "mall",
    walkTime: 5,
    peakHours: "12PM-9PM",
    availabilityDescription: "Good availability most times",
    findingProbability: 85,
    trafficFrequency: [10, 8, 5, 5, 8, 20, 35, 45, 60, 70, 80, 85, 80, 75, 70, 75, 85, 90, 80, 65, 50, 30, 20, 10],
    entrances: [
      { name: "Main Entrance", description: "Via Jalan SS7/26A" },
      { name: "East Entrance", description: "Via Lebuhraya Damansara-Puchong" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "Moderate" },
      { time: "Evening (6PM-10PM)", status: "High" },
      { time: "Night (10PM-12AM)", status: "Low" },
    ],
    tips: "Higher floors usually have more available spaces. Free parking with minimum purchase.",
  },
  {
    id: 10,
    name: "Atria Shopping Gallery",
    address: "Jalan SS 22/23, Damansara Jaya, 47400",
    lat: 3.127250,    // from camera location on Commons :contentReference[oaicite:18]{index=18}
    lng: 101.616411,  // from camera location on Commons :contentReference[oaicite:19]{index=19}
    capacity: 1700,
    pricePerHour: 2,
    isLegal: true,
    type: "mall",
    walkTime: 3,
    peakHours: "12PM-8PM",
    availabilityDescription: "Usually has available spaces",
    findingProbability: 80,
    trafficFrequency: [8, 5, 5, 5, 10, 20, 30, 45, 55, 65, 70, 75, 70, 65, 60, 65, 75, 80, 70, 55, 40, 25, 15, 10],
    entrances: [
      { name: "Main Entrance", description: "Via Jalan SS22/23" },
      { name: "Side Entrance", description: "Via Jalan SS22/19" },
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "Low" },
      { time: "Afternoon (12PM-6PM)", status: "Moderate" },
      { time: "Evening (6PM-10PM)", status: "High" },
      { time: "Night (10PM-12AM)", status: "Low" },
    ],
    tips: "First hour free with validation. Weekend parking can get crowded during events.",
  },
  {
    id: 11,
    name: "Unauthorized - Jalan Raja Laut",
    address: "Jalan Raja Laut, 50350",
    lat: 3.16046,      // from findlatitudeandlongitude.com :contentReference[oaicite:0]{index=0}
    lng: 101.695206,   // from findlatitudeandlongitude.com :contentReference[oaicite:1]{index=1}
    capacity: 12,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 4,
    peakHours: "8AM-6PM",
    availabilityDescription: "Often available but high risk of summons",
    findingProbability: 80,
    trafficFrequency: [5,5,5,5,10,30,50,80,90,85,80,75,70,75,80,85,90,85,70,50,30,20,10,5],
    entrances: [
      { name: "Roadside", description: "Along Jalan Raja Laut – frequent patrols" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Very risky—avoid during peak enforcement hours."
  },
  {
    id: 12,
    name: "Unauthorized - Jalan Ipoh",
    address: "Jalan Ipoh, 51208",
    lat: 3.174444,     // from pagenation.com :contentReference[oaicite:2]{index=2}
    lng: 101.686111,   // from pagenation.com :contentReference[oaicite:3]{index=3}
    capacity: 8,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 8,
    peakHours: "7AM-5PM",
    availabilityDescription: "Spots usually free but heavily monitored",
    findingProbability: 60,
    trafficFrequency: [10,10,10,10,15,25,40,60,75,80,85,80,75,70,65,70,75,80,70,50,30,20,15,10],
    entrances: [
      { name: "Side Alley", description: "Between Jalan Ipoh and Jalan Sultan Azlan Shah" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Low Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Enforcement tends to slack off after 6PM but still use at your own risk."
  },
  {
    id: 13,
    name: "Unauthorized - Jalan Pudu (near Pudu Sentral)",
    address: "Jalan Pudu, Pudu Sentral, 55100",
    lat: 3.14556,      // from Pudu Sentral Wikipedia :contentReference[oaicite:4]{index=4}
    lng: 101.70083,    // from Pudu Sentral Wikipedia :contentReference[oaicite:5]{index=5}
    capacity: 10,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 3,
    peakHours: "6AM-2PM",
    availabilityDescription: "Rarely full but constant risk of summons",
    findingProbability: 70,
    trafficFrequency: [15,15,15,15,20,35,55,75,85,80,75,70,65,60,55,60,65,70,60,45,30,20,15,10],
    entrances: [
      { name: "Bus Terminal Side", description: "Between Pudu Sentral entrance and main road" }
    ],
    busyTimes: [
      { time: "Morning (6AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "Moderate Risk" },
      { time: "Evening (6PM-10PM)", status: "Low Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Summons officers patrol continuously—consider other options."
  },
  {
    id: 14,
    name: "Unauthorized - Jalan Sultan Ismail",
    address: "Jalan Sultan Ismail, 50250",
    lat: 3.1552829,    // from postcode.my :contentReference[oaicite:6]{index=6}
    lng: 101.7053617,  // from postcode.my :contentReference[oaicite:7]{index=7}
    capacity: 9,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 2,
    peakHours: "9AM-7PM",
    availabilityDescription: "Often empty but heavy fines apply",
    findingProbability: 65,
    trafficFrequency: [20,20,20,20,25,45,65,85,95,90,85,80,75,70,65,70,75,80,70,55,35,25,20,15],
    entrances: [
      { name: "Frontage", description: "Roadside near Grand Millennium Hotel" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Fines here can exceed RM150—park elsewhere if possible."
  },
  {
    id: 15,
    name: "Unauthorized - Jalan Sultan Mohammed",
    address: "Jalan Sultan Mohammed, 50050",
    lat: 3.1418658,    // from postcode.my :contentReference[oaicite:8]{index=8}
    lng: 101.6954367,  // from postcode.my :contentReference[oaicite:9]{index=9}
    capacity: 7,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 5,
    peakHours: "10AM-4PM",
    availabilityDescription: "Frequent openings but patrols are regular",
    findingProbability: 60,
    trafficFrequency: [10,10,10,10,20,40,60,80,90,85,80,75,70,65,60,65,70,75,65,50,30,20,15,10],
    entrances: [
      { name: "Side Lane", description: "Opposite Central Market side street" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Best avoided—central enforcement is strict in this area."
  },


  {
    id: 16,
    name: "Unauthorized - Jalan SS 2/1",
    address: "Jalan SS 2/1, SS2, 47300 Petaling Jaya",
    lat: 3.1112,        // from distancesfrom.com :contentReference[oaicite:0]{index=0}
    lng: 101.6110,      // from distancesfrom.com :contentReference[oaicite:1]{index=1}
    capacity: 10,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 5,
    peakHours: "8AM-6PM",
    availabilityDescription: "Often available but high risk of summons",
    findingProbability: 80,
    trafficFrequency: [5,5,5,5,10,20,40,80,90,85,80,75,70,75,80,85,90,85,70,50,30,20,10,5],
    entrances: [
      { name: "Roadside", description: "Along SS2/1 – frequent patrols" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Very risky—avoid during peak enforcement hours."
  },
  {
    id: 17,
    name: "Unauthorized - Jalan 14/1",
    address: "Jalan 14/1, Seksyen 14, 46100 Petaling Jaya",
    lat: 3.1050201,     // from postcode.my :contentReference[oaicite:2]{index=2}
    lng: 101.6369018,   // from postcode.my :contentReference[oaicite:3]{index=3}
    capacity: 8,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 7,
    peakHours: "7AM-5PM",
    availabilityDescription: "Spots usually free but heavily monitored",
    findingProbability: 60,
    trafficFrequency: [10,10,10,10,15,25,40,60,75,80,85,80,75,70,65,70,75,80,70,50,30,20,15,10],
    entrances: [
      { name: "Side Lane", description: "Between Jalan 14/1 and Jalan 14/3" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Low Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Enforcement tends to slack off after hours but still at your own risk."
  },
  {
    id: 18,
    name: "Unauthorized - Jalan Gasing",
    address: "Jalan Gasing, 46000 Petaling Jaya",
    lat: 3.0983,        // from postcode.my :contentReference[oaicite:4]{index=4}
    lng: 101.652339,    // from postcode.my :contentReference[oaicite:5]{index=5}
    capacity: 12,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 6,
    peakHours: "9AM-7PM",
    availabilityDescription: "Often empty but fines apply",
    findingProbability: 65,
    trafficFrequency: [20,20,20,20,25,45,65,85,95,90,85,80,75,70,65,70,75,80,70,55,35,25,20,15],
    entrances: [
      { name: "Roadside", description: "Opposite commercial shops – heavy patrols" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Best avoided during office hours."
  },
  {
    id: 19,
    name: "Unauthorized - Jalan Templer",
    address: "Jalan Templer, 46000 Petaling Jaya",
    lat: 3.0878383,     // from postcode.my :contentReference[oaicite:6]{index=6}
    lng: 101.6528161,   // from postcode.my :contentReference[oaicite:7]{index=7}
    capacity: 7,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 8,
    peakHours: "6AM-4PM",
    availabilityDescription: "Frequent openings but patrols are regular",
    findingProbability: 60,
    trafficFrequency: [10,10,10,10,20,40,60,80,90,85,80,75,70,65,60,65,70,75,65,50,30,20,15,10],
    entrances: [
      { name: "Frontage", description: "Roadside near banks – vigilant enforcement" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "High Risk" },
      { time: "Evening (6PM-10PM)", status: "Moderate Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Summons often exceed RM100 here."
  },
  {
    id: 20,
    name: "Unauthorized - Jalan SS 21/1–62",
    address: "Jalan SS 21/1–62, 47400 Petaling Jaya",
    lat: 3.1367399,     // from postcode.my :contentReference[oaicite:8]{index=8}
    lng: 101.6207152,   // from postcode.my :contentReference[oaicite:9]{index=9}
    capacity: 9,
    pricePerHour: 0,
    isLegal: false,
    type: "illegal",
    walkTime: 4,
    peakHours: "8AM-6PM",
    availabilityDescription: "Rarely full but constant risk of summons",
    findingProbability: 70,
    trafficFrequency: [15,15,15,15,20,35,55,75,85,80,75,70,65,60,55,60,65,70,60,45,30,20,15,10],
    entrances: [
      { name: "Roadside", description: "Along SS21 – regular patrols" }
    ],
    busyTimes: [
      { time: "Morning (8AM-12PM)", status: "High Risk" },
      { time: "Afternoon (12PM-6PM)", status: "Moderate Risk" },
      { time: "Evening (6PM-10PM)", status: "Low Risk" },
      { time: "Night (10PM-12AM)", status: "Low Risk" },
    ],
    tips: "⚠️ Officers patrol continuously—consider legal alternatives."
  }
];
