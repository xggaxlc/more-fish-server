export interface IResponse {
  success?: boolean;
  data?: Array<any> | {};
  message?: string;
  meta?: {
    page: number;
    limit: number;
    count: number;
  };
}
