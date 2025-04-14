export default function handler(req, res) {
  if (req.method === 'POST') {
    const provided = req.body.password;
    const envPass = process.env.PASSWORD || '';
    if (envPass && provided === envPass) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(401).json({ valid: false, error: 'Invalid password' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}