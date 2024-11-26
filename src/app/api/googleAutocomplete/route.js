import { NextResponse } from 'next/server';
import axios from 'axios';

// Este endpoint se llamará cuando el frontend haga una solicitud GET
export async function GET(req) {
    console.log('GETtttt')
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('input');

  if (!input) {
    return NextResponse.json({ error: 'Falta el parámetro de entrada.' }, { status: 400 });
  }

  const apiKey = 'AIzaSyDhZmsOFmekunudxVD9ZsxZBKr2E0MCwfE';

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:co&key=${apiKey}`
    );
    return NextResponse.json(response.data); // Devuelve los resultados al frontend
  } catch (error) {
    console.error('Error fetching Google Places autocomplete:', error.message);
    return NextResponse.json({ error: 'No se pudieron obtener las sugerencias.' }, { status: 500 });
  }
}