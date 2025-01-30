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
import { Payment } from 'src/payment/entities/payment.entity';
import { LicenseException } from './utils/LicenceExceptions';
import { PaymentService } from 'src/payment/payment.service';

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
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly paymentService: PaymentService,
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

    // if (login.member.cumulativeCp <= 0) {
    //   return new PaymentOutStandingException(
    //     'Please pay all outstanding fees!',
    //   );
    // }
    //Check for all outstanding
    const unpaidBills = await this.paymentService.getMemberUnpaidBills(
      login.id,
    );
    if (unpaidBills.length < 1) {
      return new PaymentOutStandingException(
        'Please pay all outstanding fees!',
      );
    }

    console.log(unpaidBills);

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

  async getUserLicense(token: string): Promise<License | null> {
    try {
      // console.log(token, userId);
      const payload = this.jwtService.verify(token);
      const { email } = payload;
      console.log(email);
      // Fetch the login details
      const login = await this.loginRepository.findOne({
        where: { email: email },
      });
      // console.log(login);
      if (!login) {
        throw new Error('Login not found');
      }

      // Fetch the license details
      const licence = await this.licenseRepository.findOne({
        where: { login: { email: email } },
        relations: ['login', 'login.member'],
        select: {
          licenseNo: true,
          login: {
            id: true,
            username: true,
            email: true,
            default_password: true,
            authority: true,
            status: true,
            member: {
              memberNo: true,
              firstName: true,
              lastName: true,
              phone: true,

              loginId: {
                email: true,
                authority: true,
              },
            },
          },
        },
      });

      if (!licence) {
        throw new LicenseException('No license found');
      }

      // Fetch the member details
      const member = await this.memberRepository.findOne({
        where: { loginId: { id: licence.login.id } },
        relations: ['loginId'],
      });

      if (!member) {
        throw new NotFoundException('No licence found for the user');
      }

      // Check cumulative CP and throw an exception if necessary
      // if (member.cumulativeCp) {
      //   throw new PaymentOutStandingException(
      //     'Please pay all outstanding fees!',
      //   );
      // }

      // Check for license expiration
      const expired = await this.isLicenseExpired(email);

      if (!expired) {
        return licence;
      } else {
        throw new LicenseException(
          'Your license has expired, please renew your license',
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async isLicenseExpired(email: string): Promise<boolean> {
    // Get the latest successful payment for the user
    const latestPayment = await this.paymentRepository.findOne({
      where: {
        payers: { email: email },
        status: 'success',
        otherInfo: 'License',
      },
      order: { createdAt: 'DESC' },
    });

    if (!latestPayment) {
      return true;
    }

    // Check if the payment was made more than 3 years ago
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    return latestPayment.createdAt <= threeYearsAgo;
  }
}

//Once they make payment the licence status is actvie for 3 years after which it expires
// Fresh user login
/* first check for outstanding bill 
if payment check is passed, check for license is active or expired.
 if expired promopt renewal fee for 10,000 valid for 3 years
 if not expired, it sends back the license information.
*/
