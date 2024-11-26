import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  console.log(lat, lng);

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Coordinates are required' }, { status: 400 });
  }

  try {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
            params: {
            latlng: `${lat},${lng}`,
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          }
        }
        
    );

    if (response.data.status === 'OK') {
        const address = response.data.results[0];
       const formattedAddress = address.formatted_address;

      return NextResponse.json({ formattedAddress });
    } else {
      return NextResponse.json({ error: 'Unable to geocode coordinates' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: 'Error fetching address' }, { status: 500 });
  }
}
