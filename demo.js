import kusc from "./index.js";
// Usage:
kusc.selectStream().then(async (selected) => {
  if (selected) {
    selected = selected.value;
    console.log("Selected stream:", selected.name);
    // Use the selected.playerName to get the stream URL
    console.log("Got url:", await kusc.getStreamUrl(selected.playerName));
    console.log(
      "Got metadata:",
      (await kusc.getCurrentMetadata(selected.playerName)).summary,
    );
  }
});

