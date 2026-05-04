import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const types = searchParams.get('types') || 'geocode';
    const language = searchParams.get('language') || 'en';

    if (!input || input.trim().length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key is not configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      input: input.trim(),
      key: apiKey,
      types,
      language,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error in Google Places API proxy', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch location predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
