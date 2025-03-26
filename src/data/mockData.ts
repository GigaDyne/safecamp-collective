
// Mock data for campsites
export const mockCampSites = [
  {
    id: "site-001",
    name: "Moab Overlook",
    description: "Stunning views of the desert landscape with excellent sunset views. Level ground suitable for all rig sizes.",
    location: "Moab, Utah",
    coordinates: { lat: 38.5735, lng: -109.5498 },
    latitude: 38.5735,
    longitude: -109.5498,
    landType: "BLM",
    safetyRating: 4.7,
    cellSignal: 3.2,
    accessibility: 4.0,
    quietness: 4.8,
    features: [
      "Level Parking",
      "Fire Rings",
      "Sunset Views",
      "4x4 Not Required",
      "Vault Toilets Nearby",
      "Spacious Sites"
    ],
    images: [
      "https://images.unsplash.com/photo-1500581276021-a4bbcd0050c5?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop"
    ],
    reviewCount: 32
  },
  {
    id: "site-002",
    name: "Alpine Forest Hideaway",
    description: "Secluded campsite in the national forest with shade and privacy. Good for smaller rigs and tents.",
    location: "Coconino National Forest, Arizona",
    coordinates: { lat: 35.1983, lng: -111.6513 },
    latitude: 35.1983,
    longitude: -111.6513,
    landType: "USFS",
    safetyRating: 4.3,
    cellSignal: 2.1,
    accessibility: 3.2,
    quietness: 4.5,
    features: [
      "Shaded Sites",
      "Wildlife Viewing",
      "Hiking Trails",
      "Creek Access",
      "Limited Cell Signal"
    ],
    images: [
      "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=800&auto=format&fit=crop"
    ],
    reviewCount: 18
  },
  {
    id: "site-003",
    name: "Desert Basin",
    description: "Isolated desert campsite with minimal facilities. Beautiful night skies but limited shade.",
    location: "Joshua Tree, California",
    coordinates: { lat: 33.8734, lng: -115.9010 },
    latitude: 33.8734,
    longitude: -115.9010,
    landType: "BLM",
    safetyRating: 3.6,
    cellSignal: 2.8,
    accessibility: 3.5,
    quietness: 4.9,
    features: [
      "Stargazing",
      "Open Desert Camping",
      "No Facilities",
      "High Clearance Recommended"
    ],
    images: [
      "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&auto=format&fit=crop"
    ],
    reviewCount: 24
  },
  {
    id: "site-004",
    name: "Mountain Creek Pass",
    description: "Forested site alongside a flowing creek. Good separation between sites and natural privacy.",
    location: "Bridger-Teton National Forest, Wyoming",
    coordinates: { lat: 43.4799, lng: -110.7624 },
    latitude: 43.4799,
    longitude: -110.7624,
    landType: "USFS",
    safetyRating: 4.5,
    cellSignal: 1.5,
    accessibility: 3.0,
    quietness: 4.2,
    features: [
      "Creek Access",
      "Fishing",
      "Natural Privacy",
      "Bear Country - Store Food Properly"
    ],
    images: [
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop"
    ],
    reviewCount: 15
  },
  {
    id: "site-005",
    name: "Lakeside Boondock",
    description: "Free camping area near the lake with good boat access. Popular on weekends.",
    location: "Lake Mead, Nevada",
    coordinates: { lat: 36.1215, lng: -114.8507 },
    latitude: 36.1215,
    longitude: -114.8507,
    landType: "BLM",
    safetyRating: 3.2,
    cellSignal: 3.8,
    accessibility: 4.5,
    quietness: 2.8,
    features: [
      "Lake Access",
      "Boat Launch Nearby",
      "Fishing",
      "Swimming",
      "Can Be Crowded"
    ],
    images: [
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504204267155-aaad8e81290d?w=800&auto=format&fit=crop"
    ],
    reviewCount: 41
  },
  {
    id: "site-006",
    name: "High Country Meadow",
    description: "Mountain meadow campsite at high elevation. Spectacular views but can be cold at night.",
    location: "San Juan National Forest, Colorado",
    coordinates: { lat: 37.4763, lng: -107.8088 },
    latitude: 37.4763,
    longitude: -107.8088,
    landType: "USFS",
    safetyRating: 4.1,
    cellSignal: 1.8,
    accessibility: 2.5,
    quietness: 4.6,
    features: [
      "High Elevation",
      "Wildflowers (Summer)",
      "Hiking Trails",
      "Cool Temperatures"
    ],
    images: [
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503516459261-40c66117780a?w=800&auto=format&fit=crop"
    ],
    reviewCount: 22
  },
  {
    id: "site-007",
    name: "Quartzsite Flats",
    description: "Popular winter destination with many other RVers. Good for socializing and meeting fellow travelers.",
    location: "Quartzsite, Arizona",
    coordinates: { lat: 33.6424, lng: -114.2293 },
    latitude: 33.6424,
    longitude: -114.2293,
    landType: "BLM",
    safetyRating: 3.9,
    cellSignal: 4.2,
    accessibility: 4.8,
    quietness: 2.2,
    features: [
      "Flat Ground",
      "Good for Groups",
      "Popular in Winter",
      "Close to Town",
      "Shopping Nearby"
    ],
    images: [
      "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585501656348-d37e85185cda?w=800&auto=format&fit=crop"
    ],
    reviewCount: 56
  }
];

// Mock data for reviews
export const mockReviews = [
  {
    id: "review-001",
    siteId: "site-001",
    userName: "WildRoamer",
    userAvatar: null,
    date: "Apr 10, 2023",
    safetyRating: 5,
    comment: "Absolutely incredible spot. Felt completely safe the entire time with other friendly campers nearby. The views are even better than the pictures suggest. Cell signal decent for remote work.",
    images: [
      "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: "review-002",
    siteId: "site-001",
    userName: "DesertDweller",
    userAvatar: null,
    date: "Mar 22, 2023",
    safetyRating: 4,
    comment: "Great location but quite busy during spring break. Some late night parties in the distance, but otherwise felt safe. Verizon signal strong enough for video calls.",
    images: []
  },
  {
    id: "review-003",
    siteId: "site-001",
    userName: "VanLifeJourney",
    userAvatar: null,
    date: "Feb 15, 2023",
    safetyRating: 5,
    comment: "One of my favorite boondocking spots in the area. Spacious, beautiful, and peaceful. Rangers patrol occasionally which adds to the feeling of safety.",
    images: [
      "https://images.unsplash.com/photo-1526491109672-74740652b963?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: "review-004",
    siteId: "site-002",
    userName: "ForestExplorer",
    userAvatar: null,
    date: "May 30, 2023",
    safetyRating: 4,
    comment: "Beautiful forest spot. Saw a few other campers but everyone kept to themselves. Only downside is the spotty cell coverage - had to drive about 10 minutes to get reliable signal.",
    images: []
  },
  {
    id: "review-005",
    siteId: "site-002",
    userName: "MountainHiker",
    userAvatar: null,
    date: "Jun 12, 2023",
    safetyRating: 5,
    comment: "Perfectly secluded spot for those wanting to disconnect. Felt very safe despite being remote. The surrounding hiking trails are fantastic!",
    images: [
      "https://images.unsplash.com/photo-1655407130228-4f60d4fc5613?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: "review-006",
    siteId: "site-003",
    userName: "StarGazer42",
    userAvatar: null,
    date: "Apr 5, 2023",
    safetyRating: 3,
    comment: "Amazing night skies but had an uncomfortable encounter with an ATV group that came through very late. They weren't threatening but definitely disrupted the peace. Would probably camp with others next time.",
    images: []
  },
  {
    id: "review-007",
    siteId: "site-003",
    userName: "DesertTrekker",
    userAvatar: null,
    date: "Mar 18, 2023",
    safetyRating: 4,
    comment: "Extremely isolated which is both good and bad. Prepare accordingly and you'll have a fantastic experience. The stars are unbelievable!",
    images: [
      "https://images.unsplash.com/photo-1455763916899-e8b50eca9967?w=600&auto=format&fit=crop"
    ]
  }
];
