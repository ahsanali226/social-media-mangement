import axios from 'axios';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';
const pageId = '1166330309893348';
const accessToken = 'EAAAnSpOzZAuVwBRliGP3ws1ffLmSkKpC4ZC0APz6vehptCk8QOQZA2cl8XCHjdZCbwGArTDpAuVVDfuMa67FZBmZAhVI2azj9e2DJfCsEI5bNsUDR7wob8yFZCy4v7m08sB29kZAboXOAlujjUvc6gRdu6Itgrb58V7BF3Bp2MG9yvoBzZAnnvlZC6bWBUj8KL6MwQ6h5lNcDhLVJbZCLwgHC5vrzL9uIkKyiv1CEwGZCK4vz5GfK8NrIEnZCTnpCkOBAIFB49oHkvZCSbfs8nGhqMTPiGL';

async function main() {
  const endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
  console.log(`Sending test request to Facebook Graph API: ${endpoint}`);

  try {
    const res = await axios.post(endpoint, null, {
      params: {
        message: 'Test post from SocialSync',
        access_token: accessToken,
      }
    });
    console.log('Success:', res.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Facebook Error Status:', error.response.status);
      console.error('Facebook Error Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

main();
