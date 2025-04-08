const axios = require("axios");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
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
    console.log(JSON.stringify(mp, null, 2));
    var tmp = {
      mount: mp.mount,
      format: mp.format,
      bitrate: mp.bitrate,
      url:
        server.ports.port.type +
        "://" +
        server.ip +
        ":" +
        server.ports.port["#text"],
    }; // store copy of mount mountpoint
    acc[mp.mount] = tmp;
    return acc;
  }, {});
  data = Object.values(data);
  console.log(data);
  return data;
}

async function getStreamUrl(streamId) {
  var streamInfo = await getStreamInfo(streamId);
  if (streamInfo.length === 0) {
    throw new Error("No streams found");
  }
  var preferredStream = "AAC96";
  var stream = {};
  if (streamInfo.filter((mp) => mp.mount.includes(preferredStream)).length > 0)
    stream = streamInfo.find((mp) => mp.mount.includes(preferredStream)).url;
  return stream.url + stream.mount + "/" + stream.fileType;
  // return streamInfo.then((info) => {
  //   var url = info.streams.stream.find((stream) => stream.id === streamId).url;
  //   return url;
  // });
}

getStreamUrl("KUSC").then((url) => console.log("Got url:", url));
