export default function handler(req, res) {
  const envPass = process.env.PASSWORD || '';
  res.status(200).json({ requirePassword: !!envPass });
}
