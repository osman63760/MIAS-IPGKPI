export enum TaskType {
  IMAM = "Imam",
  BILAL = "Bilal",
}

export enum PrayerType {
  FARDU = "Solat Fardu",
  TERAWIH = "Solat Terawih",
  JUMAAT = "Solat Jumaat",
  LAIN = "Lain-lain",
}

export interface Rotation {
  id?: number;
  name: string;
  task: TaskType;
  prayer_type: PrayerType;
  duty_date: string;
  image_data?: string; // Base64
  created_at?: string;
}
