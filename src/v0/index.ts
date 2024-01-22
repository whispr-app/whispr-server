import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.redirect('/api');
  } else {
    res.redirect('../');
  }
});

export default router;
