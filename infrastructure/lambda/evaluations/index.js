exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const rawPath = event.rawPath || event.path || '';

  // Normalize path - remove stage prefix if present (e.g., /prod/health -> /health)
  const path = rawPath.replace(/^\/prod/, '') || '/';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  // Health check
  if (method === 'GET' && path === '/health') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ status: 'ok' })
    };
  }

  // POST /api/evaluations
  if (method === 'POST' && path === '/api/evaluations') {
    return await handleEvaluations(event);
  }

  return {
    statusCode: 404,
    headers: corsHeaders(),
    body: JSON.stringify({ error: 'Not found', path: rawPath })
  };
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

async function handleEvaluations(event) {
  try {
    const body = JSON.parse(event.body);
    const externalEntityId = body.external_entity_id;

    const authToken = Buffer.from(
      `${process.env.ALLOY_API_KEY}:${process.env.ALLOY_API_SECRET}`
    ).toString('base64');

    const response = await fetch(process.env.ALLOY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'alloy-workflow-token': process.env.ALLOY_WORKFLOW_TOKEN,
        'alloy-entity-token': process.env.ALLOY_ENTITY_TOKEN,
        'alloy-external-entity-id': externalEntityId,
        'alloy-entity-type': 'person',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: corsHeaders(),
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
}
