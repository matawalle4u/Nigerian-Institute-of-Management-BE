import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { SearchLicenseDto } from './dto/search-license.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { Login } from 'src/account/entities/login.entity';
import { JwtService } from '@nestjs/jwt';
import { PaymentOutStandingException } from 'src/payment/utils/OutstandingPaymentException';
import { Members } from 'src/membership/entities/membership.entity';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
    private readonly jwtService: JwtService,
    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
  ) {}

  async addLicense(
    token: string,
    createLicenseDto: CreateLicenseDto,
  ): Promise<object> {
    // Find the associated login entity
    const payload = this.jwtService.verify(token);
    const { email } = payload;
    //console.log(email);

    const login = await this.loginRepository.findOne({
      where: { email: email },
      relations: ['member'],
    });

    if (!login) {
      throw new Error('Login not found');
    }

    //retrieve the member outstanding balance and prompt to pay
    //console.log(login.member);
    //console.log(login.member.cumulativeCp <= 0);

    if (login.member.cumulativeCp <= 0) {
      return new PaymentOutStandingException(
        'Please pay all outstanding fees!',
      );
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

  async getLicenseByUserId(token, userId: number): Promise<License | null> {
    const payload = this.jwtService.verify(token);
    const { email } = payload;
    console.log(email);
    //console.log(email);

    const login = await this.loginRepository.findOne({
      where: { email: email },
    });

    //console.log(login);

    const licence = this.licenseRepository.findOne({
      where: { login: { id: userId } },
      relations: ['login'],
    });
    const member = this.memberRepository.findOne({
      where: { loginId: { id: (await licence).login.id } },
      relations: ['loginId'],
    });

    member
      .then((m) => {
        if (!m.cumulativeCp) {
          console.log('null');
          throw new PaymentOutStandingException(
            'Please pay all outstanding fees!',
          );
        }
      })
      .catch((r) => {
        console.log(r);
      });
    return licence;
  }
}
