export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const paths = Array.isArray(body.paths)
      ? body.paths
      : typeof body.path === 'string'
      ? [body.path]
      : ['/'];

    for (const path of paths) {
      await res.revalidate(path);
    }

    return res.status(200).json({ revalidated: true, paths });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Revalidation failed' });
  }
}
