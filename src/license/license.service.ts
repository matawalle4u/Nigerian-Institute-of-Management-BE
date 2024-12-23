import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { SearchLicenseDto } from './dto/search-license.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { Login } from 'src/account/entities/login.entity';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
  ) {}

  async addLicense(createLicenseDto: CreateLicenseDto): Promise<License> {
    // Find the associated login entity
    const login = await this.loginRepository.findOne({
      where: { id: createLicenseDto.login }, // Assuming loginId is passed in the DTO
    });

    if (!login) {
      throw new Error('Login not found'); // Handle this as per your error handling strategy
    }

    const license = this.licenseRepository.create({
      ...createLicenseDto,
      login,
    });

    return this.licenseRepository.save(license);
  }

  async findAll(): Promise<License[]> {
    return this.licenseRepository.find({
      relations: ['login', 'login.member'],
    });
  }

  async findOne(id: number): Promise<License> {
    const license = await this.licenseRepository.findOne({
      where: { id },
      relations: ['login', 'login.member'],
    });
    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }
    return license;
  }

  async updateLicense(
    id: number,
    updateLicenseDto: UpdateLicenseDto,
  ): Promise<License> {
    const license = await this.findOne(id);
    Object.assign(license, updateLicenseDto);
    return this.licenseRepository.save(license);
  }

  async deleteLicense(id: number): Promise<void> {
    const result = await this.licenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }
  }
  async searchLicense(searchDto: SearchLicenseDto): Promise<License[]> {
    const { loginId, licenseNo } = searchDto;

    const query: any = {};
    if (loginId) query.login = { id: loginId };
    if (licenseNo) query.licenseNo = licenseNo;

    return this.licenseRepository.find({
      where: query,
      relations: ['login', 'login.member'],
    });
  }
}
