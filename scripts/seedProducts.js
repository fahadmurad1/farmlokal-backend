const { pool } = require('../src/config/db');
const { faker } = require('@faker-js/faker');

async function seed() {
  const BATCH = 5000;
  const TOTAL = 1_000_000;

  for (let i = 0; i < TOTAL; i += BATCH) {
    const values = [];
    for (let j = 0; j < BATCH; j++) {
      values.push([
        faker.commerce.productName(),
        faker.commerce.productDescription(),
        Number(faker.commerce.price({ min: 10, max: 1000 })),
        faker.helpers.arrayElement(['milk', 'vegetable', 'fruit', 'grocery']),
      ]);
    }

    await pool.query(
      'INSERT INTO products (name, description, price, category) VALUES ?',
      [values]
    );
    console.log(`Inserted ${i + BATCH}/${TOTAL}`);
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
