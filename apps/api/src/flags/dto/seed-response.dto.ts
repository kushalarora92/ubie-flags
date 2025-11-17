export interface SeedResponseDto {
  message: string;
  created: number;
  flags: Array<{
    key: string;
    name: string;
    environment: string;
  }>;
}
