import { IsOptional, IsInt, IsString } from 'class-validator';

export class SearchLicenseDto {
  @IsOptional()
  @IsInt()
  loginId?: number;

  @IsOptional()
  @IsString()
  licenseNo?: string;
}
