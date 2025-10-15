const sampleListings = [
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: [
      "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://thumbs.dreamstime.com/b/traditional-houseboat-glides-narrow-waterways-kerala-india-surrounded-lush-coconut-trees-calm-water-reflects-363496086.jpg",
      "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/68000/68093-Cochin.jpg?impolicy=fcrop&w=1000&h=563&p=1&q=medium"
    ],
    price: 1500,
    location: "Malibu",
    country: "United States",
    totalRooms: 5,
    geometry: {
      type: "Point",
      coordinates: [-118.7995, 34.0259]
    }
  },
  {
    title: "Modern Loft in Downtown",
    description:
      "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    image: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS34sWOJFeMLwZOEemka-HhadnPT669PqSAZg&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRORIWH4KGGqesbvNix3gUE9y57A6YtYLtiA&s"
    ],
    price: 1200,
    location: "New York City",
    country: "United States",
    totalRooms: 5,
    geometry: {
      type: "Point",
      coordinates: [-74.006, 40.7128]
    }
  },
  {
    title: "Mountain Retreat",
    description:
      "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    image: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRwTOZ6NE-YKM0T663s2E8M0N6Jt9ffynwj5wH5FC9hSWEsqPhh",
      "https://pix10.agoda.net/hotelImages/6429907/-1/f6c459e55882a7d45567bbd50af5eca3.jpg?ca=9&ce=1&s=414x232&ar=16x9"
    ],
    price: 1000,
    location: "Aspen",
    country: "United States",
    totalRooms: 5,
    geometry: {
      type: "Point",
      coordinates: [-106.8227, 39.1911]
    }
  },
  {
    title: "Historic Villa in Tuscany",
    description:
      "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    image: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1669908143820-2319b7079ccb?q=80&w=2127&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1682285210821-5d1b5a406b97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    price: 2500,
    location: "Florence",
    country: "Italy",
    totalRooms: 10,
    geometry: {
      type: "Point",
      coordinates: [11.2558, 43.7696]
    }
  },
  {
    title: "Secluded Treehouse Getaway",
    description:
      "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    image: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1625721838087-c46e51c89558?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    price: 800,
    location: "Portland",
    country: "United States",
    totalRooms: 6,
    geometry: {
      type: "Point",
      coordinates: [-122.6765, 45.5231]
    }
  },
  {
    title: "Beachfront Paradise",
    description:
      "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    image: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://i.pinimg.com/736x/33/90/ed/3390ed8673b165c8be55a79ee94a2e53.jpg",
      "https://img.freepik.com/premium-photo/serene-tropical-paradise-with-infinity-pool-lush-palm-trees_1048258-10687.jpg"
    ],
    price: 1900,
    location: "Miami",
    country: "United States",
    totalRooms: 5,
    geometry: {
      type: "Point",
      coordinates: [-80.1918, 25.7617]
    }
  },
];

module.exports = {
  data: sampleListings 
};
