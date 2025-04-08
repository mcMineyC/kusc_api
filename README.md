# KUSC API

A Node.js wrapper for the KUSC radio streaming API.

[NPM](https://www.npmjs.com/package/kusc_api)

## Installation

```bash
npm install kusc-api
```

## Usage

```javascript
import { getStreamUrl, getCurrentMetadata, selectStream } from 'kusc-api';

// Get stream URL
const url = await getStreamUrl('KUSC', 'AAC96');

// Get current track metadata
const metadata = await getCurrentMetadata('KUSC');

// Interactive stream selection
const stream = await selectStream();
```

## API Reference

### getStreams()
Gets a list of available streams

### getStreamInfo(streamId)
Gets information about the given stream id

### getStreamUrl(streamId, preferredStream (optional))
Gets a suitable audio stream URL for the given id and preferred format

### getCurrentMetadata(streamId, includeImage(optional))
Gets current track metadata for the given stream id, optionally including image data

### selectStream()
Shows a nice dialog for selecting a stream using blessed
