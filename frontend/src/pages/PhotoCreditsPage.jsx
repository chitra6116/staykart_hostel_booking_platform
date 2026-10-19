import React from 'react';
import { Camera, ExternalLink, ShieldCheck } from 'lucide-react';

export default function PhotoCreditsPage() {
  const credits = [
    { location: 'Site Hero Banner', desc: 'Luxury Heritage Hotel Courtyard & Pool', photographer: 'Edvin Johansson', source: 'https://unsplash.com/@edvinj' },
    { location: 'Jaipur Destination', desc: 'Historic Rajasthani Palace Architecture in Jaipur', photographer: 'Annie Spratt', source: 'https://unsplash.com/@anniespratt' },
    { location: 'Goa Destination', desc: 'Swaying Palms and Golden Sands on Goa Coast', photographer: 'Ashutosh Saraswat', source: 'https://unsplash.com/@ashutoshsaraswat' },
    { location: 'Udaipur Destination', desc: 'Lake Palace and Waters of Lake Pichola Udaipur', photographer: 'Sanket Patel', source: 'https://unsplash.com/@sanketpatel' },
    { location: 'Manali Destination', desc: 'Snow-capped Himalayan Pine Valley in Manali', photographer: 'Aditya Chache', source: 'https://unsplash.com/@adityachache' },
    { location: 'Mumbai Destination', desc: 'Marine Drive Queens Necklace and Arabian Sea Coastline', photographer: 'Hardik Joshi', source: 'https://unsplash.com/@hardikjoshi' },
    { location: 'Delhi Destination', desc: 'Colonial Heritage Colonnades and Architecture in Central Delhi', photographer: 'Falak', source: 'https://unsplash.com/@falak' },
    { location: 'Bengaluru Destination', desc: 'Modern Architecture and Lush Greenery in Bengaluru', photographer: 'Naveen Kumar', source: 'https://unsplash.com/@naveenkumar' },
    { location: 'Munnar Destination', desc: 'Rolling Green Tea Estates in Misty Munnar Hills', photographer: 'Dhivakaran S', source: 'https://unsplash.com/@dhivakaran' },
    { location: 'Rajputana Heritage Haveli, Jaipur', desc: 'Traditional Rajasthani stone facade, carved balconies and courtyard', photographer: 'Fernan Arrocet', source: 'https://unsplash.com/@fernanarrocet' },
    { location: 'Sea Breeze Luxury Resort, Goa', desc: 'Beachfront resort villas and azure infinity pool', photographer: 'Sara Dubler & Edvin Johansson', source: 'https://unsplash.com/@saradubler' },
    { location: 'Lake Pichola Palace Hotel, Udaipur', desc: 'White marble boutique palace and lake dining terrace', photographer: 'Edvin Johansson & Sasha Stories', source: 'https://unsplash.com/@edvinj' },
    { location: 'Himalayan Pine Retreat, Manali', desc: 'Timber and river-stone chalet framed by snow peaks', photographer: 'Eberhard Grossgasteiger', source: 'https://unsplash.com/@eberhardgross' },
    { location: 'Marine Drive Grandeur, Mumbai', desc: 'Art Deco facade and Arabian sea horizon', photographer: 'Edvin Johansson & Hardik Joshi', source: 'https://unsplash.com/@edvinj' },
    { location: 'Lutyens Heritage Manor, Delhi', desc: 'Grand colonial colonnades and high-ceiling atrium', photographer: 'Andrea Davis & Fernan Arrocet', source: 'https://unsplash.com/@andreadavis' },
    { location: 'Tech Corridor Executive Suites, Bengaluru', desc: 'Modern steel and glass architecture in Bellandur tech corridor', photographer: 'Sean Pollock & Boris Baldinger', source: 'https://unsplash.com/@seanpollock' },
    { location: 'Misty Cardamom Hills Resort, Munnar', desc: 'Sloped timber cottages perched above terraced emerald tea hills', photographer: 'Dhivakaran S', source: 'https://unsplash.com/@dhivakaran' },
    { location: 'Standard Room Category', desc: 'Standard room with queen bed, hardwood flooring and reading lamps', photographer: 'Visual Stories', source: 'https://unsplash.com/@visualstories' },
    { location: 'Deluxe Room Category', desc: 'Deluxe room with plush king bed, accent armchairs and large picture window', photographer: 'Visual Stories', source: 'https://unsplash.com/@visualstories' },
    { location: 'Premium Room Category', desc: 'Premium room featuring private sunlit balcony and luxury bedding', photographer: 'Visual Stories', source: 'https://unsplash.com/@visualstories' },
    { location: 'Heritage Suite Category', desc: 'Royal Heritage Suite with handcrafted wooden four-poster bed', photographer: 'Visual Stories', source: 'https://unsplash.com/@visualstories' },
    { location: 'Family Room Category', desc: 'Expansive Family Suite with twin queen beds and comfortable lounge', photographer: 'Visual Stories', source: 'https://unsplash.com/@visualstories' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-3">
          <Camera className="w-4 h-4 text-teal-600" />
          <span>Authentic Photography</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Photo Credits &amp; Licences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          StayKart is committed to authentic visual representation. All hotel property and destination imagery is licensed for commercial use with full attribution to original creators.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Property / Destination</th>
                <th className="px-5 py-3.5">Photograph Description</th>
                <th className="px-5 py-3.5">Photographer</th>
                <th className="px-5 py-3.5">Licence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {credits.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {c.location}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {c.desc}
                  </td>
                  <td className="px-5 py-3.5 text-teal-600 dark:text-teal-400 font-medium">
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{c.photographer}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    Unsplash Licence
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
        <span>
          In accordance with photography licensing guidelines, contributing photographers are credited above. StayKart maintains high standards of digital copyright compliance and visual authenticity.
        </span>
      </div>
    </div>
  );
}
