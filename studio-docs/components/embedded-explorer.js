import React, { useEffect } from 'react';

const EMBEDDABLE_EXPLORER_URL = 'https://embed.apollo.local:3000/?graphRef=acephei@current&docsPanelState=closed';

async function executeOperation({
  operation,
  operationName,
  variables,
  headers,
}) {
  if (
    headers &&
    Object.keys(headers).every(
      (key) => key.toLowerCase() !== 'content-type',
    )
  ) {
    headers['content-type'] = 'application/json';
  }
  const response = await fetch(
    "https://acephei-gateway.herokuapp.com",
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: operation,
        variables,
        operationName,
      }),
    },
  )
  return await response.json();
}

export const EmbeddedExplorer = () => {
  useEffect(() => {
    const onPostMessageReceived = (event) => {
      const isQueryOrMutation = event.data.name?.startsWith('ExplorerRequest:');
      const isSubscription = event.data.name?.startsWith('ExplorerSubscriptionRequest:');
      const currentOperationId = event.data.name?.split(':')[1]
      if(isQueryOrMutation || isSubscription) {
        if(event.data.operation){
          executeOperation({
            operation: event.data.operation,
            operationName: event.data.operationName,
            variables: event.data.variables,
            headers: event.data.headers,
          }).then((response) => {
            const embeddedExplorerIFrame = document.getElementById('embedded-explorer');
            embeddedExplorerIFrame.contentWindow.postMessage({
              name: isQueryOrMutation ?
                `ExplorerResponse:${currentOperationId}` :
                `ExplorerSubscriptionResponse:${currentOperationId}`,
              response,
            }, EMBEDDABLE_EXPLORER_URL);
          });
        }
      }
    }
    window.addEventListener('message', onPostMessageReceived);

    return () => window.removeEventListener('message', onPostMessageReceived);
  }, [])

  return (
      <iframe id="embedded-explorer" style={{width: '100%', height: 500, border: 0, borderRadius: 4, boxShadow: '0 4px 8px 0 rgba(0,0,0,0.04)'}} title="embedded-explorer" src={EMBEDDABLE_EXPLORER_URL}/>
  );
}
