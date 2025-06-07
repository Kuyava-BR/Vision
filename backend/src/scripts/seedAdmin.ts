import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida para o seeding.');

    const adminEmail = process.env.ADMIN_EMAIL || 'bruno12kuyava@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Livi@357';
    const adminName = 'Admin';

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('Usuário administrador já existe.');
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new User();
      admin.name = adminName;
      admin.email = adminEmail;
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.isActive = true;
      admin.permissions = ['all'];
      await admin.save();
      console.log('Usuário administrador padrão criado com sucesso!');
    }

    await AppDataSource.destroy();
    console.log('Conexão com o banco de dados fechada após o seeding.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar o usuário administrador:', error);
    process.exit(1);
  }
}

seedAdmin(); 