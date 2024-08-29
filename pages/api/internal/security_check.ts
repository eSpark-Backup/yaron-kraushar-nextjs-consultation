export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get the origin base URL
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const originBaseUrl = `${protocol}://${host}`;

      // Return the origin base URL in the response
      res.status(200).json({ status: 'origin_call', originBaseUrl });
    } catch (error) {
      console.error('Error retrieving origin base URL:', error);
      res
        .status(500)
        .json({
          status: 'error',
          message: 'Unable to retrieve origin base URL',
        });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
