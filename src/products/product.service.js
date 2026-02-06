const { pool } = require('../config/db');
const { redis } = require('../config/redis');

async function listProducts(params) {
  const cacheKey = `products:${JSON.stringify(params)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { after, limit, sort, search, category, minPrice, maxPrice } = params;
  const [field, direction] = sort.split(':');

  const whereClauses = [];
  const values = [];

  if (search) {
    whereClauses.push('(name LIKE ? OR description LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    whereClauses.push('category = ?');
    values.push(category);
  }
  if (minPrice != null) {
    whereClauses.push('price >= ?');
    values.push(minPrice);
  }
  if (maxPrice != null) {
    whereClauses.push('price <= ?');
    values.push(maxPrice);
  }
  if (after) {
    whereClauses.push('id > ?');
    values.push(after);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const orderBy = `ORDER BY ${field} ${direction.toUpperCase()}`;
  const limitClause = 'LIMIT ?';
  values.push(limit);

  const sql = `SELECT id, name, description, price, category, createdAt
               FROM products
               ${where}
               ${orderBy}
               ${limitClause}`;
  const [rows] = await pool.query(sql, values);

  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
  const result = { items: rows, nextCursor };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
  return result;
}

module.exports = { listProducts };
