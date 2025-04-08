import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import blessed from "blessed";
var streamInfoUrl =
  "https://playerservices.streamtheworld.com/api/livestream?station=<callsign>&transports=http%2Chls&version=1.10";
const streams = [
  {
    name: "KUSC",
    id: "KUSC",
  },
  {
    name: "Great Escape",
    id: "CC4_S01",
  },
];

async function getStreamInfo(callSign) {
  var url = streamInfoUrl.replace("<callsign>", callSign);
  var response = await axios.get(url);
  var parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  var data = parser.parse(response.data);
  data = data.live_stream_config.mountpoints.mountpoint;
  data = data.filter((mp) => mp.status["status-code"] == "200");
  data = data.reduce((acc, mp) => {
    var server = mp.servers.server[0];
    // console.log(JSON.stringify(mp, null, 2));
    var tmp = {
      mount: mp.mount,
      codec: mp["media-format"].audio.codec,
      // container: mp.format,
      bitrate: mp.bitrate,
      url:
        server.ports.port.type +
        "://" +
        server.ip +
        ":" +
        server.ports.port["#text"],
    }; // store copy of mount mountpoint
    if (tmp.codec.includes("aac")) tmp.codec = "aac";
    else if (tmp.codec.includes("mp3")) tmp.codec = "mp3";
    acc[mp.mount] = tmp;
    return acc;
  }, {});
  data = Object.values(data);
  // console.log(data);
  return data;
}

async function getStreamUrl(streamId, preferredStream = "AAC96") {
  var streamInfo = await getStreamInfo(streamId);
  if (streamInfo.length === 0) {
    throw new Error("No streams found");
  }
  var stream = {};
  if (
    streamInfo.filter((mp) => mp.mount.replace(streamId, "") == preferredStream)
      .length > 0
  )
    stream = streamInfo.find(
      (mp) => mp.mount.replace(streamId, "") == preferredStream,
    );
  // find the preferred stream
  else {
    console.warn(
      `Preferred stream ${preferredStream} not found, using first stream`,
    );
    stream = streamInfo[0]; // default to first stream if preferred stream not found
  }
  return stream.url + "/" + stream.mount + "." + stream.codec;
}

async function getCurrentMetadata(streamId, includeImage = false) {
  var response = await axios.get(
    `https://schedule.kusc.org/v3/songs/${streamId}/now?includeImage=${includeImage}`,
  );
  var info = response.data;
  info = {
    start: info.start,
    end: info.end,
    duration:
      new Date(info.end.dateTime).getTime() -
      new Date(info.start.dateTime).getTime(),
    summary: info.summary,
    title: info.extraInfo.title,
    artist: info.extraInfo.artist,
  };
  if (includeImage) info.image = info.extraInfo.image;
  return info;
}

function selectFromList(items, title = "Select an option") {
  return new Promise((resolve) => {
    const screen = blessed.screen({
      smartCSR: true,
    });

    const box = blessed.box({
      width: 40,
      height: items.length + 4, // Height adjusts to list length
      top: 0,
      left: 0,
      border: "line",
      label: ` ${title} `,
    });

    const list = blessed.list({
      parent: box,
      width: "90%",
      height: "90%",
      top: 1,
      left: 2,
      items: ["hello"],
      items: items.map((item) => item.display),
      style: {
        selected: {
          bg: "blue",
          fg: "white",
        },
      },
      keys: true,
    });

    screen.append(box);
    list.focus();

    // Handle selection with enter
    list.on("select", (item) => {
      screen.destroy();
      resolve(items.find((i) => i.display == item.content));
    });

    // Handle escape/q to cancel
    screen.key(["escape", "q", "C-c"], () => {
      screen.destroy();
      resolve(null);
    });

    screen.render();
  });
}

// getStreamUrl("KUSC", "AC96").then((url) => console.log("Got url:", url));
// getCurrentMetadata("KUSC", false).then((metadata) => console.log(metadata));
selectFromList(
  streams.map((stream) => ({ display: stream.name, value: stream.id })),
).then(async (value) => {
  console.log("Got url:", await getStreamUrl(value.value));
  console.log("Currently playing:");
  console.log((await getCurrentMetadata(value.value)).summary);
});

export default {
  getStreamInfo,
  getCurrentMetadata,
  getStreamUrl,
};
