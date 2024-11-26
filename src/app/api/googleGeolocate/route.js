import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const response = await axios.post(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

      const { lat, lng } = response.data.location;
      console.log(response.data);

    return NextResponse.json([ lat, lng ], {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching location from Google Maps:', error);
    return NextResponse.json({ error: 'Unable to fetch location' }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}