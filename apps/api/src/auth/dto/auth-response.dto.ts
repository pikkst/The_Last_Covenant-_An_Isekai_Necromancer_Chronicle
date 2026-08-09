export class AuthResponseDto {
  accessToken: string;
  accountId: string;
  email: string;
  status: string;

  constructor(accessToken: string, accountId: string, email: string, status: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
    this.email = email;
    this.status = status;
  }
}
