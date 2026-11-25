import { Router } from 'express';
import { db } from '../db.js';
import { requireTeam } from '../auth.js';

const router = Router();
router.use(requireTeam);

router.get('/', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.business, u.business_type, u.plan, u.created_at,
              COUNT(t.id) AS total,
              SUM(CASE WHEN t.status = 'submitted' THEN 1 ELSE 0 END) AS queued,
              SUM(CASE WHEN t.status IN ('progress', 'review') THEN 1 ELSE 0 END) AS active,
              SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done
       FROM users u LEFT JOIN tasks t ON t.client_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    )
    .all();
  res.json({
    clients: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      business: r.business,
      businessType: r.business_type,
      plan: r.plan,
      createdAt: r.created_at,
      tasks: { total: r.total, queued: r.queued || 0, active: r.active || 0, done: r.done || 0 },
    })),
  });
});

export default router;
