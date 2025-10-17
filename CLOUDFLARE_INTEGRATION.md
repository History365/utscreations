# MusicListener6000 - Cloudflare Integration Guide

This document explains how MusicListener6000 integrates exclusively with Cloudflare for all data storage and retrieval.

## Overview

MusicListener6000 is designed to work entirely with Cloudflare for backend services:

- **Cloudflare D1**: SQL database for user accounts, playlists, and metadata
- **Cloudflare Workers KV**: Key-value storage for fast access to frequently used data
- **Cloudflare R2**: Object storage for music files and images
- **Cloudflare Workers**: API endpoints and serverless functions

## Data Flow

All application data flows through Cloudflare:

```
[Mobile App/Browser] <----> [Cloudflare Workers API] <----> [Cloudflare D1/KV/R2]
```

No third-party databases or storage services are used. All music files, user data, and application state are stored exclusively in Cloudflare's infrastructure.

## Authentication Flow

1. User logs in via the app
2. Authentication request sent to Cloudflare Worker
3. Cloudflare Worker validates credentials against D1 database
4. Upon success, a JWT token is returned to the client
5. This token is used for all subsequent API calls

## Music Streaming

Music streaming uses Cloudflare R2 for storage and Workers for access control:

1. User selects a song to play
2. App requests stream URL from Cloudflare Worker
3. Worker validates user's access rights to the song
4. Worker generates a time-limited signed URL to R2 storage
5. App uses this URL to stream audio directly from R2

## Playlists and User Data

All user data is stored in Cloudflare D1 database:

- User profiles
- Playlists
- Listening history
- Preferences
- Liked songs

## API Endpoints

The following endpoints are available at `https://musiclistener6000.yourdomain.workers.dev/api`:

| Endpoint | Description |
|----------|-------------|
| `/auth/login` | User authentication |
| `/songs` | List available songs |
| `/songs/{id}` | Get song details |
| `/songs/{id}/stream` | Get streaming URL for a song |
| `/albums` | List available albums |
| `/albums/{id}` | Get album details with songs |
| `/playlists` | Get user playlists |
| `/playlists/{id}` | Get playlist details |
| `/featured` | Get featured content |
| `/search` | Search for songs, albums, artists |
| `/users/{id}` | Get user profile |

## Setup Instructions

1. Create a Cloudflare account if you don't have one
2. Set up a Cloudflare D1 database
3. Create a Cloudflare R2 bucket for storage
4. Deploy Workers for API endpoints (see `worker/` directory)
5. Update the configuration in `js/firebase.js` with your Cloudflare endpoint

## Data Independence

This application is designed to be completely independent from any non-Cloudflare data sources. All content displayed in the app is retrieved from Cloudflare services.