import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'your_database',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    JwtModule.register({
      secret: 'your-secret-key', // TODO Use a strong secret in production
      signOptions: { expiresIn: '1h' },
    }),
    AccountModule,
  ],
})
export class AppModule {}
