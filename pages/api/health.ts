import { readFileSync } from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Read the package.json file
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // Extract the version
      const version = packageJson.version;

      // Return the version in the response
      res.status(200).json({ status: 'healthy', version });
    } catch (error) {
      console.error('Error reading package.json:', error);
      res
        .status(500)
        .json({ status: 'error', message: 'Unable to retrieve version' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
