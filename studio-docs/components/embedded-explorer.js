import React, { useEffect } from "react";

const EMBEDDABLE_EXPLORER_URL =
  "https://explorer.embed.apollographql.com/?graphRef=Apollo-Fullstack-Demo-o3tsz8@current&docsPanelState=closed";

async function executeOperation({
  operation,
  operationName,
  variables,
  headers,
}) {
  if (
    headers &&
    Object.keys(headers).every((key) => key.toLowerCase() !== "content-type")
  ) {
    headers["content-type"] = "application/json";
  }
  const response = await fetch(
    "https://apollo-fullstack-tutorial.herokuapp.com/",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: operation,
        variables,
        operationName,
      }),
    }
  );
  return await response.json();
}

export const EmbeddedExplorer = () => {
  useEffect(() => {
    const onPostMessageReceived = (event) => {
      const isQueryOrMutation = event.data.name?.startsWith("ExplorerRequest:");
      const isSubscription = event.data.name?.startsWith(
        "ExplorerSubscriptionRequest:"
      );
      const currentOperationId = event.data.name?.split(":")[1];
      if ((isQueryOrMutation || isSubscription) && event.data.operation) {
        const { operation, operationName, variables, headers } = event.data;
        executeOperation({
          operation,
          operationName,
          variables,
          headers,
        }).then((response) => {
          document
            .getElementById("embedded-explorer")
            ?.contentWindow.postMessage(
              {
                name: isQueryOrMutation
                  ? `ExplorerResponse:${currentOperationId}`
                  : `ExplorerSubscriptionResponse:${currentOperationId}`,
                response,
              },
              EMBEDDABLE_EXPLORER_URL
            );
        });
      }
    };
    window.addEventListener("message", onPostMessageReceived);

    return () => window.removeEventListener("message", onPostMessageReceived);
  }, []);

  return (
    <iframe
      id="embedded-explorer"
      style={{
        width: "100%",
        height: 500,
        border: 0,
        borderRadius: 4,
        boxShadow: "0 4px 8px 0 rgba(0,0,0,0.04)",
      }}
      title="embedded-explorer"
      src={EMBEDDABLE_EXPLORER_URL}
    />
  );
};
