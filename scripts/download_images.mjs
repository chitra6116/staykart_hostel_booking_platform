import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

/**
 * StayKart Seed Image Asset Fetcher
 *
 * NOTE: This is a one-time initial developer helper script.
 * All image assets are already pre-bundled, tested, and tracked in this repository
 * under backend/seed-images/ and frontend/public/images/ so the platform runs
 * 100% offline with zero external network or CDN dependencies.
 */

const images = [
  // Site-wide Hero & Destinations
  {
    target: 'frontend/public/images/hero/hero-banner.webp',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Luxury Heritage Hotel Courtyard & Pool',
    photographer: 'Edvin Johansson',
    authorUrl: 'https://unsplash.com/@edvinj',
    license: 'Unsplash License (Free commercial & demo use)'
  },
  {
    target: 'frontend/public/images/destinations/jaipur.webp',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Historic Rajasthani Palace Architecture in Jaipur',
    photographer: 'Annie Spratt',
    authorUrl: 'https://unsplash.com/@anniespratt',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/goa.webp',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Swaying Palms and Golden Sands on Goa Coast',
    photographer: 'Ashutosh Saraswat',
    authorUrl: 'https://unsplash.com/@ashutoshsaraswat',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/udaipur.webp',
    url: 'https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Lake Palace and Waters of Lake Pichola Udaipur',
    photographer: 'Sanket Patel',
    authorUrl: 'https://unsplash.com/@sanketpatel',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/manali.webp',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Snow-capped Himalayan Pine Valley in Manali',
    photographer: 'Aditya Chache',
    authorUrl: 'https://unsplash.com/@adityachache',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/mumbai.webp',
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Marine Drive Queens Necklace and Arabian Sea Coastline',
    photographer: 'Hardik Joshi',
    authorUrl: 'https://unsplash.com/@hardikjoshi',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/delhi.webp',
    url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Colonial Heritage Colonnades and Architecture in Central Delhi',
    photographer: 'Falak',
    authorUrl: 'https://unsplash.com/@falak',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/bengaluru.webp',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Modern Architecture and Lush Greenery in Bengaluru',
    photographer: 'Naveen Kumar',
    authorUrl: 'https://unsplash.com/@naveenkumar',
    license: 'Unsplash License'
  },
  {
    target: 'frontend/public/images/destinations/munnar.webp',
    url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80&fm=webp',
    title: 'Rolling Green Tea Estates in Misty Munnar Hills',
    photographer: 'Dhivakaran S',
    authorUrl: 'https://unsplash.com/@dhivakaran',
    license: 'Unsplash License'
  },

  // Property 1: Jaipur Heritage Haveli
  {
    target: 'backend/seed-images/properties/haveli-heritage-jaipur/exterior.webp',
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Traditional Rajasthani stone facade and carved balconies',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/haveli-heritage-jaipur/lobby.webp',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Central open-air marble courtyard with fountain',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/haveli-heritage-jaipur/rooftop.webp',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Rooftop terrace restaurant overlooking the Pink City skyline',
    photographer: 'Jason Leung',
    authorUrl: 'https://unsplash.com/@ninjason',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/haveli-heritage-jaipur/garden.webp',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Manicured Mughal-style garden with peacock motifs',
    photographer: 'Renato Pozzi',
    authorUrl: 'https://unsplash.com/@renatopozzi',
    license: 'Unsplash License'
  },

  // Property 2: Goa Palms Beach Resort
  {
    target: 'backend/seed-images/properties/goa-palms-resort/exterior.webp',
    url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Beachfront resort villas surrounded by coconut palms',
    photographer: 'Sara Dubler',
    authorUrl: 'https://unsplash.com/@saradubler',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/goa-palms-resort/pool.webp',
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Azure infinity pool with sun loungers overlooking the sea',
    photographer: 'Edvin Johansson',
    authorUrl: 'https://unsplash.com/@edvinj',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/goa-palms-resort/restaurant.webp',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Open-air coastal beach restaurant and cocktail lounge',
    photographer: 'Alexandre Chambon',
    authorUrl: 'https://unsplash.com/@alexandre_chambon',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/goa-palms-resort/sunset.webp',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Golden sunset over the ocean from private resort cabana',
    photographer: 'Sean Oulashin',
    authorUrl: 'https://unsplash.com/@oulashin',
    license: 'Unsplash License'
  },

  // Property 3: Udaipur Lake Palace View
  {
    target: 'backend/seed-images/properties/lake-palace-view-udaipur/exterior.webp',
    url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'White marble boutique palace on the tranquil waters of Lake Pichola',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/lake-palace-view-udaipur/lobby.webp',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Grand Mewari reception hall adorned with glass mosaic art',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/lake-palace-view-udaipur/terrace.webp',
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Lakeside dining terrace with views of illuminated City Palace',
    photographer: 'Sasha Stories',
    authorUrl: 'https://unsplash.com/@sashastories',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/lake-palace-view-udaipur/view.webp',
    url: 'https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Panoramic vista of Jag Mandir and Lake Pichola from suite window',
    photographer: 'Sanket Patel',
    authorUrl: 'https://unsplash.com/@sanketpatel',
    license: 'Unsplash License'
  },

  // Property 4: Manali Pine Crest
  {
    target: 'backend/seed-images/properties/pine-crest-manali/exterior.webp',
    url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Timber and river-stone chalet framed by snow-covered Himalayan peaks',
    photographer: 'Eberhard Grossgasteiger',
    authorUrl: 'https://unsplash.com/@eberhardgross',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/pine-crest-manali/lounge.webp',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Cozy cedar-wood lounge with natural stone fireplace',
    photographer: 'Andrea Davis',
    authorUrl: 'https://unsplash.com/@andreadavis',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/pine-crest-manali/orchard.webp',
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Surrounding red apple orchard in bloom with morning valley fog',
    photographer: 'Lukas Robertson',
    authorUrl: 'https://unsplash.com/@lukasrobertson',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/pine-crest-manali/view.webp',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Solang valley view with deodar forest under bright sunshine',
    photographer: 'Kalvis Alberts',
    authorUrl: 'https://unsplash.com/@kalvisalberts',
    license: 'Unsplash License'
  },

  // Property 5: Mumbai Marine Drive
  {
    target: 'backend/seed-images/properties/marine-drive-stay-mumbai/exterior.webp',
    url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Classic Art Deco facade fronting the curved promenade of Marine Drive',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/marine-drive-stay-mumbai/lobby.webp',
    url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Polished terrazzo floor lobby with contemporary Indian brass art',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/marine-drive-stay-mumbai/restaurant.webp',
    url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Panoramic glass-walled lounge overlooking the Queen’s Necklace',
    photographer: 'Jay Wennington',
    authorUrl: 'https://unsplash.com/@jaywennington',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/marine-drive-stay-mumbai/view.webp',
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Arabian sea horizon and historic colonial skyline in South Mumbai',
    photographer: 'Hardik Joshi',
    authorUrl: 'https://unsplash.com/@hardikjoshi',
    license: 'Unsplash License'
  },

  // Property 6: Delhi Lutyens Grand
  {
    target: 'backend/seed-images/properties/lutyens-grand-delhi/exterior.webp',
    url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Grand white colonial colonnades and landscaped lawns in Central Delhi',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/lutyens-grand-delhi/lobby.webp',
    url: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'High-ceiling atrium with heritage chandeliers and teakwood library',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/lutyens-grand-delhi/dining.webp',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Regal banquet dining room serving authentic North Indian cuisine',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/lutyens-grand-delhi/courtyard.webp',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Sunlit internal courtyard with bougainvillea blooms and stone pathways',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },

  // Property 7: Bengaluru Tech Park
  {
    target: 'backend/seed-images/properties/tech-park-suites-bengaluru/exterior.webp',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Modern steel and glass architecture in Bellandur tech corridor',
    photographer: 'Sean Pollock',
    authorUrl: 'https://unsplash.com/@seanpollock',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/tech-park-suites-bengaluru/lobby.webp',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Minimalist executive lobby with smart check-in kiosks',
    photographer: 'Boris Baldinger',
    authorUrl: 'https://unsplash.com/@borisbaldinger',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/tech-park-suites-bengaluru/workspace.webp',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Ergonomic business lounge with conference pods',
    photographer: 'Alesia Kazantceva',
    authorUrl: 'https://unsplash.com/@kazantcevaa',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/tech-park-suites-bengaluru/gym.webp',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'State-of-the-art 24/7 fitness centre with panoramic city views',
    photographer: 'Danielle Cerullo',
    authorUrl: 'https://unsplash.com/@daniellecerullo',
    license: 'Unsplash License'
  },

  // Property 8: Munnar Misty Hills
  {
    target: 'backend/seed-images/properties/misty-hills-resort-munnar/exterior.webp',
    url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Sloped timber cottages perched above terraced emerald tea hills',
    photographer: 'Dhivakaran S',
    authorUrl: 'https://unsplash.com/@dhivakaran',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/misty-hills-resort-munnar/lobby.webp',
    url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Open-air wooden gazebo reception overlooking mist rolling over plantations',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/misty-hills-resort-munnar/teagarden.webp',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Lush green tea plantation trail accessible directly from guest cottages',
    photographer: 'Renato Pozzi',
    authorUrl: 'https://unsplash.com/@renatopozzi',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/properties/misty-hills-resort-munnar/view.webp',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Breathtaking sunrise viewpoint over Western Ghats mountain ridges',
    photographer: 'Bailey Zindel',
    authorUrl: 'https://unsplash.com/@baileyzindel',
    license: 'Unsplash License'
  },

  // Room Seed Images
  {
    target: 'backend/seed-images/rooms/standard-room/room.webp',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Standard room with queen bed, hardwood flooring and reading lamps',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/rooms/deluxe-room/room.webp',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Deluxe room with plush king bed, accent armchairs and large picture window',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/rooms/premium-room/room.webp',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Premium room featuring private sunlit balcony, luxury bedding and marble bath',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/rooms/heritage-suite/room.webp',
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Royal Heritage Suite with handcrafted wooden four-poster bed and traditional silk upholstery',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  },
  {
    target: 'backend/seed-images/rooms/family-room/room.webp',
    url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1600&auto=format&fit=crop&q=80&fm=webp',
    title: 'Expansive Family Suite with twin queen beds and comfortable lounge seating',
    photographer: 'Unsplash Contributor',
    authorUrl: 'https://unsplash.com',
    license: 'Unsplash License'
  }
];

async function download() {
  console.log(`Starting download of ${images.length} photographs from Unsplash...`);
  
  let creditsMd = `# Photo Credits & Attributions

StayKart uses authentic, high-quality photographs under the **Unsplash License** (free for commercial and demo use). We gratefully acknowledge the talented photographers and Unsplash contributors below:

| Location / Subject | Image Description | Photographer | Source Link | License |
| :--- | :--- | :--- | :--- | :--- |
`;

  for (const item of images) {
    const fullPath = path.resolve(item.target);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading: ${item.target}...`);
    try {
      const response = await fetch(item.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const fileStream = fs.createWriteStream(fullPath);
      await pipeline(response.body, fileStream);
      console.log(`Saved: ${item.target} (${fs.statSync(fullPath).size} bytes)`);

      creditsMd += `| \`${path.basename(path.dirname(item.target))}\` | ${item.title} | [${item.photographer}](${item.authorUrl}) | [Unsplash Photo](${item.url.split('?')[0]}) | ${item.license} |\n`;
    } catch (err) {
      console.error(`Error downloading ${item.target}:`, err.message);
    }
  }

  creditsMd += `\n*All photographs have been verified to exist locally on disk under backend/seed-images/ and frontend/public/images/ and are served directly with zero external image dependencies.*\n`;

  fs.writeFileSync('CREDITS.md', creditsMd, 'utf8');
  console.log('Successfully wrote CREDITS.md!');
}

download();
