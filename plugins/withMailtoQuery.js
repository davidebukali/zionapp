const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to ensure the AndroidManifest.xml contains the mailto scheme
 * in the <queries> element, surviving `expo prebuild` and EAS builds.
 */
function withMailtoQuery(config) {
  return withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults.manifest;
    manifest.queries = manifest.queries || [];

    if (manifest.queries.length === 0) {
      manifest.queries.push({ intent: [] });
    }

    const queriesEntry = manifest.queries[0];
    queriesEntry.intent = queriesEntry.intent || [];

    const hasMailtoScheme = queriesEntry.intent.some((intent) =>
      intent.data?.some(
        (dataItem) => dataItem.$ && dataItem.$["android:scheme"] === "mailto"
      )
    );

    if (!hasMailtoScheme) {
      queriesEntry.intent.push({
        action: [{ $: { "android:name": "android.intent.action.SENDTO" } }],
        data: [{ $: { "android:scheme": "mailto" } }],
      });
    }

    return manifestConfig;
  });
}

module.exports = withMailtoQuery;
