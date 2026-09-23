const { Client } = require('pg');

async function seed() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '250994@Ay',
    database: 'technically_db',
  });

  await client.connect();

  const categories = [
    { nameEn: 'Printing Press', nameAr: 'ماكينات طباعة', machines: ['Offset Printer', 'Digital Printer'] },
    { nameEn: 'CNC Machines', nameAr: 'ماكينات سي إن سي', machines: ['CNC Router', 'CNC Lathe'] },
    { nameEn: 'Injection Molding', nameAr: 'حقن بلاستيك', machines: ['Hydraulic Injection Molding', 'Electric Injection Molding'] },
    { nameEn: 'Packaging Machines', nameAr: 'ماكينات تعبئة وتغليف', machines: ['Shrink Wrap Machine', 'Vacuum Sealer'] },
    { nameEn: 'Textile Machinery', nameAr: 'ماكينات غزل ونسيج', machines: ['Weaving Loom', 'Spinning Machine'] },
    { nameEn: 'Laser Cutters', nameAr: 'ماكينات قص ليزر', machines: ['CO2 Laser Cutter', 'Fiber Laser Cutter'] },
    { nameEn: 'Welding Machines', nameAr: 'ماكينات لحام', machines: ['MIG Welder', 'TIG Welder'] },
    { nameEn: 'Woodworking Machinery', nameAr: 'ماكينات نجارة', machines: ['Table Saw', 'Wood Lathe'] },
    { nameEn: 'Food Processing', nameAr: 'ماكينات تصنيع أغذية', machines: ['Industrial Mixer', 'Meat Grinder'] },
    { nameEn: 'Heavy Equipment', nameAr: 'معدات ثقيلة', machines: ['Excavator', 'Bulldozer'] },
  ];

  try {
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO machine_categories (id, "nameEn", "nameAr") VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
        [cat.nameEn, cat.nameAr]
      );
      const catId = res.rows[0].id;
      
      for (const machine of cat.machines) {
        await client.query(
          `INSERT INTO machines (id, "nameEn", "nameAr", "categoryId") VALUES (gen_random_uuid(), $1, $2, $3)`,
          [machine, machine + ' (AR)', catId]
        );
      }
    }
    console.log('Seeding successful!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await client.end();
  }
}

seed();
